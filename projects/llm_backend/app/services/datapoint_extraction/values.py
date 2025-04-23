from typing import Callable
from app.llm_calls import call_llm
from app.models.datapoint_extraction_models import ExtractValuesReq
from app.prompts.datapoint_extraction.values import Extract_Values_Prompt_List
from app.config.environment import prompt_language
import json


prompt_list = Extract_Values_Prompt_List()


async def extract_values_service(
    req: ExtractValuesReq,
    lang: str = prompt_language,
    call_llm_function: Callable = call_llm,
) -> dict:

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

    def convert_result(result: dict) -> dict:
        # Handle case where result is a string
        if isinstance(result, str):
            try:
                result = json.loads(result)
            except json.JSONDecodeError:
                print(f"[ERROR] Failed to parse result as JSON: {result}")
                return {}
        
        # Handle case where result is a dictionary with string values
        if isinstance(result, dict):
            return {
                key: value["value"] if isinstance(value, dict) and "value" in value else value
                for key, value in result.items()
            }
        
        print(f"[ERROR] Unexpected result format: {result}")
        return {}

    result = convert_result(result)

    return result
