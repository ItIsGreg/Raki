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
    dimension: str
    valueset: list[str]
    unit: str


class ExtractDatapointSubstringsReq(BaseRequest):
    datapoints: list[BaseDataPoint]
    text: str
