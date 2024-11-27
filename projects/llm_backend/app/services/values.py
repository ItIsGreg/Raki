from typing import Callable
from app.llm_calls import call_llm
from app.models.models import ExtractValuesReq
from app.prompts.values import Extract_Values_Prompt_List
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
    result = await call_llm_function(
        lang_prompts[lang],
        {
            "datapoints": req.datapoints,
        },
        llm_provider=req.llm_provider,
        api_key=req.api_key,
        model=req.model,
        llm_url=req.llm_url,
    )

    return result
