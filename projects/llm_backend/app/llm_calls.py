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

from app.config.environment import (
    llama3_api_key,
    llama3_url,
    kiss_ki_url,
    kiss_ki_api_key,
    kiss_ki_model,
)

import logging
import openai

openai.api_key = ***REMOVED***
openai.base_url = (
    ***REMOVED***  # Replace with your local server's address
)

logging.basicConfig(level=logging.DEBUG)
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


async def call_self_hosted_model(
    prompt: BasePromptTemplate,
    prompt_parameters: dict[str, Any],
    model: str,
    api_base: str,
    api_key: str,
):
    logger.debug("Using self-hosted model")
    logger.debug("Parameters:")
    logger.debug(f"Model: {model}")
    logger.debug(f"API base: {api_base}")
    logger.debug(f"API key: {api_key}")

    # Configure OpenAI to use the self-hosted model
    llm_model = ChatOpenAI(
        temperature=1,
        model=model,
        api_key=api_key,
        base_url=api_base,
    )

    output_parser = StrOutputParser()
    chain = prompt | llm_model | output_parser

    try:
        result_structured = await chain.ainvoke(prompt_parameters)
        logger.debug(f"Self-hosted model response: {result_structured}")

        # Assuming handle_json_prefix is a function you've defined elsewhere
        result_structured = handle_json_prefix(result_structured)
        result_structured = clean_llm_response(result_structured)

        result_structured_list = json.loads(result_structured)
        return result_structured_list

    except Exception as e:
        logger.error(f"Error in call_self_hosted_model: {e}")
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
    # logger.debug(f"Calling LLM with parameters: {prompt_parameters}")

    if llm_provider == "openai":
        return await call_openai(
            prompt, prompt_parameters, model=model, api_key=api_key
        )
    elif llm_provider == "llama3":
        return await call_llama3(
            prompt, prompt_parameters, model=model, api_key=api_key
        )
    elif llm_provider == "kiss_ki":
        return await call_self_hosted_model(
            prompt,
            prompt_parameters,
            model=model,
            api_base=kiss_ki_url,
            api_key=kiss_ki_api_key,
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
