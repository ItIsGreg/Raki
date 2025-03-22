from typing import Callable
from fastapi.responses import StreamingResponse
from app.llm_calls import call_llm
from app.models.datapoint_extraction_models import ProfileChatRequest
from app.prompts.profile_chat import ProfileChatPrompt
from app.config.environment import prompt_language

prompt = ProfileChatPrompt()


async def profile_chat_service(
    req: ProfileChatRequest,
    lang: str = prompt_language,
    call_llm_function: Callable = call_llm,
) -> StreamingResponse:
    # Prepare the input for the LLM
    user_input = req.messages[-1]["content"] if req.messages else ""
    prompt_parameters = {"user_input": user_input}

    # Call the LLM with streaming
    stream = await call_llm_function(
        prompt.profile_chat,
        prompt_parameters,
        llm_provider=req.llm_provider,
        model=req.model,
        api_key=req.api_key,
        llm_url=req.llm_url,
        stream=True,
        max_tokens=req.max_tokens,
    )

    return StreamingResponse(stream, media_type="text/event-stream")
