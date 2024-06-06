from typing import Callable, Tuple

from h11 import Data
from openai import BaseModel
from app.llm_calls import call_llm
from app.models.models import ExtractDatapointSubstringsReq
from app.prompts.substrings import (
    Extract_Datapoint_Substrings_Prompt_List,
)
from app.utils.matching import get_matches

prompt_list = Extract_Datapoint_Substrings_Prompt_List()


class DataPointSubstring(BaseModel):
    name: str
    substring: str


class DataPointSubstringMatch(DataPointSubstring):
    match: Tuple[int, int] | None


async def extract_datapoint_substrings_service(
    req: ExtractDatapointSubstringsReq,
    call_llm_function: Callable = call_llm,
) -> list[DataPointSubstring]:
    result = await call_llm_function(
        prompt_list.extract_datapoint_substrings,
        {
            "datapoints": req.datapoints,
            "text": req.text,
        },
        llm_provider=req.llm_provider,
        model=req.model,
        api_key=req.api_key,
    )

    def convert_result(result: dict) -> list[DataPointSubstring]:
        return [
            DataPointSubstring(name=key, substring=value)
            for key, value in result.items()
        ]

    result = convert_result(result)

    return result


async def extract_datapoint_substrings_and_match_service(
    req: ExtractDatapointSubstringsReq,
    call_llm_function: Callable = call_llm,
) -> list[DataPointSubstringMatch]:
    datapoints_wo_match = await extract_datapoint_substrings_service(
        req,
        call_llm_function,
    )
    datapoints_w_matches: list[DataPointSubstringMatch] = []

    print("text", req.text)

    # Match substrings
    for datapoint in datapoints_wo_match:
        print("datapoint", datapoint)
        matches = get_matches(req.text, datapoint.substring)
        print("matches", matches)
        if not matches:
            datapoints_w_matches.append(
                DataPointSubstringMatch(
                    name=datapoint.name,
                    substring=datapoint.substring,
                    match=None,
                )
            )
            continue
        for match in matches:
            datapoint_w_match = DataPointSubstringMatch(
                name=datapoint.name,
                substring=datapoint.substring,
                match=match,
            )
            datapoints_w_matches.append(datapoint_w_match)

    return datapoints_w_matches
    #
