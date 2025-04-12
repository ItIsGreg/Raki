from typing import Callable, List

from app.llm_calls import call_llm
from app.prompts.text_segmentation.segments import Text_Segmentation_Prompt_List
from app.config.environment import prompt_language
from app.utils.matching import get_matches
from app.models.text_segmentation_models import (
    SegmentationProfilePoint,
    TextSegmentationReq,
    TextSegmentationResult,
    DoubleCheckReq,
)
from app.services.text_segmentation.double_check import double_check_service

# Initialize prompt list
prompt_list = Text_Segmentation_Prompt_List()

def get_corresponding_profile_point(
    profile_points: list[SegmentationProfilePoint], name: str
) -> SegmentationProfilePoint | None:
    for profile_point in profile_points:
        if profile_point.name == name:
            return profile_point
    return None

def get_segment_text(text: str, begin_match: List[int], end_match: List[int]) -> str:
    """
    Extract the text segment between begin and end matches.
    
    Args:
        text: The full text
        begin_match: List containing [start_index, end_index] of begin match
        end_match: List containing [start_index, end_index] of end match
        
    Returns:
        The extracted segment text
    """
    if not begin_match or not end_match:
        return text  # Fallback to full text if no matches found
        
    start_idx = begin_match[0]
    end_idx = end_match[1]
    return text[start_idx:end_idx]

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
    unmatched_segments = {}
    used_profile_points = set()
    
    
    for segment_name, boundaries in result.items():
        try:
            # Validate boundaries
            if not isinstance(boundaries, dict) or "begin" not in boundaries or "end" not in boundaries:
                continue
                
            # Find matches for begin and end substrings
            begin_matches = get_matches(req.text, boundaries["begin"])
            offset_index = begin_matches[0][1] if begin_matches else 0
            end_matches = get_matches(req.text, boundaries["end"], offset_index)
            
            # Check if segment corresponds to a valid profile point
            corresponding_profile_point = get_corresponding_profile_point(req.profile_points, segment_name)
            
            if corresponding_profile_point is None:
                # Store unmatched segment with context
                segment_text = get_segment_text(req.text, begin_matches[0] if begin_matches else None, end_matches[0] if end_matches else None)
                unmatched_segments[segment_name] = {
                    "begin": boundaries["begin"],
                    "end": boundaries["end"],
                    "text": segment_text
                }
            else:
                used_profile_points.add(segment_name)
                # Create result object for valid segments
                segment_result = TextSegmentationResult(
                    name=segment_name,
                    begin_match=begin_matches[0] if begin_matches else None,
                    end_match=end_matches[0] if end_matches else None,
                )
                segments_with_matches.append(segment_result)

        except Exception as e:
            continue
    
    # Get remaining profile points
    remaining_profile_points = {
        point.name: {
            "name": point.name,
            "explanation": point.explanation,
            "synonyms": point.synonyms
        }
        for point in req.profile_points
        if point.name not in used_profile_points
    }
    
    # Double check unmatched segments if any exist
    if unmatched_segments:
        
        try:
            double_check_res = await double_check_service(
                DoubleCheckReq(
                    identified_segments=unmatched_segments,
                    profile_point_list=remaining_profile_points,
                    api_key=req.api_key,
                    llm_provider=req.llm_provider,
                    model=req.model,
                    llm_url=req.llm_url,
                    max_tokens=req.max_tokens
                )
            )
            
            if double_check_res is None:
                raise Exception("Double check service returned no results")
            else:
                
                # Process double check results
                for segment_name, correction in double_check_res.items():
                    if correction["correction"] != "NO_CORRESPONDING_PROFILE_POINT":
                        # Find the original boundaries
                        boundaries = result[segment_name]
                        begin_matches = get_matches(req.text, boundaries["begin"])
                        offset_index = begin_matches[0][1] if begin_matches else 0
                        end_matches = get_matches(req.text, boundaries["end"], offset_index)
                        
                        # Create result object with corrected name
                        segment_result = TextSegmentationResult(
                            name=correction["correction"],
                            begin_match=begin_matches[0] if begin_matches else None,
                            end_match=end_matches[0] if end_matches else None,
                        )
                        segments_with_matches.append(segment_result)
        except Exception as e:
            print(f"[red]Error in text segmentation service:[/red] {e}")
    
    
    return segments_with_matches
