from fastapi import APIRouter

from app.models.models import ExtractDatapointSubstringsReq, SelectSubstringReq
from app.services.datapoint_extraction.substrings import (
    extract_datapoint_substrings_and_match_service,
    extract_datapoint_substrings_service,
    select_substring_service,
)

router = APIRouter()


@router.post("/extract_datapoint_substrings")
async def extract_datapoint_substrings(req: ExtractDatapointSubstringsReq):
    return await extract_datapoint_substrings_service(req)


@router.post("/extract_datapoint_substrings_and_match")
async def extract_datapoint_substrings_and_match(req: ExtractDatapointSubstringsReq):
    return await extract_datapoint_substrings_and_match_service(req)


@router.post("/select_substring")
async def select_substring(
    req: SelectSubstringReq,
) -> int:
    return await select_substring_service(req)
