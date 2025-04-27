from app.models.datapoint_extraction_models import DataPoint
import re
from typing import Dict, List, Tuple

async def regex_extraction_service(
    text: str,
    remaining_profile_points: Dict[str, Dict[str, List[str]]]
) -> Dict[str, List[Tuple[int, int]]]:
    """
    Run regex patterns against the text for remaining profile points.
    
    Args:
        text: The text to search in
        remaining_profile_points: Dictionary of profile points that didn't have matches
        
    Returns:
        Dictionary mapping profile point names to list of (start, end) positions of matches
    """
    results = {}
    
    if not remaining_profile_points:
        return results
    
    for name, profile_point in remaining_profile_points.items():
        # Create patterns for name and synonyms
        patterns = [re.escape(name)]
        if profile_point.get("synonyms"):
            patterns.extend([re.escape(syn) for syn in profile_point["synonyms"]])
        
        # Combine patterns with word boundaries
        combined_pattern = r'\b(' + '|'.join(patterns) + r')\b'
        
        # Find all matches
        matches = list(re.finditer(combined_pattern, text, re.IGNORECASE))
        
        if matches:
            # Store start and end positions of matches
            results[name] = [(m.start(), m.end()) for m in matches]
    
    return results 