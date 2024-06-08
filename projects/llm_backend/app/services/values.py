from typing import Callable
from pydantic import BaseModel
from app.llm_calls import call_llm
from app.models.models import ExtractValuesReq
from app.prompts.values import Extract_Values_Prompt_List


prompt_list = Extract_Values_Prompt_List()


async def extract_values_service(
    req: ExtractValuesReq, call_llm_function: Callable = call_llm
):
    result = await call_llm_function(
        prompt_list.extract_values,
        {
            "datapoints": req.datapoints,
        },
        llm_provider=req.llm_provider,
        api_key=req.api_key,
        model=req.model,
    )

    return result
