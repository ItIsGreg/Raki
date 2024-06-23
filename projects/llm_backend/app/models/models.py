from typing import Tuple
from pydantic import BaseModel


class BaseRequest(BaseModel):
    api_key: str
    llm_provider: str
    model: str


class BaseDataPoint(BaseModel):
    name: str
    explanation: str
    synonyms: list[str]


class DataPoint(BaseDataPoint):
    datatype: str
    valueset: list[str]
    unit: str


class ExtractDatapointSubstringsReq(BaseRequest):
    datapoints: list[BaseDataPoint]
    text: str


class DataPointSubstring(BaseModel):
    name: str
    substring: str


class DataPointSubstringMatch(DataPointSubstring):
    match: Tuple[int, int] | None


class ExtractValuesReqDatapoint(BaseModel):
    name: str
    dataType: str
    valueset: list[str]
    unit: str
    text: str


class ExtractValuesReq(BaseRequest):
    datapoints: list[ExtractValuesReqDatapoint]


class PipelineReq(BaseRequest):
    text: str
    datapoints: list[DataPoint]


class PipelineResDatapoint(BaseModel):
    name: str
    match: Tuple[int, int] | None
    value: str | int | float | None


class SelectSubstringReq(BaseRequest):
    datapoint: BaseDataPoint | None
    substrings: list[str]
