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
    Try to select the substring in a way that it is unique and contains the most relevant information for the datapoint.
    If the substring is representing a medication, only extract the name of the medication, not the dosage or frequency.
    If the datapoint is not present in the text, you should leave out the datapoint in the response.
    Do not provide any explanations or additional information in the response.

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
    Do not use trailing commas in the JSON output. Do not fall into endless loops of a certain text passage.

    %EXAMPLE_TEXT:
    Dilatierter, nicht hypertrophierter (IVSD: 12.2 mm, LVPWD: 10.0 mm) linker Ventrikel mit einer mittlelgradig eingeschränkten systolischen Funktion (EF n. Simpson - 35 %).
    Hinweis für erhöhte Füllungsdrücke (E/E': 25.5 1). Linker Vorhof erweitert (LAVI: 59.3 ml/m²).
    Diastolische Dysfunktion Grad III: AoWurzel und Aorta ascendens normal weit.
    Rechter Ventrikel dilatiert (RVEDD: 4.2 cm). RA dilatiert (RAA: 21.3 cm²). Eingeschränkte RV Funktion (TAPSE: 1.4 cm, S´: 0,07 m/s).
    Mitralklappe mit Zust.n. 2x MK-Clip : gering sklerosiert, ausreichend öffnend,
    Insuffizienz III Trikuspidalklappe: gering sklerosiert, gut öffnend, Insuffizienz I,  mit einem RVSP von 36 mmHg + ZVD.
    Aortenklappe: Trikuspid, gut öffnend, Insuffizienz I Kein PE erkennbar, VCI: 19 mm,  NB: Pleuraergüsse beidseits!

    %EXAMPLE_DATOINTS:
    [{{
        'name': 'IVSD',
        'explanation': '',
        'synonyms': ['Interventrikuläres Septum diastolisch']}},
    {{
        'name': 'LVPWD',
        'explanation': '',
        'synonyms': []}},
    {{
        'name': 'LVEF',
        'explanation': 'Linksventrikuläre Ejektionsfraktion',
        'synonyms': ['Linksventrikuläre Ejektionsfraktion', 'EF n. Simpson']
    }}]

    %EXAMPLE_OUTPUT:
    {{
        "IVSD": "IVSD: 12.2 mm",
        "LVPWD": "LVPWD: 10.0 mm",
        "LVEF": "EF n. Simpson - 35 %"
    }}
    



    JSON_OUTPUT:
"""

        self.select_substring = """
    You are an assistant to a researcher who is extracting datapoint substrings from a text.
    You will be provided with a data point definition and a list of text excerpts from a text.
    In the text excerpt a substring will be marked that supposedly contains the information for the datapoint.
    The mark will be @@substring@@.
    Your task is to select the text excerpt that really contains the information for the datapoint.
    If all substrings contain the information, you can select any of them.

    %DATAPOINT:
    {datapoint}

    %SUBSTRINGS:
    {substrings}

    The output should be the index of the selected substring in the list of substrings.
    The index should be 0-based, meaning the first substring has the index 0, the second substring has the index 1, and so on.

    %EXAMPLE_DATAPOINT:
    {{
        'name': 'IVSD',
        'explanation': '',
        'synonyms': ['Interventrikuläres Septum diastolisch']
    }}

    %EXAMPLE_SUBSTRINGS:
    [
    "nicht hypertrophierter (IVSD: 8.5 mm, LVPWD: 10.3 mm) linker Ventrikel",
    "erhöhte Füllungsdrücke (E/E': 15.8 1). Linker Vorhof erweitert",
    "it einem RVSP von 31.8mmHg Aortenklappe: zart,  max/mean Gradient:"
    ]

    %EXAMPLE_OUTPUT:
    {{
        "index": 0
    }}

    Do not add any additional information to the output, like an explanation of the datapoints or the text.

    JSON_OUTPUT:
"""


class Extract_Datapoint_Substrings_Prompt_List:
    def __init__(self):
        template_list = Extract_Datapoint_Substrings_Template_List()
        self.extract_datapoint_substrings = PromptTemplate(
            input_variables=["datapoints", "text"],
            template=template_list.extract_datapoint_substrings,
        )
        self.select_substring = PromptTemplate(
            input_variables=["datapoint", "substrings"],
            template=template_list.select_substring,
        )
