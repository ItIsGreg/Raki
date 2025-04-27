from langchain.prompts import PromptTemplate


class Rate_Regex_Matches_Template_List:
    def __init__(self) -> None:
        self.rate_regex_matches = """
        You are an assistant to a researcher who is evaluating potential matches for datapoints in a text.
        You will be provided with a datapoint definition and a list of text excerpts that were found using regex patterns.
        Each text excerpt contains a potential match for the datapoint.

        Your task is to:
        1. Evaluate each match to determine if it truly represents the datapoint
        2. Consider the datapoint's definition, explanation, and synonyms
        3. Decide which match (if any) best represents the datapoint
        4. Provide a brief explanation for your decision

        %DATAPOINT:
        {datapoint}

        %MATCHES:
        {matches}

        The output should look like this:
        {{
            "match_ratings": [
                {{
                    "index": 0,
                    "explanation": "Why this match is valid or invalid"
                    "is_valid": true,
                }},
                {{
                    "index": 1,
                    "explanation": "Why this match is valid or invalid"
                    "is_valid": false,
                }}
            ],
            "explanation": "Explanation of why this match was selected or why no match is suitable",
            "selected_match_index": 0,  // Index of the best match, or -1 if no match is suitable
        }}

        The output should be valid JSON and only valid JSON.
        Do not use trailing commas in the JSON output.

        %EXAMPLE_DATAPOINT:
        {{
            "name": "IVSD",
            "explanation": "Interventricular septum thickness at end-diastole",
            "synonyms": ["Interventricular septum thickness at end-diastole"],
            "unit": "mm"
        }}

        %EXAMPLE_MATCHES:
        [
            "nicht hypertrophierter (IVSD: 8.5 mm, LVPWD: 10.3 mm) linker Ventrikel",
            "erhöhte Füllungsdrücke (E/E': 15.8 1). Linker Vorhof erweitert",
            "it einem RVSP von 31.8mmHg Aortenklappe: zart,  max/mean Gradient:"
        ]

        %EXAMPLE_OUTPUT:
        {{
            "match_ratings": [
                {{
                    "index": 0,
                    "explanation": "Contains a clear IVSD measurement with the correct unit (mm)"
                    "is_valid": true,
                }},
                {{
                    "index": 1,
                    "explanation": "Contains E/E' ratio measurement, not related to IVSD"
                    "is_valid": false,
                }},
                {{
                    "index": 2,
                    "explanation": "Contains RVSP and aortic valve information, not related to IVSD"
                    "is_valid": false,
                }}
            ],
            "explanation": "The first match contains a clear measurement of IVSD (8.5 mm) which directly corresponds to the datapoint definition. The other matches do not contain any relevant information about IVSD.",
            "selected_match_index": 0,
        }}

        JSON_OUTPUT:
        """

        self.rate_regex_matches_german = """
        Sie sind Assistent eines Forschers, der potenzielle Übereinstimmungen für Datenpunkte in einem Text bewertet.
        Sie erhalten eine Datenpunktdefinition und eine Liste von Textauszügen, die mit Regex-Mustern gefunden wurden.
        Jeder Textauszug enthält eine potenzielle Übereinstimmung für den Datenpunkt.

        Ihre Aufgabe ist es:
        1. Jede Übereinstimmung zu bewerten, um zu bestimmen, ob sie den Datenpunkt wirklich repräsentiert
        2. Die Definition, Erklärung und Synonyme des Datenpunkts zu berücksichtigen
        3. Zu entscheiden, welche Übereinstimmung (falls vorhanden) den Datenpunkt am besten repräsentiert
        4. Eine kurze Erklärung für Ihre Entscheidung zu liefern

        %DATAPOINT:
        {datapoint}

        %MATCHES:
        {matches}

        Die Ausgabe sollte so aussehen:
        {{
            "selected_match_index": 0,  // Index der besten Übereinstimmung oder -1, wenn keine Übereinstimmung geeignet ist
            "explanation": "Erklärung, warum diese Übereinstimmung ausgewählt wurde oder warum keine Übereinstimmung geeignet ist",
            "match_ratings": [
                {{
                    "index": 0,
                    "is_valid": true,
                    "explanation": "Warum diese Übereinstimmung gültig oder ungültig ist"
                }},
                {{
                    "index": 1,
                    "is_valid": false,
                    "explanation": "Warum diese Übereinstimmung gültig oder ungültig ist"
                }}
            ]
        }}

        Die Ausgabe sollte gültiges JSON sein und nur gültiges JSON.
        Verwenden Sie keine abschließenden Kommas in der JSON-Ausgabe.

        %EXAMPLE_DATAPOINT:
        {{
            "name": "IVSD",
            "explanation": "Interventrikuläre Septumdicke in der Enddiastole",
            "synonyms": ["Interventrikuläre Septumdicke in der Enddiastole"],
            "unit": "mm"
        }}

        %EXAMPLE_MATCHES:
        [
            "nicht hypertrophierter (IVSD: 8.5 mm, LVPWD: 10.3 mm) linker Ventrikel",
            "erhöhte Füllungsdrücke (E/E': 15.8 1). Linker Vorhof erweitert",
            "it einem RVSP von 31.8mmHg Aortenklappe: zart,  max/mean Gradient:"
        ]

        %EXAMPLE_OUTPUT:
        {{
            "selected_match_index": 0,
            "explanation": "Die erste Übereinstimmung enthält eine klare Messung des IVSD (8.5 mm), die direkt der Datenpunktdefinition entspricht. Die anderen Übereinstimmungen enthalten keine relevanten Informationen über IVSD.",
            "match_ratings": [
                {{
                    "index": 0,
                    "is_valid": true,
                    "explanation": "Enthält eine klare IVSD-Messung mit der richtigen Einheit (mm)"
                }},
                {{
                    "index": 1,
                    "is_valid": false,
                    "explanation": "Enthält E/E'-Verhältnis-Messung, nicht verwandt mit IVSD"
                }},
                {{
                    "index": 2,
                    "is_valid": false,
                    "explanation": "Enthält RVSP- und Aortenklappeninformationen, nicht verwandt mit IVSD"
                }}
            ]
        }}

        JSON_OUTPUT:
        """


class Rate_Regex_Matches_Prompt_List:
    def __init__(self) -> None:
        template_list = Rate_Regex_Matches_Template_List()
        self.rate_regex_matches = PromptTemplate(
            template=template_list.rate_regex_matches, 
            input_variables=["datapoint", "matches"]
        )
        self.rate_regex_matches_german = PromptTemplate(
            template=template_list.rate_regex_matches_german, 
            input_variables=["datapoint", "matches"]
        )
