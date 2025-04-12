from fastapi import APIRouter

from app.models.datapoint_extraction_models import DoubleCheckReq
from app.services.datapoint_extraction.double_check import double_check_service

router = APIRouter()


@router.post("/double_check")
async def double_check(req: DoubleCheckReq):
    return await double_check_service(req)
