from app.models.datapoint_extraction_models import (
    BaseDataPoint,
    DataPoint,
    ExtractDatapointSubstringsReq,
    ExtractValuesReq,
    ExtractValuesReqDatapoint,
    PipelineReq,
    PipelineResDatapoint,
    DoubleCheckReq,
    DataPointSubstringMatch,
)
from app.services.datapoint_extraction.substrings import extract_datapoint_substrings_and_match_service
from app.services.datapoint_extraction.values import extract_values_service
from app.services.datapoint_extraction.double_check import double_check_service
from app.services.datapoint_extraction.regex_extraction import regex_extraction_service
from app.services.datapoint_extraction.rate_regex_matches import rate_regex_matches_service
from typing import List
import math
import json
import asyncio


def get_text_excerpt(text: str, match: tuple[int, int], overlap: int = 25) -> str:
    start, end = match
    start = max(0, start - overlap)
    end = min(len(text), end + overlap)
    return text[start:end]


def batch_list(items: List, batch_size: int) -> List[List]:
    """Split a list into batches of specified size."""
    return [items[i:i + batch_size] for i in range(0, len(items), batch_size)]


async def pipeline_service(req: PipelineReq) -> list[PipelineResDatapoint]:
    # Process datapoints in batches of 10
    batch_size = 10
    datapoint_batches = batch_list(req.datapoints, batch_size)
    
    # Create a list of coroutines for each batch
    batch_coroutines = []
    for batch in datapoint_batches:
        substring_req_datapoints: list[BaseDataPoint] = []
        for datapoint in batch:
            substring_req_datapoints.append(
                BaseDataPoint(
                    name=datapoint.name,
                    explanation=datapoint.explanation,
                    synonyms=datapoint.synonyms,
                )
            )
        
        batch_coroutines.append(
            extract_datapoint_substrings_and_match_service(
                ExtractDatapointSubstringsReq(
                    api_key=req.api_key,
                    llm_provider=req.llm_provider,
                    model=req.model,
                    llm_url=req.llm_url,
                    datapoints=substring_req_datapoints,
                    text=req.text,
                    max_tokens=req.max_tokens,
                    example=req.example,
                )
            )
        )
    
    # Process all batches in parallel
    batch_results = await asyncio.gather(*batch_coroutines)
    
    # Flatten the results
    all_substring_res = []
    for batch_result in batch_results:
        all_substring_res.extend(batch_result)

    # Identify substrings without a corresponding profile point and used profile points
    substrings_without_profile = {}
    used_profile_points = set()
    substrings_wo_profile_with_context = {}
    
    for substring in all_substring_res:
        corresponding_profile_point = get_corresponding_profile_point(
            req.datapoints, substring.name
        )
        if corresponding_profile_point is None:
            substrings_without_profile[substring.name] = substring.substring
            # Get context around the substring if we have a match
            if substring.match is not None:
                text_excerpt = get_text_excerpt(req.text, substring.match, overlap=50)
                substrings_wo_profile_with_context[substring.name] = {
                    "substring": substring.substring,
                    "text": text_excerpt
                }
            else:
                substrings_wo_profile_with_context[substring.name] = {
                    "substring": substring.substring,
                    "text": req.text  # Fallback to full text if no match
                }
        else:
            # Only mark as used if we have both a non-empty substring and a valid match
            if substring.substring and substring.substring.strip() and substring.match is not None:
                used_profile_points.add(substring.name)

    # Get remaining profile points
    remaining_profile_points = {
        point.name: {
            "name": point.name,
            "explanation": point.explanation,
            "synonyms": point.synonyms
        }
        for point in req.datapoints
        if point.name not in used_profile_points
    }

    # Double check unmatched substrings if any exist
    if substrings_without_profile:
        double_check_res = await double_check_service(
            DoubleCheckReq(
                extracted_substrings=substrings_wo_profile_with_context,
                profile_point_list=remaining_profile_points,
                api_key=req.api_key,
                llm_provider=req.llm_provider,
                model=req.model,
                llm_url=req.llm_url,
                max_tokens=req.max_tokens
            )
        )

        # Update substring_res with corrections and filter out unmatched
        updated_substring_res = []
        for substring in all_substring_res:
            if substring.name in double_check_res:
                correction = double_check_res[substring.name]
                if correction["correction"] != "NO_CORRESPONDING_PROFILE_POINT":
                    substring.name = correction["correction"]
                    updated_substring_res.append(substring)
            else:
                updated_substring_res.append(substring)
        
        all_substring_res = updated_substring_res

    # Run regex extraction on remaining profile points
    regex_matches = await regex_extraction_service(
        text=req.text,
        remaining_profile_points=remaining_profile_points
    )

    # Rate regex matches for each profile point
    for name, matches in regex_matches.items():
        if matches:  # Only rate if we found matches
            profile_point = remaining_profile_points[name]
            # Get text excerpts for each match
            match_texts = [get_text_excerpt(req.text, match, overlap=50) for match in matches]
            
            # Rate the matches
            rating_result = await rate_regex_matches_service(
                datapoint=profile_point,
                matches=match_texts,
                llm_provider=req.llm_provider,
                api_key=req.api_key,
                model=req.model,
                llm_url=req.llm_url,
                max_tokens=req.max_tokens
            )

            # If we have a valid selected match, add it to all_substring_res
            if rating_result["selected_match_index"] >= 0:
                selected_match = matches[rating_result["selected_match_index"]]
                # Create a new DataPointSubstringMatch for the selected match
                new_substring = DataPointSubstringMatch(
                    name=name,
                    substring=match_texts[rating_result["selected_match_index"]],
                    match=selected_match
                )
                all_substring_res.append(new_substring)
                # Mark this profile point as used
                used_profile_points.add(name)

    # get text excerpts and prepare for value extraction
    extract_values_datapoints: list[ExtractValuesReqDatapoint] = []
    for substring in all_substring_res:
        corresponding_profile_point = get_corresponding_profile_point(
            req.datapoints, substring.name
        )

        if substring.match is not None and corresponding_profile_point is not None:
            text_excerpt = get_text_excerpt(req.text, substring.match)
            extract_values_datapoints.append(
                ExtractValuesReqDatapoint(
                    name=substring.name,
                    text_excerpt=text_excerpt,
                    datatype=corresponding_profile_point.datatype,
                    valueset=corresponding_profile_point.valueset,
                    unit=corresponding_profile_point.unit,
                    explanation=corresponding_profile_point.explanation,
                    synonyms=corresponding_profile_point.synonyms,
                )
            )

    # Process value extraction in batches
    value_batches = batch_list(extract_values_datapoints, batch_size)
    all_extract_values_res = {}

    for batch in value_batches:
        batch_extract_values_res = await extract_values_service(
            ExtractValuesReq(
                api_key=req.api_key,
                llm_provider=req.llm_provider,
                model=req.model,
                llm_url=req.llm_url,
                datapoints=batch,
                max_tokens=req.max_tokens,
            )
        )
        all_extract_values_res.update(batch_extract_values_res)

    # merge results
    pipeline_res_datapoints: list[PipelineResDatapoint] = []
    for substring in all_substring_res:
        corresponding_value = get_corresponding_value_point(
            all_extract_values_res, substring.name
        )
        pipeline_res_datapoints.append(
            PipelineResDatapoint(
                name=substring.name,
                match=substring.match,
                value=corresponding_value,
            )
        )

    # Deduplicate results
    deduplicated_results = {}
    for result in pipeline_res_datapoints:
        if result.name not in deduplicated_results:
            deduplicated_results[result.name] = result
        else:
            existing = deduplicated_results[result.name]
            # If existing has no value, replace it
            if existing.value is None:
                deduplicated_results[result.name] = result
            # If new has no value, keep existing
            elif result.value is None:
                continue
            # If existing has no match but new has match, replace it
            elif existing.match is None and result.match is not None:
                deduplicated_results[result.name] = result
            # Otherwise keep existing (first one found)
            else:
                continue

    # Convert back to list
    pipeline_res_datapoints = list(deduplicated_results.values())

    return pipeline_res_datapoints


def get_corresponding_value_point(
    extract_values_res: dict[str, str], name: str
) -> str | None:
    if name in extract_values_res:
        return extract_values_res[name]
    return None


def get_corresponding_profile_point(
    profile_points: list[DataPoint], name: str
) -> DataPoint | None:
    for profile_point in profile_points:
        if profile_point.name == name:
            return profile_point
    return None


async def process_batch(
    batch_index: int,
    total_batches: int,
    req: PipelineReq,
    substring_req_datapoints: list[BaseDataPoint]
) -> List:
    batch_start_time = time.time()
    console.print(f"[cyan]Starting batch {batch_index + 1}/{total_batches}[/cyan]")
    
    result = await extract_datapoint_substrings_and_match_service(
        ExtractDatapointSubstringsReq(
            api_key=req.api_key,
            llm_provider=req.llm_provider,
            model=req.model,
            llm_url=req.llm_url,
            datapoints=substring_req_datapoints,
            text=req.text,
            max_tokens=req.max_tokens,
            example=req.example,
        )
    )
    
    batch_time = time.time() - batch_start_time
    console.print(f"[green]Completed batch {batch_index + 1}/{total_batches} in {batch_time:.2f} seconds[/green]")
    return result
