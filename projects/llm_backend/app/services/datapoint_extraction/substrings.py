from typing import Callable
from uu import Error
from rich import print
from rich.panel import Panel
from rich.syntax import Syntax
import json

from app.llm_calls import call_llm
from app.models.datapoint_extraction_models import (
    DataPointSubstring,
    DataPointSubstringMatch,
    ExtractDatapointSubstringsReq,
    SelectSubstringReq,
)
from app.prompts.datapoint_extraction.substrings import (
    Extract_Datapoint_Substrings_Prompt_List,
)
from app.config.environment import prompt_language
from app.utils.matching import create_select_substring_text_excerpt, get_matches

prompt_list = Extract_Datapoint_Substrings_Prompt_List()


async def extract_datapoint_substrings_service(
    req: ExtractDatapointSubstringsReq,
    lang: str = prompt_language,
    call_llm_function: Callable = call_llm,
) -> list[DataPointSubstring]:

    lang_prompts = {
        "de": prompt_list.extract_datapoint_substrings_german,
        "en": prompt_list.extract_datapoint_substrings,
    }

    # Convert Pydantic models to raw JSON/dict
    datapoints_json = [datapoint.model_dump() for datapoint in req.datapoints]

    # Create example section
    example_section = prompt_list.create_example_section(req.example)

    result = await call_llm_function(
        lang_prompts[lang],
        {
            "datapoints": datapoints_json,
            "text": req.text,
            "example": req.example.model_dump() if req.example else None,
            "example_section": example_section
        },
        llm_provider=req.llm_provider,
        model=req.model,
        llm_url=req.llm_url,
        api_key=req.api_key,
        max_tokens=req.max_tokens,
    )

    def convert_result(result: dict) -> list[DataPointSubstring]:
        # Handle case where result is a string
        if isinstance(result, str):
            try:
                result = json.loads(result)
            except json.JSONDecodeError:
                print(f"[ERROR] Failed to parse result as JSON: {result}")
                return []
        
        # Handle case where result is a dictionary with string values
        if isinstance(result, dict):
            return [
                DataPointSubstring(
                    name=key,
                    substring=value["substring"] if isinstance(value, dict) and "substring" in value else value
                )
                for key, value in result.items()
            ]
        
        print(f"[ERROR] Unexpected result format: {result}")
        return []

    result = convert_result(result)

    return result


async def extract_datapoint_substrings_and_match_service(
    req: ExtractDatapointSubstringsReq,
    lang: str = prompt_language,
    call_llm_function: Callable = call_llm,
) -> list[DataPointSubstringMatch]:
    datapoints_wo_match = await extract_datapoint_substrings_service(
        req,
        lang,
        call_llm_function,
    )
    datapoints_w_matches: list[DataPointSubstringMatch] = []

    # Match substrings
    for datapoint in datapoints_wo_match:
        matches = get_matches(req.text, datapoint.substring)
        if not matches:
            datapoints_w_matches.append(
                DataPointSubstringMatch(
                    name=datapoint.name,
                    substring=datapoint.substring,
                    match=None,
                )
            )
            continue

        # if there are multiple matches, make another llm call to select the correct one
        if len(matches) > 1:
            text_excerpts = []
            for match in matches:
                text_excerpts.append(
                    create_select_substring_text_excerpt(match, req.text)
                )
            base_datapoint = next(
                (dp for dp in req.datapoints if dp.name == datapoint.name), None
            )
            index = await select_substring_service(
                SelectSubstringReq(
                    api_key=req.api_key,
                    llm_provider=req.llm_provider,
                    model=req.model,
                    llm_url=req.llm_url,
                    datapoint=base_datapoint,
                    substrings=text_excerpts,
                    max_tokens=req.max_tokens,
                )
            )
            try:
                # Handle case where index is just a number
                if isinstance(index, int):
                    selected_index = index
                # Handle case where index is a dict with "index" key
                elif isinstance(index, dict) and "index" in index:
                    selected_index = index["index"]
                else:
                    selected_index = 0  # Default to first match if format is invalid

                datapoint_w_match = DataPointSubstringMatch(
                    name=datapoint.name,
                    substring=datapoint.substring,
                    match=matches[selected_index],
                )
                datapoints_w_matches.append(datapoint_w_match)
            except (IndexError, TypeError) as e:
                datapoints_w_matches.append(
                    DataPointSubstringMatch(
                        name=datapoint.name,
                        substring=datapoint.substring,
                        match=None,
                    )
                )
        else:
            datapoints_w_matches.append(
                DataPointSubstringMatch(
                    name=datapoint.name,
                    substring=datapoint.substring,
                    match=matches[0],
                )
            )

    return datapoints_w_matches


async def select_substring_service(
    req: SelectSubstringReq,
    lang: str = prompt_language,
    call_llm_function: Callable = call_llm,
) -> dict:

    lang_prompts = {
        "de": prompt_list.select_substring_german,
        "en": prompt_list.select_substring,
    }
    
    # Handle case where datapoint is None
    datapoint_data = req.datapoint.model_dump() if req.datapoint else None
    
    result = await call_llm_function(
        lang_prompts[lang],
        {
            "datapoint": datapoint_data,  # Convert to JSON or None
            "substrings": req.substrings,
        },
        llm_provider=req.llm_provider,
        llm_url=req.llm_url,
        model=req.model,
        api_key=req.api_key,
        max_tokens=req.max_tokens,
    )

    return result
