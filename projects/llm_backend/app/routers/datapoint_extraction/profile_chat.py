from fastapi import APIRouter
from app.models.models import ProfileChatRequest
from app.services.datapoint_extraction.profile_chat import profile_chat_service

router = APIRouter()


@router.post("/profile-chat")
async def profile_chat(req: ProfileChatRequest):
    return await profile_chat_service(req)
