from langchain.prompts import PromptTemplate


class Rate_Regex_Matches_Template_List:
    def __init__(self) -> None:
        self.rate_regex_matches = """
You are an assistant to a researcher who is extracting datapoints from clinical text.

You will receive:
- A list of datapoints. Each datapoint has a name, explanation, synonyms, datatype, possible valueset, expected unit (if any), and a text excerpt.
- Your job is to extract the correct value for each datapoint from the excerpt.

Your tasks:
1. For each datapoint, find the value in the text excerpt that best matches the definition, synonyms, and expected unit.
2. Always return the value in the specified format:
   - "number": only the numeric value (without unit).
   - "valueset": choose one or more values from the given valueset. If none match, leave it empty.
   - "text": copy the relevant phrase from the excerpt.
   - "binary/yes-no": decide if the datapoint is affirmed or denied in the excerpt.
3. For each extracted value, provide a short explanation (1–2 sentences) describing why this value was chosen.
4. If no valid value is present, leave the value as an empty string "".
5. Always output strictly valid JSON.

Rules:
- Do not invent values not present in the text.
- For measurements: include only the number, not the unit (e.g. "8.5", not "8.5 mm").
- For valuesets: pick exactly from the allowed list.
- For binary/yes-no: pay attention to negations like "kein" / "no".
- Do not output code, tool calls, or additional text outside JSON.

Input datapoint:
{datapoint}

Candidate matches:
{matches}

Your output must be strictly valid JSON with no trailing commas.

Output format:
{{
    "match_ratings": [
        {{
            "index": 0,
            "is_valid": true,
            "explanation": "Short explanation why valid or invalid"
        }},
        {{
            "index": 1,
            "is_valid": false,
            "explanation": "Short explanation why valid or invalid"
        }}
    ],
    "explanation": "Overall explanation of why the best match was chosen or why none is suitable",
    "selected_match_index": 0
}}

Example datapoint:
{{
    "name": "IVSD",
    "explanation": "Interventricular septum thickness at end-diastole",
    "synonyms": ["Interventricular septum thickness at end-diastole"],
    "unit": "mm"
}}

Example matches:
[
    "nicht hypertrophierter (IVSD: 8.5 mm, LVPWD: 10.3 mm) linker Ventrikel",
    "erhöhte Füllungsdrücke (E/E': 15.8 1). Linker Vorhof erweitert",
    "mit einem RVSP von 31.8mmHg Aortenklappe: zart, max/mean Gradient:"
]

Example output:
{{
    "match_ratings": [
        {{
            "index": 0,
            "is_valid": true,
            "explanation": "Contains a clear IVSD measurement with correct unit (mm)"
        }},
        {{
            "index": 1,
            "is_valid": false,
            "explanation": "This is E/E' ratio, unrelated to IVSD"
        }},
        {{
            "index": 2,
            "is_valid": false,
            "explanation": "Mentions RVSP and aortic valve, unrelated to IVSD"
        }}
    ],
    "explanation": "The first match contains a clear IVSD measurement (8.5 mm). The others do not describe IVSD.",
    "selected_match_index": 0
}}


        JSON_OUTPUT:
        """

        self.rate_regex_matches_german = """
Sie sind Assistent eines Forschers, der potenzielle Übereinstimmungen für Datenpunkte in Texten bewertet.

Sie erhalten:
1. Eine Datenpunktdefinition (mit Name, Erklärung, Synonymen und erwarteter Einheit, falls vorhanden).
2. Eine Liste von Textauszügen, die mit Regex-Mustern gefunden wurden und möglicherweise den Datenpunkt repräsentieren.

Ihre Aufgaben:
- Geben Sie zuerst eine kurze Gesamterklärung zu Ihrer Entscheidung.
- Bewerten Sie jeden einzelnen Textauszug und entscheiden Sie, ob er den Datenpunkt wirklich repräsentiert.
- Berücksichtigen Sie dabei die Definition, Erklärung, Synonyme und die erwartete Einheit.
- Wählen Sie die beste Übereinstimmung, falls vorhanden. Wenn keine passt, wählen Sie -1.

Bewertungsregeln:
- Eine gültige Übereinstimmung muss den Datenpunkt klar erwähnen (durch Namen, Synonym oder Abkürzung).
- Wenn der Datenpunkt eine Messung enthält, müssen Wert und richtige Einheit vorhanden sein.
- Wenn der Textauszug ein anderes Maß oder eine andere Größe beschreibt, ist er ungültig.
- Wenn mehrere gültig sind, wählen Sie die am besten passende Übereinstimmung.

Eingabe-Datenpunkt:
{datapoint}

Kandidaten:
{matches}

Die Ausgabe muss gültiges JSON sein und darf keine abschließenden Kommata enthalten.

Ausgabeformat:
{{
    "match_ratings": [
        {{
            "index": 0,
            "is_valid": true,
            "explanation": "Kurze Erklärung, warum gültig oder ungültig"
        }},
        {{
            "index": 1,
            "is_valid": false,
            "explanation": "Kurze Erklärung, warum gültig oder ungültig"
        }}
    ],
    "explanation": "Gesamterklärung, warum diese Übereinstimmung gewählt wurde oder warum keine passt",
    "selected_match_index": 0
}}

Beispiel-Datenpunkt:
{{
    "name": "IVSD",
    "explanation": "Interventrikuläre Septumdicke in der Enddiastole",
    "synonyms": ["Interventrikuläre Septumdicke in der Enddiastole"],
    "unit": "mm"
}}

Beispiel-Kandidaten:
[
    "nicht hypertrophierter (IVSD: 8.5 mm, LVPWD: 10.3 mm) linker Ventrikel",
    "erhöhte Füllungsdrücke (E/E': 15.8 1). Linker Vorhof erweitert",
    "mit einem RVSP von 31.8mmHg Aortenklappe: zart, max/mean Gradient:"
]

Beispiel-Ausgabe:
{{
    "match_ratings": [
        {{
            "index": 0,
            "is_valid": true,
            "explanation": "Enthält eine klare IVSD-Messung mit der richtigen Einheit (mm)"
        }},
        {{
            "index": 1,
            "is_valid": false,
            "explanation": "Enthält E/E'-Verhältnis, nicht IVSD"
        }},
        {{
            "index": 2,
            "is_valid": false,
            "explanation": "Enthält RVSP und Aortenklappe, nicht IVSD"
        }}
    ],
    "explanation": "Die erste Übereinstimmung enthält eine klare IVSD-Messung (8.5 mm). Die anderen enthalten keine relevanten Informationen zu IVSD.",
    "selected_match_index": 0
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
