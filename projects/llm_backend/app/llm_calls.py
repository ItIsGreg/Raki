import json
from typing import Any


from langchain_core.prompts.base import BasePromptTemplate

from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from langchain_community.chat_models.azureml_endpoint import (
    AzureMLChatOnlineEndpoint,
    AzureMLEndpointApiType,
    LlamaChatContentFormatter,
)

from app.utils.utils import handle_json_prefix

from app.config.environment import llama3_api_key, llama3_url

import logging

logger = logging.getLogger(__name__)


async def call_openai(
    prompt: BasePromptTemplate,
    prompt_parameters: dict[str, Any],
    model: str,
    api_key: str,
):
    logger.debug("Using OpenAI")

    llm_model = ChatOpenAI(temperature=0, model=model, api_key=api_key)
    output_parser = StrOutputParser()

    chain = prompt | llm_model | output_parser
    try:
        result_structured = await chain.ainvoke(prompt_parameters)
        logger.debug(f"OpenAI response: {result_structured}")
        result_structured = handle_json_prefix(result_structured)
        result_structured_list = json.loads(result_structured)
        return result_structured_list
    except Exception as e:
        logger.error(f"Error in call_openai: {e}")
        logger.debug(f"Prompt: {prompt}")
        logger.debug(f"Result structured: {result_structured}")
        return None


async def call_llama3(
    prompt: BasePromptTemplate,
    prompt_parameters: dict[str, Any],
    model: str,
    api_key: str,
):
    logger.debug("Using Llama3")

    llm_model = AzureMLChatOnlineEndpoint(
        endpoint_url=llama3_url,
        endpoint_api_type=AzureMLEndpointApiType.serverless,
        endpoint_api_key=llama3_api_key,
        content_formatter=LlamaChatContentFormatter(),
    )
    # llm_model = ChatOpenAI(temperature=0, model=model, api_key=api_key)
    output_parser = StrOutputParser()

    chain = prompt | llm_model | output_parser
    try:
        result_structured = await chain.ainvoke(prompt_parameters)
        logger.debug(f"Llama3 response: {result_structured}")
        result_structured = handle_json_prefix(result_structured)
        result_structured_list = json.loads(result_structured)
        logger.debug(f"Result structured list: {result_structured_list}")
        return result_structured_list
    except Exception as e:
        logger.error(f"Error in call_llama3: {e}")
        logger.debug(f"Prompt: {prompt}")
        logger.debug(f"Result structured: {result_structured}")
        return None


async def call_llm(
    prompt: BasePromptTemplate,
    prompt_parameters: dict[str, Any],
    llm_provider: str,
    model: str,
    api_key: str,
):
    logger.debug(f"Calling LLM with parameters: {prompt_parameters}")

    if llm_provider == "openai":
        return await call_openai(
            prompt, prompt_parameters, model=model, api_key=api_key
        )
    elif llm_provider == "llama3":
        return await call_llama3(
            prompt, prompt_parameters, model=model, api_key=api_key
        )
    else:
        logger.error("Unknown LLM provider")
        raise Exception("Unknown LLM provider")
