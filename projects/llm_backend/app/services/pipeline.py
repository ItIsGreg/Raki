from os import name
from app.models.models import (
    BaseDataPoint,
    DataPoint,
    ExtractDatapointSubstringsReq,
    ExtractValuesReq,
    ExtractValuesReqDatapoint,
    PipelineReq,
    PipelineResDatapoint,
)
from app.services.substrings import extract_datapoint_substrings_and_match_service
from app.services.values import extract_values_service


def get_text_excerpt(text: str, match: tuple[int, int], overlap: int = 25) -> str:
    start, end = match
    start = max(0, start - overlap)
    end = min(len(text), end + overlap)
    return text[start:end]


async def pipeline_service(req: PipelineReq) -> list[PipelineResDatapoint]:
    # extract substrings and match
    substring_req_datapoints: list[BaseDataPoint] = []
    for datapoint in req.datapoints:
        substring_req_datapoints.append(
            BaseDataPoint(
                name=datapoint.name,
                explanation=datapoint.explanation,
                synonyms=datapoint.synonyms,
            )
        )
    substring_res = await extract_datapoint_substrings_and_match_service(
        ExtractDatapointSubstringsReq(
            api_key=req.api_key,
            llm_provider=req.llm_provider,
            model=req.model,
            datapoints=substring_req_datapoints,
            text=req.text,
        )
    )
    # get text excerpts
    extract_values_datapoints: list[ExtractValuesReqDatapoint] = []
    for substring in substring_res:
        corresponding_profile_point = get_corresponding_profile_point(
            req.datapoints, substring.name
        )

        if substring.match is not None and corresponding_profile_point is not None:
            text_excerpt = get_text_excerpt(req.text, substring.match)
            extract_values_datapoints.append(
                ExtractValuesReqDatapoint(
                    name=substring.name,
                    text=text_excerpt,
                    dataType=corresponding_profile_point.datatype,
                    valueset=corresponding_profile_point.valueset,
                    unit=corresponding_profile_point.unit,
                )
            )

    # extract values
    extract_values_res = await extract_values_service(
        ExtractValuesReq(
            api_key=req.api_key,
            llm_provider=req.llm_provider,
            model=req.model,
            datapoints=extract_values_datapoints,
        )
    )
    print("extract_values_res")
    print(extract_values_res)

    # merge results
    pipeline_res_datapoints: list[PipelineResDatapoint] = []
    for substring in substring_res:
        corresponding_value = get_corresponding_value_point(
            extract_values_res, substring.name
        )
        pipeline_res_datapoints.append(
            PipelineResDatapoint(
                name=substring.name,
                match=substring.match,
                value=corresponding_value,
            )
        )
    return pipeline_res_datapoints


def get_corresponding_value_point(
    extract_values_res: dict[str, str], name: str
) -> str | None:
    if name in extract_values_res:
        return extract_values_res[name]
    return None


def get_corresponding_profile_point(
    profile_points: list[DataPoint], name: str
) -> DataPoint | None:
    for profile_point in profile_points:
        if profile_point.name == name:
            return profile_point
    return None
