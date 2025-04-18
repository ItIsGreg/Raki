from fastapi import APIRouter

from app.models.datapoint_extraction_models import PipelineReq, PipelineResDatapoint
from app.services.datapoint_extraction.pipeline import pipeline_service

router = APIRouter()


@router.post("/pipeline")
async def pipeline(req: PipelineReq) -> list[PipelineResDatapoint]:
    return await pipeline_service(req)
