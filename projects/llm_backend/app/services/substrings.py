from typing import Callable
from app.llm_calls import call_llm
from app.models.models import ExtractDatapointSubstringsReq
from app.prompts.substrings import (
    Extract_Datapoint_Substrings_Prompt_List,
)

prompt_list = Extract_Datapoint_Substrings_Prompt_List()


async def extract_datapoint_substrings_service(
    req: ExtractDatapointSubstringsReq,
    call_llm_function: Callable = call_llm,
):
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
    return result
