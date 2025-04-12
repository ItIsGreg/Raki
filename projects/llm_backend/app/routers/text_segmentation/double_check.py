from fastapi import APIRouter

from app.models.text_segmentation_models import DoubleCheckReq
from app.services.text_segmentation.double_check import double_check_service

router = APIRouter()


@router.post("/double_check")
async def double_check(req: DoubleCheckReq):
    return await double_check_service(req)
