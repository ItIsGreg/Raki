from app.models.datapoint_extraction_models import (
    BaseDataPoint,
    DataPoint,
    ExtractDatapointSubstringsReq,
    ExtractValuesReq,
    ExtractValuesReqDatapoint,
    PipelineReq,
    PipelineResDatapoint,
    DoubleCheckReq,
)
from app.services.datapoint_extraction.substrings import extract_datapoint_substrings_and_match_service
from app.services.datapoint_extraction.values import extract_values_service
from app.services.datapoint_extraction.double_check import double_check_service


def get_text_excerpt(text: str, match: tuple[int, int], overlap: int = 25) -> str:
    start, end = match
    start = max(0, start - overlap)
    end = min(len(text), end + overlap)
    return text[start:end]


async def pipeline_service(req: PipelineReq) -> list[PipelineResDatapoint]:
    # extract substrings and match
    substring_req_datapoints: list[BaseDataPoint] = []
    for datapoint in req.datapoints:
        substring_req_datapoints.append(
            BaseDataPoint(
                name=datapoint.name,
                explanation=datapoint.explanation,
                synonyms=datapoint.synonyms,
            )
        )
    substring_res = await extract_datapoint_substrings_and_match_service(
        ExtractDatapointSubstringsReq(
            api_key=req.api_key,
            llm_provider=req.llm_provider,
            model=req.model,
            llm_url=req.llm_url,
            datapoints=substring_req_datapoints,
            text=req.text,
            max_tokens=req.max_tokens,
        )
    )

    # Identify unmatched substrings and used profile points
    unmatched_substrings = {}
    used_profile_points = set()
    unmatched_substrings_with_context = {}
    
    for substring in substring_res:
        corresponding_profile_point = get_corresponding_profile_point(
            req.datapoints, substring.name
        )
        if corresponding_profile_point is None:
            unmatched_substrings[substring.name] = substring.substring
            # Get context around the substring if we have a match
            if substring.match is not None:
                text_excerpt = get_text_excerpt(req.text, substring.match, overlap=50)
                unmatched_substrings_with_context[substring.name] = {
                    "substring": substring.substring,
                    "text": text_excerpt
                }
            else:
                unmatched_substrings_with_context[substring.name] = {
                    "substring": substring.substring,
                    "text": req.text  # Fallback to full text if no match
                }
        else:
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
    if unmatched_substrings:
        double_check_res = await double_check_service(
            DoubleCheckReq(
                extracted_substrings=unmatched_substrings_with_context,
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
        for substring in substring_res:
            if substring.name in double_check_res:
                correction = double_check_res[substring.name]
                if correction["correction"] != "NO_CORRESPONDING_PROFILE_POINT":
                    substring.name = correction["correction"]
                    updated_substring_res.append(substring)
            else:
                updated_substring_res.append(substring)
        
        substring_res = updated_substring_res

    # get text excerpts
    extract_values_datapoints: list[ExtractValuesReqDatapoint] = []
    for substring in substring_res:
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

    # extract values
    extract_values_res = await extract_values_service(
        ExtractValuesReq(
            api_key=req.api_key,
            llm_provider=req.llm_provider,
            model=req.model,
            llm_url=req.llm_url,
            datapoints=extract_values_datapoints,
            max_tokens=req.max_tokens,
        )
    )

    # merge results
    pipeline_res_datapoints: list[PipelineResDatapoint] = []
    for substring in substring_res:
        corresponding_value = get_corresponding_value_point(
            extract_values_res, substring.name
        )
        pipeline_res_datapoints.append(
            PipelineResDatapoint(
                name=substring.name,
                match=substring.match,
                value=corresponding_value,
            )
        )
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
