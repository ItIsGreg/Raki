from typing import List, Optional, Dict
from pydantic import BaseModel

class SegmentationProfilePoint(BaseModel):
    name: str
    explanation: str
    synonyms: List[str]

class TextSegmentationReq(BaseModel):
    text: str
    profile_points: List[SegmentationProfilePoint]
    api_key: str
    llm_provider: str
    model: str
    llm_url: str
    max_tokens: Optional[int] = None

class TextSegmentationResult(BaseModel):
    name: str
    begin_match: Optional[List[int]] = None
    end_match: Optional[List[int]] = None

class PDFExtractionReq(BaseModel):
    # Add any configuration parameters you need, for example:
    include_images: bool = False
    preserve_formatting: bool = True

class DoubleCheckReq(BaseModel):
    """
    Request model for double checking identified segments against profile points.
    """
    identified_segments: Dict[str, Dict[str, str]]
    profile_point_list: Dict[str, Dict[str, str | List[str]]]
    llm_provider: str
    api_key: Optional[str] = None
    model: Optional[str] = None
    llm_url: Optional[str] = None
    max_tokens: Optional[int] = None 