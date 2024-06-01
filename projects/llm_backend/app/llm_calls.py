import json
from typing import Any


from langchain_core.prompts.base import BasePromptTemplate

from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

from app.utils.utils import handle_json_prefix


async def call_openai(
    prompt: BasePromptTemplate,
    prompt_parameters: dict[str, Any],
    model: str,
    api_key: str,
):

    llm_model = ChatOpenAI(temperature=0, model=model, api_key=api_key)
    output_parser = StrOutputParser()

    chain = prompt | llm_model | output_parser
    result_structured = await chain.ainvoke(prompt_parameters)
    try:
        result_structured = handle_json_prefix(result_structured)
        result_structured_list = json.loads(result_structured)
    except Exception as e:
        print("Error in call_openai")
        print(e)
        print("prompt:")
        print(prompt)
        print("result_structured:")
        print(result_structured)
    return result_structured_list


async def call_llm(
    prompt: BasePromptTemplate,
    prompt_parameters: dict[str, Any],
    llm_provider: str,
    model: str,
    api_key: str,
):

    if llm_provider == "openai":
        return await call_openai(
            prompt, prompt_parameters, model=model, api_key=api_key
        )
    else:
        raise Exception("Unknown LLM provider")
