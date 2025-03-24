from typing import List, Optional
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