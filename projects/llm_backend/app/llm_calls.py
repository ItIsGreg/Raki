import json
from typing import Any
import re
import asyncio
import logging

from langchain_core.prompts.base import BasePromptTemplate

from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from langchain_community.chat_models.azureml_endpoint import (
    AzureMLChatOnlineEndpoint,
    AzureMLEndpointApiType,
    LlamaChatContentFormatter,
    CustomOpenAIChatContentFormatter,
)
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from openai import AzureOpenAI, AsyncAzureOpenAI

from app.utils.utils import handle_json_prefix
from rich import print
from rich.panel import Panel

# Configure logging to suppress unnecessary logs
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

# Configure root logger
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

# openai.api_key = ***REMOVED***
# openai.base_url = (
#     ***REMOVED***  # Replace with your local server's address
# )

logging.basicConfig(level=logging.INFO)  # Changed to INFO level
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
    try:
        client = ChatCompletionsClient(
            endpoint=llm_url,
            credential=AzureKeyCredential(api_key),
        )

        # Convert the prompt template to messages
        messages = []
        if "system_message" in prompt_parameters:
            messages.append(SystemMessage(content=prompt_parameters["system_message"]))
        
        if "user_message" in prompt_parameters:
            messages.append(UserMessage(content=prompt_parameters["user_message"]))
        else:
            formatted_prompt = prompt.format(**prompt_parameters)
            messages.append(UserMessage(content=formatted_prompt))

        async def async_generator():
            try:
                response = client.complete(
                    stream=True,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=0,
                    top_p=0.1,
                    presence_penalty=0.0,
                    frequency_penalty=0.0,
                    model=model
                )

                for update in response:
                    if update.choices:
                        chunk = update.choices[0].delta.content or ""
                        if chunk:
                            yield chunk
                    await asyncio.sleep(0.01)
            finally:
                client.close()

        return async_generator()
    except Exception as e:
        raise


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


async def call_azure_openai(
    prompt: BasePromptTemplate,
    prompt_parameters: dict[str, Any],
    model: str,
    api_key: str,
    llm_url: str,
    max_tokens: int | None,
    api_version: str = "2024-12-01-preview",
):
    try:
        client = AsyncAzureOpenAI(
            api_version=api_version,
            azure_endpoint=llm_url,
            api_key=api_key,
        )

        # Convert the prompt template to messages
        messages = []
        if "system_message" in prompt_parameters:
            messages.append({"role": "system", "content": prompt_parameters["system_message"]})
        
        if "user_message" in prompt_parameters:
            messages.append({"role": "user", "content": prompt_parameters["user_message"]})
        else:
            formatted_prompt = prompt.format(**prompt_parameters)
            messages.append({"role": "user", "content": formatted_prompt})

        response = await client.chat.completions.create(
            messages=messages,
            max_tokens=max_tokens or 4096,
            temperature=0,
            top_p=0.1,
            model=model
        )

        result = response.choices[0].message.content
        
        try:
            result = handle_json_prefix(result)
            result = clean_llm_response(result)
            result_structured_list = json.loads(result)
            return result_structured_list
        except json.JSONDecodeError as e:
            return {"error": "Failed to parse LLM response as JSON", "raw_response": result}
        except Exception as e:
            return {"error": "Failed to process LLM response", "raw_response": result}

    except Exception as e:
        return {"error": str(e)}
    finally:
        await client.close()


async def call_azure_openai_stream(
    prompt: BasePromptTemplate,
    prompt_parameters: dict[str, Any],
    model: str,
    api_key: str,
    llm_url: str,
    max_tokens: int,
    api_version: str = "2024-12-01-preview",
):
    try:
        client = AsyncAzureOpenAI(
            api_version=api_version,
            azure_endpoint=llm_url,
            api_key=api_key,
        )

        # Convert the prompt template to messages
        messages = []
        if "system_message" in prompt_parameters:
            messages.append({"role": "system", "content": prompt_parameters["system_message"]})
        
        if "user_message" in prompt_parameters:
            messages.append({"role": "user", "content": prompt_parameters["user_message"]})
        else:
            formatted_prompt = prompt.format(**prompt_parameters)
            messages.append({"role": "user", "content": formatted_prompt})

        async def async_generator():
            try:
                response = await client.chat.completions.create(
                    stream=True,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=0,
                    top_p=0.1,
                    model=model
                )

                async for update in response:
                    if update.choices:
                        chunk = update.choices[0].delta.content or ""
                        if chunk:
                            yield chunk
                    await asyncio.sleep(0.01)
            finally:
                await client.close()

        return async_generator()
    except Exception as e:
        raise


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
    elif llm_provider == "azure_openai":
        if stream:
            return await call_azure_openai_stream(
                prompt,
                prompt_parameters,
                model=model,
                api_key=api_key,
                llm_url=llm_url,
                max_tokens=max_tokens,
            )
        else:
            return await call_azure_openai(
                prompt,
                prompt_parameters,
                model=model,
                api_key=api_key,
                llm_url=llm_url,
                max_tokens=max_tokens,
            )
    else:
        logger.error("Unknown LLM provider: %s", llm_provider)
        raise Exception("Unknown LLM provider")


def clean_llm_response(text):
    # If the response is already a number or simple string, return it as is
    if isinstance(text, (int, float)) or (isinstance(text, str) and text.strip().isdigit()):
        return text
    
    # Try to find JSON in the response
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        json_str = match.group(0)
        try:
            # Parse the JSON string
            json_obj = json.loads(json_str)
            # Convert back to a formatted JSON string
            return json.dumps(json_obj, indent=2)
        except json.JSONDecodeError:
            return text  # Return original text if JSON parsing fails
    else:
        return text  # Return original text if no JSON found
