from typing import Tuple, List, Optional, Dict, Any
from pydantic import BaseModel


class BaseRequest(BaseModel):
    api_key: str
    llm_provider: str
    model: str
    llm_url: str
    max_tokens: Optional[int] = None


class BaseDataPoint(BaseModel):
    name: str
    explanation: str
    synonyms: list[str]


class DataPoint(BaseDataPoint):
    datatype: str
    valueset: list[str]
    unit: str


class Example(BaseModel):
    text: str
    output: dict[str, str]


class ExtractDatapointSubstringsReq(BaseRequest):
    datapoints: list[BaseDataPoint]
    text: str
    example: Example | None = None


class DataPointSubstring(BaseModel):
    name: str
    substring: str


class DataPointSubstringMatch(DataPointSubstring):
    match: Tuple[int, int] | None


class ExtractValuesReqDatapoint(DataPoint):
    text_excerpt: str


class ExtractValuesReq(BaseRequest):
    datapoints: list[ExtractValuesReqDatapoint]


class PipelineReq(BaseRequest):
    text: str
    datapoints: list[DataPoint]
    example: Example | None = None


class PipelineResDatapoint(BaseModel):
    name: str
    match: Tuple[int, int] | None
    value: str | int | float | None


class SelectSubstringReq(BaseRequest):
    datapoint: BaseDataPoint | None
    substrings: list[str]


class ProfileChatRequest(BaseRequest):
    messages: List[dict]
    stream: Optional[bool] = False


class DoubleCheckReq(BaseRequest):
    extracted_substrings: dict[str, dict[str, str]]
    profile_point_list: dict[str, dict[str, str | list[str]]]


class ExtractSubstringsReq(BaseModel):
    datapoints: List[DataPoint]
    text: str
    llm_provider: str
    api_key: str
    model: str
    llm_url: str
    max_tokens: int