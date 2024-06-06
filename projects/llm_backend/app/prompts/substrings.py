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


class Extract_Datapoint_Substrings_Prompt_List:
    def __init__(self):
        template_list = Extract_Datapoint_Substrings_Template_List()
        self.extract_datapoint_substrings = PromptTemplate(
            input_variables=["datapoints", "text"],
            template=template_list.extract_datapoint_substrings,
        )
