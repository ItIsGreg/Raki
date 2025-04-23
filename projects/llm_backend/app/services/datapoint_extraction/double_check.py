from typing import Callable
from app.llm_calls import call_llm
from app.models.datapoint_extraction_models import DoubleCheckReq
from app.prompts.datapoint_extraction.double_check import DoubleCheckTemplateList
from app.config.environment import prompt_language
from langchain.prompts import PromptTemplate
import json


prompt_list = DoubleCheckTemplateList()


async def double_check_service(
    req: DoubleCheckReq,
    lang: str = prompt_language,
    call_llm_function: Callable = call_llm,
):
    """
    Service to double check extracted datapoints against a profile point list.
    
    Args:
        req: The request containing extracted substrings, profile point list
        lang: The language to use for prompts
        call_llm_function: The function to call the LLM
    
    Returns:
        The LLM's response containing corrections and reasoning
    """
    prompt = PromptTemplate(
        template=prompt_list.double_check,
        input_variables=["extracted_substrings", "profile_point_list"]
    )

    result = await call_llm_function(
        prompt,
        {
            "extracted_substrings": req.extracted_substrings,
            "profile_point_list": req.profile_point_list,
        },
        llm_provider=req.llm_provider,
        api_key=req.api_key,
        model=req.model,
        llm_url=req.llm_url,
        max_tokens=req.max_tokens,
    )

    # Handle case where result is a string
    if isinstance(result, str):
        try:
            result = json.loads(result)
        except json.JSONDecodeError:
            print(f"[ERROR] Failed to parse double check result as JSON: {result}")
            return {}

    return result
