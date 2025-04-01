from typing import Callable, List
from rich import print as rprint
from rich.console import Console
from rich.panel import Panel

from app.llm_calls import call_llm
from app.prompts.text_segmentation.segments import Text_Segmentation_Prompt_List
from app.config.environment import prompt_language
from app.utils.matching import get_matches
from app.models.text_segmentation_models import (
    SegmentationProfilePoint,
    TextSegmentationReq,
    TextSegmentationResult,
)

# Initialize prompt list
prompt_list = Text_Segmentation_Prompt_List()

console = Console()

async def text_segmentation_service(
    req: TextSegmentationReq,
    lang: str = prompt_language,
    call_llm_function: Callable = call_llm,
) -> List[TextSegmentationResult]:
    """
    Service to identify text segments based on profile points.
    
    Args:
        req: TextSegmentationReq object containing text, profile points, and LLM config
        lang: Language code, either "en" for English or "de" for German
        call_llm_function: Function to call the LLM (for testing purposes)
        
    Returns:
        List of TextSegmentationResult objects containing segment matches
    """

    # Select the appropriate prompt based on language
    lang_prompts = {
        "de": prompt_list.text_segmentation_prompt_german,
        "en": prompt_list.text_segmentation_prompt,
    }
    
    # Convert Pydantic models to raw JSON/dict
    profile_points_json = [point.model_dump() for point in req.profile_points]
    
    # Call LLM with the prompt
    result = await call_llm_function(
        lang_prompts[lang],
        {
            "profile_points": profile_points_json,
            "text": req.text,
        },
        llm_provider=req.llm_provider,
        model=req.model,
        llm_url=req.llm_url,
        api_key=req.api_key,
        max_tokens=req.max_tokens,
    )
    
    # Process the result
    segments_with_matches = []
    
    for segment_name, boundaries in result.items():
        try:
            # Validate boundaries
            if not isinstance(boundaries, dict) or "begin" not in boundaries or "end" not in boundaries:
                continue
                
            # Find matches for begin and end substrings
            
            begin_matches = get_matches(req.text, boundaries["begin"])
            end_matches = get_matches(req.text, boundaries["end"])
            
            # Create result object
            segment_result = TextSegmentationResult(
                name=segment_name,
                begin_match=begin_matches[0] if begin_matches else None,
                end_match=end_matches[0] if end_matches else None,
            )
            
            segments_with_matches.append(segment_result)
        except Exception as e:
            rprint(f"[red]❌ Error processing segment {segment_name}:[/red] {str(e)}")
            continue
    
    return segments_with_matches
