from fastapi import APIRouter
from app.models.datapoint_extraction_models import ProfileChatRequest
from app.services.text_segmentation.profile_chat import profile_chat_service

router = APIRouter()


@router.post("/profile-chat")
async def profile_chat(req: ProfileChatRequest):
    return await profile_chat_service(req)
