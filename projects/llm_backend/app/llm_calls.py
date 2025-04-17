import json
from typing import Any
import re

from langchain_core.prompts.base import BasePromptTemplate

from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from langchain_community.chat_models.azureml_endpoint import (
    AzureMLChatOnlineEndpoint,
    AzureMLEndpointApiType,
    LlamaChatContentFormatter,
)

from app.utils.utils import handle_json_prefix
from rich import print

import logging

# openai.api_key = ***REMOVED***
# openai.base_url = (
#     ***REMOVED***  # Replace with your local server's address
# )

logging.basicConfig(level=logging.ERROR)  # Changed to ERROR level
logger = logging.getLogger(__name__)


async def call_openai(
    prompt: BasePromptTemplate,
    prompt_parameters: dict[str, Any],
    model: str,
    api_key: str,
    max_tokens: int | None,
):
    llm_params = {
        "temperature": 0,
        "model": model,
        "api_key": api_key,
    }
    if max_tokens is not None:
        llm_params["max_tokens"] = max_tokens

    llm_model = ChatOpenAI(**llm_params)
    output_parser = StrOutputParser()

    chain = prompt | llm_model | output_parser
    try:
        result_structured = await chain.ainvoke(prompt_parameters)
        
        result_structured = handle_json_prefix(result_structured)
        result_structured_list = json.loads(result_structured)
        return result_structured_list
    except Exception as e:
        logger.error(f"Error in call_openai: {e}")
        return None


async def call_openai_stream(
    prompt: BasePromptTemplate,
    prompt_parameters: dict[str, Any],
    model: str,
    api_key: str,
    max_tokens: int | None,
):
    llm_params = {
        "temperature": 0,
        "model": model,
        "api_key": api_key,
        "streaming": True,
    }
    if max_tokens is not None:
        llm_params["max_tokens"] = max_tokens

    llm_model = ChatOpenAI(**llm_params)
    output_parser = StrOutputParser()
    chain = prompt | llm_model | output_parser

    async def async_generator():
        async for chunk in chain.astream(prompt_parameters):
            yield chunk

    return async_generator()


async def call_self_hosted_model(
    prompt: BasePromptTemplate,
    prompt_parameters: dict[str, Any],
    model: str,
    llm_url: str,
    api_key: str,
    max_tokens: int | None,
):

    llm_params = {
        "temperature": 0,
        "model": model,
        "api_key": api_key,
        "base_url": llm_url,
    }
    if max_tokens is not None:
        llm_params["max_tokens"] = max_tokens

    llm_model = ChatOpenAI(**llm_params)

    output_parser = StrOutputParser()
    chain = prompt | llm_model | output_parser

    try:
        # Get raw response from LLM
        result_structured = await chain.ainvoke(prompt_parameters)

        # Handle JSON prefix
        result_structured = handle_json_prefix(result_structured)

        # Clean response
        result_structured = clean_llm_response(result_structured)

        # Parse JSON
        result_structured_list = json.loads(result_structured)


        return result_structured_list

    except Exception as e:
        print(f"[red]Error in call_self_hosted_model:[/red] {e}")
        return None


async def call_azure(
    prompt: BasePromptTemplate,
    prompt_parameters: dict[str, Any],
    model: str,
    api_key: str,
    llm_url: str,
    max_tokens: int | None,
):
    llm_params = {
        "endpoint_url": llm_url,
        "endpoint_api_type": AzureMLEndpointApiType.serverless,
        "endpoint_api_key": api_key,
        "content_formatter": LlamaChatContentFormatter(),
    }
    if max_tokens is not None:
        llm_params["max_tokens"] = max_tokens

    llm_model = AzureMLChatOnlineEndpoint(**llm_params)
    output_parser = StrOutputParser()

    chain = prompt | llm_model | output_parser
    try:
        result_structured = await chain.ainvoke(prompt_parameters)

        result_structured = handle_json_prefix(result_structured)
        result_structured = clean_llm_response(result_structured)

        result_structured_list = json.loads(result_structured)
        return result_structured_list

    except Exception as e:
        logger.error(f"Error in call_llama3: {e}")
        return None


async def call_azure_stream(
    prompt: BasePromptTemplate,
    prompt_parameters: dict[str, Any],
    model: str,
    api_key: str,
    llm_url: str,
    max_tokens: int,
):

    llm_model = AzureMLChatOnlineEndpoint(
        endpoint_url=llm_url,
        endpoint_api_type=AzureMLEndpointApiType.serverless,
        endpoint_api_key=api_key,
        content_formatter=LlamaChatContentFormatter(),
    )
    output_parser = StrOutputParser()

    chain = prompt | llm_model | output_parser

    async def async_generator():
        async for chunk in chain.astream(prompt_parameters):
            yield chunk

    return async_generator()


async def call_self_hosted_model_stream(
    prompt: BasePromptTemplate,
    prompt_parameters: dict[str, Any],
    model: str,
    llm_url: str,
    api_key: str,
    max_tokens: int | None,
):
    llm_params = {
        "temperature": 0,
        "model": model,
        "api_key": api_key,
        "base_url": llm_url,
        "streaming": True,
    }
    if max_tokens is not None:
        llm_params["max_tokens"] = max_tokens
    

    llm_model = ChatOpenAI(**llm_params)
    output_parser = StrOutputParser()
    chain = prompt | llm_model | output_parser

    async def async_generator():
        async for chunk in chain.astream(prompt_parameters):
            yield chunk

    return async_generator()


async def call_llm(
    prompt: BasePromptTemplate,
    prompt_parameters: dict[str, Any],
    llm_provider: str,
    model: str,
    api_key: str,
    llm_url: str,
    max_tokens: int,
    stream: bool = False,
):

    if llm_provider == "openai":
        if stream:
            return await call_openai_stream(
                prompt,
                prompt_parameters,
                model=model,
                api_key=api_key,
                max_tokens=max_tokens,
            )
        else:
            return await call_openai(
                prompt,
                prompt_parameters,
                model=model,
                api_key=api_key,
                max_tokens=max_tokens,
            )
    elif llm_provider == "azure":
        if stream:
            return await call_azure_stream(
                prompt,
                prompt_parameters,
                model=model,
                api_key=api_key,
                llm_url=llm_url,
                max_tokens=max_tokens,
            )
        else:
            return await call_azure(
                prompt,
                prompt_parameters,
                model=model,
                api_key=api_key,
                llm_url=llm_url,
                max_tokens=max_tokens,
            )
    elif llm_provider == "custom":
        if stream:
            return await call_self_hosted_model_stream(
                prompt,
                prompt_parameters,
                model=model,
                llm_url=llm_url,
                api_key=api_key,
                max_tokens=max_tokens,
            )
        else:
            return await call_self_hosted_model(
                prompt,
                prompt_parameters,
                model=model,
                llm_url=llm_url,
                api_key=api_key,
                max_tokens=max_tokens,
            )
    else:
        logger.error("Unknown LLM provider")
        raise Exception("Unknown LLM provider")


def clean_llm_response(text):
    # find json in llm response that could contain prose
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        json_str = match.group(0)
        try:
            # Parse the JSON string
            json_obj = json.loads(json_str)
            # Convert back to a formatted JSON string
            return json.dumps(json_obj, indent=2)
        except json.JSONDecodeError:
            return "Error: Invalid JSON found in the text"
    else:
        return "Error: No JSON object found in the text"
