from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from app.llm_calls import call_llm
from app.config.environment import kiss_ki_model, kiss_ki_api_key
from langchain_core.prompts import ChatPromptTemplate

router = APIRouter()


class ProfileChatRequest(BaseModel):
    messages: List[dict]
    stream: Optional[bool] = False


@router.post("/profile-chat")
async def profile_chat(request: ProfileChatRequest):
    try:
        # Create a prompt template
        prompt = ChatPromptTemplate.from_messages(
            [("system", "You are a helpful assistant."), ("human", "{input}")]
        )

        # Prepare the input for the LLM
        user_input = request.messages[-1]["content"] if request.messages else ""
        prompt_parameters = {"input": user_input}

        # Call the LLM with streaming
        stream = await call_llm(
            prompt=prompt,
            prompt_parameters=prompt_parameters,
            llm_provider="kiss_ki",
            model=kiss_ki_model,
            api_key=kiss_ki_api_key,
            stream=True,
        )

        # Return a streaming response
        return StreamingResponse(stream, media_type="text/event-stream")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
