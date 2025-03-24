from fastapi import APIRouter

from app.models.text_segmentation_models import TextSegmentationReq, TextSegmentationResult
from app.services.text_segmentation.segments import text_segmentation_service
from typing import List

router = APIRouter()


@router.post("/segments", response_model=List[TextSegmentationResult])
async def text_segmentation(req: TextSegmentationReq):
    """
    Endpoint to identify text segments based on profile points.
    
    This endpoint takes a text document and a list of profile points,
    and returns the identified segments with their boundary positions.
    """
    return await text_segmentation_service(req)
