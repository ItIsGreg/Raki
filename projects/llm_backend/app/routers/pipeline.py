from fastapi import APIRouter

from app.models.models import PipelineReq, PipelineResDatapoint
from app.services.pipeline import pipeline_service

router = APIRouter()


@router.post("/pipeline")
async def pipeline(req: PipelineReq) -> list[PipelineResDatapoint]:
    return await pipeline_service(req)
