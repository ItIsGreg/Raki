from fastapi import APIRouter

from app.models.models import ExtractValuesReq
from app.services.datapoint_extraction.values import extract_values_service

router = APIRouter()


@router.post("/extract_values")
async def extract_values(req: ExtractValuesReq):
    return await extract_values_service(req)
