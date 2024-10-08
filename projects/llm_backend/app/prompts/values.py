from langchain.prompts import PromptTemplate


class Extract_Values_Template_List:
    def __init__(self) -> None:
        self.extract_values = """
        You are an assistant to a researcher wo is extracting datapoints from a text.
        You will be provided with a list of datapoints with a specification on their data type, unit and valueset.
        For each datapoint you will be provided with a text excerpt, that should contain the datapoint.

        Your task is to extract the value of the datapoint from the text and provide it in the specified format.
        If the datapoint is not present in the text, just leave it out in the output.
        If the datapoint is present in the text, but the value is not present, just insert an empty string.
        If the datapoint is present in the text, but the value is not in the specified valueset, just insert an empty string.

        %DATAPOINTS:
        {datapoints}

        The output should look like this:

        {{
            "datapoint_name_1": "value1",
            "datapoint_name_2": "value2",
            ...
        }}

        The output should be valid JSON and only valid JSON.
        Do not add any additional information to the output, like an explanation of the datapoints or how you processed the datapoints.
        Do not use trailing commas in the JSON output. Do not fall into endless loops of a certain text passage.

        %EXAMPLE_DATAPOINTS:

        {{
            "name": "IVSD",
            "data_type": "number",
            "valueset": [],
            "explanation": "Interventricular septum thickness at end-diastole",
            "synonyms": ["Interventricular septum thickness at end-diastole"],
            "unit": "mm",
            "text": "nicht hypertrophierter (IVSD: 8.5 mm, LVPWD: 10.3 mm) linker Ventrikel"
        }},
        {{
            "name": "LVPWD",
            "data_type": "number",
            "valueset": [],
            "explanation": "Left ventricular posterior wall thickness at end-diastole",
            "synonyms": ["Left ventricular posterior wall thickness at end-diastole"],
            "unit": "mm",
            "text": "nicht hypertrophierter (IVSD: 8.5 mm, LVPWD: 10.3 mm) linker Ventrikel"
        }}


        %EXAMPLE_OUTPUT:
        {{
            "IVSD": "8.5",
            "LVPWD": "10.3"
        }}

        JSON_OUTPUT:
        """


class Extract_Values_Prompt_List:
    def __init__(self) -> None:
        template_list = Extract_Values_Template_List()
        self.extract_values = PromptTemplate(
            template=template_list.extract_values, input_variables=["datapoints"]
        )
