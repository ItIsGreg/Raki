from typing import Callable
from app.llm_calls import call_llm
from app.models.datapoint_extraction_models import ExtractValuesReq
from app.prompts.datapoint_extraction.values import Extract_Values_Prompt_List
from app.config.environment import prompt_language


prompt_list = Extract_Values_Prompt_List()


async def extract_values_service(
    req: ExtractValuesReq,
    lang: str = prompt_language,
    call_llm_function: Callable = call_llm,
):

    lang_prompts = {
        "de": prompt_list.extract_values_german,
        "en": prompt_list.extract_values,
    }

    datapoints_json = [datapoint.model_dump() for datapoint in req.datapoints]

    result = await call_llm_function(
        lang_prompts[lang],
        {
            "datapoints": datapoints_json,  # Pass JSON instead of Pydantic models
        },
        llm_provider=req.llm_provider,
        api_key=req.api_key,
        model=req.model,
        llm_url=req.llm_url,
        max_tokens=req.max_tokens,
    )

    return result
