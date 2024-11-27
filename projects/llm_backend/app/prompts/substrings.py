from langchain.prompts import PromptTemplate


class Extract_Datapoint_Substrings_Template_List:
    def __init__(self) -> None:

        self.extract_datapoint_substrings_german = """
    Sie sind Assistent eines Forschers, der Datapoint-Teilstrings aus einem Text extrahiert.
    Sie erhalten eine Liste von Datapoints, die extrahiert werden sollen, und den Text, aus dem sie extrahiert werden sollen.
    Jeder Datapoint sieht so aus:
    {{
        "name": "datapoint1",
        "explnation": "explanation1",
        synonyms: ["synonym1", "synonym2", "synonym3"]
    }}
    Für jeden Datapoint sollen Sie den Teilstring aus dem Text extrahieren, der die Informationen für den Datapoint enthält.
    Versuchen Sie, einen Teilstring zu extrahieren, der den Hauptpunkt des Datapoints enthält. Der Teilstring sollte idealerweise 2 Wörter lang sein.
    Wenn der Teilstring ein Medikament darstellt, extrahieren Sie nur den Namen des Medikaments, nicht die Dosierung oder Häufigkeit.
    Wenn der Datapoint nicht im Text vorhanden ist, sollten Sie den Datapoint in der Antwort auslassen.
    Geben Sie keine Erklärungen oder zusätzlichen Informationen in der Antwort an.

    %DATAPOINTS:
    {datapoints}

    %TEXT:
    {text}

    Die Ausgabe sollte so aussehen:

    {{
        "datapoint1": "substring_from_text1",
        "datapoint2": "substring_from_text2",
        "datapoint3": "substring_from_text3",
        ...
    }}

    Die Ausgabe sollte gültiges JSON sein. Fügen Sie keine zusätzlichen Informationen zur Ausgabe hinzu, wie eine Erklärung der Datapoints oder des Textes.
    Verwenden Sie keine abschließenden Kommas in der JSON-Ausgabe.

    
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
    Try to extract a substring that contains the main point of the datapoint. The substring ideally should be 2 words long.
    If the substring is representing a medication, only extract the name of the medication, not the dosage or frequency.
    If the datapoint is not present in the text, you should leave out the datapoint in the response.
    Do not provide any explanations or additional information in the response. Do not attempt to write code to solve the problem.

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

        self.select_substring_german = """

    Sie sind Assistent eines Forschers, der Datapoint-Teilstrings aus einem Text extrahiert.
    Sie erhalten eine Datapoint-Definition und eine Liste von Textausschnitten aus einem Text.
    Im Textausschnitt wird ein Teilstring markiert, der angeblich die Informationen für den Datapoint enthält.
    Die Markierung wird @@substring@@ sein.
    Ihre Aufgabe ist es, den Textausschnitt auszuwählen, der tatsächlich die Informationen für den Datapoint enthält.
    Wenn alle Teilstrings die Informationen enthalten, können Sie einen beliebigen davon auswählen.

    %DATAPOINT:
    {datapoint}

    %SUBSTRINGS:
    {substrings}

    Die Ausgabe sollte der Index des ausgewählten Teilstrings in der Liste der Teilstrings sein.
    Der Index sollte 0-basiert sein, d.h. der erste Teilstring hat den Index 0, der zweite Teilstring den Index 1 und so weiter.

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

    Fügen Sie keine zusätzlichen Informationen zur Ausgabe hinzu, wie eine Erklärung der Datapoints oder des Textes.

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

    Do not add any additional information to the output, like an explanation of your decision. Do not attempt to write code to solve the problem.
    Only provide the index of the selected substring. Nothing more, nothing less.

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
        self.extract_datapoint_substrings_german = PromptTemplate(
            input_variables=["datapoints", "text"],
            template=template_list.extract_datapoint_substrings_german,
        )
        self.select_substring_german = PromptTemplate(
            input_variables=["datapoint", "substrings"],
            template=template_list.select_substring_german,
        )
