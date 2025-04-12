from typing import Callable

from app.llm_calls import call_llm
from app.models.text_segmentation_models import DoubleCheckReq
from app.prompts.text_segmentation.double_check import TextSegmentationDoubleCheckPrompt
from app.config.environment import prompt_language


prompt_list = TextSegmentationDoubleCheckPrompt()


async def double_check_service(
    req: DoubleCheckReq,
    lang: str = prompt_language,
    call_llm_function: Callable = call_llm,
):
    """
    Service to double check identified segments against a profile point list.
    
    Args:
        req: The request containing identified segments, profile point list
        lang: The language to use for prompts
        call_llm_function: The function to call the LLM
    
    Returns:
        The LLM's response containing corrections and reasoning
    """
    
    try:
                    
        result = await call_llm_function(
            prompt_list.double_check,
            {
                "identified_segments": req.identified_segments,
                "profile_point_list": req.profile_point_list,
            },
            llm_provider=req.llm_provider,
            api_key=req.api_key,
            model=req.model,
            llm_url=req.llm_url,
            max_tokens=req.max_tokens,
        )
        
        return result
        
    except Exception as e:
        raise e
