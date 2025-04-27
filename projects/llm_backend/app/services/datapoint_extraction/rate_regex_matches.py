from typing import Callable, Dict, List, Tuple
from app.llm_calls import call_llm
from app.prompts.datapoint_extraction.rate_regex_extractions import Rate_Regex_Matches_Prompt_List
from app.config.environment import prompt_language
import json

prompt_list = Rate_Regex_Matches_Prompt_List()


async def rate_regex_matches_service(
    datapoint: Dict,
    matches: List[str],
    llm_provider: str,
    api_key: str,
    model: str,
    llm_url: str,
    max_tokens: int,
    lang: str = prompt_language,
    call_llm_function: Callable = call_llm,
) -> Dict:
    """
    Rate regex matches for a datapoint using LLM.
    
    Args:
        datapoint: Dictionary containing datapoint definition
        matches: List of text excerpts containing potential matches
        llm_provider: LLM provider to use
        api_key: API key for the LLM provider
        model: Model to use
        llm_url: URL for the LLM provider
        max_tokens: Maximum tokens to use
        lang: Language to use for prompts (default: from environment)
        call_llm_function: Function to call LLM (default: call_llm)
        
    Returns:
        Dictionary containing:
        - selected_match_index: Index of the best match (-1 if none suitable)
        - explanation: Explanation of the selection
        - match_ratings: List of ratings for each match
    """
    lang_prompts = {
        "de": prompt_list.rate_regex_matches_german,
        "en": prompt_list.rate_regex_matches,
    }

    result = await call_llm_function(
        lang_prompts[lang],
        {
            "datapoint": datapoint,
            "matches": matches,
        },
        llm_provider=llm_provider,
        api_key=api_key,
        model=model,
        llm_url=llm_url,
        max_tokens=max_tokens,
    )

    def convert_result(result: dict) -> dict:
        # Handle case where result is a string
        if isinstance(result, str):
            try:
                result = json.loads(result)
            except json.JSONDecodeError:
                print(f"[ERROR] Failed to parse result as JSON: {result}")
                return {
                    "selected_match_index": -1,
                    "explanation": "Failed to parse LLM response",
                    "match_ratings": []
                }
        
        # Ensure all required fields are present
        if not isinstance(result, dict):
            print(f"[ERROR] Unexpected result format: {result}")
            return {
                "selected_match_index": -1,
                "explanation": "Invalid response format",
                "match_ratings": []
            }
            
        # Ensure all required fields are present
        required_fields = ["selected_match_index", "explanation", "match_ratings"]
        for field in required_fields:
            if field not in result:
                print(f"[ERROR] Missing required field: {field}")
                return {
                    "selected_match_index": -1,
                    "explanation": f"Missing required field: {field}",
                    "match_ratings": []
                }
        
        return result

    result = convert_result(result)
    return result 