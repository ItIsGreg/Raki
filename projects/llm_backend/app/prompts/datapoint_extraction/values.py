from langchain.prompts import PromptTemplate


class Extract_Values_Template_List:
    def __init__(self) -> None:

        self.extract_values_german = """
        Sie sind Assistent eines Forschers, der Datenpunkte aus einem Text extrahiert.
        Sie erhalten eine Liste von Datenpunkten mit einer Spezifikation zu ihrem Datentyp, Einheit und Wertebereich.
        Für jeden Datenpunkt erhalten Sie einen Textauszug, der den Datenpunkt enthalten sollte.
        Ihre Aufgabe ist es, den Wert des Datenpunkts aus dem Text zu extrahieren und im angegebenen Format bereitzustellen.
        Wenn der Datenpunkt im Text enthalten ist, der Wert jedoch nicht vorhanden ist, fügen Sie einfach einen leeren String ein.

        
        %DATAPOINTS:
        {datapoints}
        
        Die Ausgabe sollte so aussehen:

        {{
            "datapoint_name_1": {{"explanation": "explanation1", "value": "value1"}},
            "datapoint_name_2": {{"explanation": "explanation2", "value": "value2"}},
            ...
        }}

        Die Ausgabe sollte gültiges JSON sein und nur gültiges JSON.
        Verwenden Sie keine abschließenden Kommas in der JSON-Ausgabe.

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
            "IVSD": {{"explanation": "The IVSD is present in the text and is shown with a value of 8.5 mm.", "value": "8.5"}},
            "LVPWD": {{"explanation": "The LVPWD is present in the text and is shown with a value of 10.3 mm.", "value": "10.3"}}
        }}

        JSON_OUTPUT:
        """

        self.extract_values = """
        You are an assistant to a researcher wo is extracting datapoints from a text.
        You will be provided with a list of datapoints with a specification on their data type, unit and valueset.
        For each datapoint you will be provided with a text excerpt, that should contain the datapoint.

        Your task is to extract the value of the datapoint from the text and provide it in the specified format.
        Provide a short explanation for each value. Why did you chose this value? After that provide the value
        Always adhere to the json schema defined below.

        %DATAPOINTS:
        {datapoints}

        The output should look like this:

        {{
            "datapoint_name_1": {{"explanation": "explanation1", "value": "value1"}},
            "datapoint_name_2": {{"explanation": "explanation2", "value": "value2"}},
            ...
        }}

        The output should be valid JSON and only valid JSON.
        Do not use trailing commas in the JSON output. Do not attempt to write code to solve the problem.
        Do not attempt to attempt to use some tool or function calling to solve the problem.

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
            "IVSD": {{"explanation": "The IVSD is present in the text and is shown with a value of 8.5 mm.", "value": "8.5"}},
            "LVPWD": {{"explanation": "The LVPWD is present in the text and is shown with a value of 10.3 mm.", "value": "10.3"}}
        }}

        JSON_OUTPUT:
        """


class Extract_Values_Prompt_List:
    def __init__(self) -> None:
        template_list = Extract_Values_Template_List()
        self.extract_values = PromptTemplate(
            template=template_list.extract_values, input_variables=["datapoints"]
        )
        self.extract_values_german = PromptTemplate(
            template=template_list.extract_values_german, input_variables=["datapoints"]
        )
