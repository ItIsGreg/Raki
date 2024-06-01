from fastapi import APIRouter

from app.models.models import ExtractDatapointSubstringsReq
from app.services.substrings import (
    extract_datapoint_substrings_service,
)

router = APIRouter()


@router.post("/extract_datapoint_substrings")
async def extract_datapoint_substrings(req: ExtractDatapointSubstringsReq):
    return await extract_datapoint_substrings_service(req)
