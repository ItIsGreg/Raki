from langchain.prompts import PromptTemplate


class Extract_Datapoint_Substrings_Template_List:
    def __init__(self) -> None:

        self.extract_datapoint_substrings = """
    You are an assistant to a researcher who is extracting datapoint substrings from a text.
    You will be provided with a list of datapoints to extract and the text to extract them from.

    Each Datapoint will look like this:
    {{
        "name": "datapoint1",
        "explnation": "explanation1",
        synonyms: ["synonym1", "synonym2", "synonym3"]
    }}

    For each datapoint, you are supposed to extract the substring from the text, containing the information for the datapoint.
    If the datapoint is not present in the text, you should leave out the datapoint in the response.

    %DATAPOINTS:
    {datapoints}

    %TEXT:
    {text}

    The output should look like this:

    {{
        "datapoint1": "substring_from_text1",
        "datapoint2": "substring_from_text2",
        "datapoint3": "substring_from_text3",
        ...
    }}

    The output should be valid JSON. Do not add any additional information to the output, like an explanation of the datapoints or the text.
    Do not use trailing commas in the JSON output.


    JSON_OUTPUT:
"""


class Extract_Datapoint_Substrings_Prompt_List:
    def __init__(self):
        template_list = Extract_Datapoint_Substrings_Template_List()
        self.extract_datapoint_substrings = PromptTemplate(
            input_variables=["datapoints", "text"],
            template=template_list.extract_datapoint_substrings,
        )
