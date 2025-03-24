from langchain.prompts import PromptTemplate


class Text_Segmentation_Template_List:
    def __init__(self) -> None:

        self.text_segmentation_prompt = """
    You are an assistant to a researcher who is identifying text segments in a document.
    You will be provided with a text document and a list of profile points that represent segments to identify.
    
    Each profile point will look like this:
    {{
        "name": "segment_name",
        "explanation": "explanation of what this segment represents",
        "synonyms": ["synonym1", "synonym2", "synonym3"]
    }}
    
    For each profile point, your task is to:
    1. Find the corresponding segment in the text document
    2. Identify the exact substring that marks the beginning of the segment
    3. Identify the exact substring that marks the end of the segment
    
    The beginning and end substrings should be exact matches from the text. They should be short (ideally about 5 words) and clearly mark the boundaries of the segment.
    If a profile point's segment is not present in the text, you should leave it out of the response.
    
    %PROFILE_POINTS:
    {profile_points}
    
    %TEXT:
    {text}
    
    The output should be valid JSON in the following format:
    
    {{
        "segment_name1": {{
            "begin": "exact substring from text marking beginning",
            "end": "exact substring from text marking end"
        }},
        "segment_name2": {{
            "begin": "exact substring from text marking beginning",
            "end": "exact substring from text marking end"
        }},
        ...
    }}
    
    Do not add any additional information to the output, like explanations or comments.
    Do not use trailing commas in the JSON output.
    
    %EXAMPLE_TEXT:
    Patient was admitted on January 15, 2023 with complaints of chest pain and shortness of breath.
    
    MEDICAL HISTORY:
    The patient has a history of hypertension, diagnosed in 2015, and Type 2 diabetes diagnosed in 2018. Patient has been managing both conditions with medication.
    
    PHYSICAL EXAMINATION:
    Vital signs: BP 140/90, HR 88, RR 18, Temp 37.2°C
    General: Alert and oriented, in mild distress
    Cardiovascular: Regular rate and rhythm, no murmurs
    Respiratory: Clear to auscultation bilaterally
    
    ASSESSMENT AND PLAN:
    1. Acute Coronary Syndrome - Will proceed with cardiac enzymes and ECG monitoring
    2. Hypertension - Continue current medications
    3. Type 2 Diabetes - Continue current regimen, monitor blood glucose
    
    Patient will be admitted for observation and further evaluation.
    
    %EXAMPLE_PROFILE_POINTS:
    [{{
        "name": "Medical History",
        "explanation": "Section describing patient's past medical conditions",
        "synonyms": ["Past Medical History", "PMH", "History"]
    }},
    {{
        "name": "Physical Examination",
        "explanation": "Section describing findings from physical exam",
        "synonyms": ["Physical Exam", "Examination", "Exam Findings"]
    }},
    {{
        "name": "Assessment",
        "explanation": "Section describing diagnosis and treatment plan",
        "synonyms": ["Assessment and Plan", "Impression", "Plan", "A/P"]
    }}]
    
    %EXAMPLE_OUTPUT:
    {{
        "Medical History": {{
            "begin": "MEDICAL HISTORY:",
            "end": "Patient has been managing both conditions with medication."
        }},
        "Physical Examination": {{
            "begin": "PHYSICAL EXAMINATION:",
            "end": "Respiratory: Clear to auscultation bilaterally"
        }},
        "Assessment": {{
            "begin": "ASSESSMENT AND PLAN:",
            "end": "Patient will be admitted for observation and further evaluation."
        }}
    }}
    
    JSON_OUTPUT:
"""

        self.text_segmentation_prompt_german = """
    Sie sind Assistent eines Forschers, der Textsegmente in einem Dokument identifiziert.
    Sie erhalten einen Textdokument und eine Liste von Profilpunkten, die zu identifizierende Segmente darstellen.
    
    Jeder Profilpunkt sieht so aus:
    {{
        "name": "segment_name",
        "explanation": "Erklärung, was dieses Segment darstellt",
        "synonyms": ["synonym1", "synonym2", "synonym3"]
    }}
    
    Für jeden Profilpunkt besteht Ihre Aufgabe darin:
    1. Das entsprechende Segment im Textdokument zu finden
    2. Den genauen Teilstring zu identifizieren, der den Beginn des Segments markiert
    3. Den genauen Teilstring zu identifizieren, der das Ende des Segments markiert
    
    Die Anfangs- und End-Teilstrings sollten exakte Übereinstimmungen aus dem Text sein. Sie sollten kurz sein (idealerweise etwa 5 Wörter) und die Grenzen des Segments deutlich markieren.
    Wenn das Segment eines Profilpunkts im Text nicht vorhanden ist, sollten Sie es in der Antwort weglassen.
    
    %PROFILE_POINTS:
    {profile_points}
    
    %TEXT:
    {text}
    
    Die Ausgabe sollte gültiges JSON im folgenden Format sein:
    
    {{
        "segment_name1": {{
            "begin": "exakter Teilstring aus Text, der den Anfang markiert",
            "end": "exakter Teilstring aus Text, der das Ende markiert"
        }},
        "segment_name2": {{
            "begin": "exakter Teilstring aus Text, der den Anfang markiert",
            "end": "exakter Teilstring aus Text, der das Ende markiert"
        }},
        ...
    }}
    
    Fügen Sie keine zusätzlichen Informationen zur Ausgabe hinzu, wie Erklärungen oder Kommentare.
    Verwenden Sie keine abschließenden Kommas in der JSON-Ausgabe.
    
    %EXAMPLE_TEXT:
    Patient wurde am 15. Januar 2023 mit Beschwerden über Brustschmerzen und Kurzatmigkeit aufgenommen.
    
    KRANKENGESCHICHTE:
    Der Patient hat eine Vorgeschichte von Bluthochdruck, diagnostiziert im Jahr 2015, und Typ-2-Diabetes, diagnostiziert im Jahr 2018. Patient behandelt beide Erkrankungen mit Medikamenten.
    
    KÖRPERLICHE UNTERSUCHUNG:
    Vitalzeichen: Blutdruck 140/90, Herzfrequenz 88, Atemfrequenz 18, Temp 37,2°C
    Allgemein: Wach und orientiert, in leichter Atemnot
    Herz-Kreislauf: Regelmäßiger Rhythmus, keine Herzgeräusche
    Atmung: Beidseitig frei auskultierbar
    
    BEURTEILUNG UND PLAN:
    1. Akutes Koronarsyndrom - Fortfahren mit Herzenzymbestimmung und EKG-Überwachung
    2. Bluthochdruck - Aktuelle Medikation fortsetzen
    3. Typ-2-Diabetes - Aktuelles Regime fortsetzen, Blutzucker überwachen
    
    Patient wird zur Beobachtung und weiteren Evaluation aufgenommen.
    
    %EXAMPLE_PROFILE_POINTS:
    [{{
        "name": "Krankengeschichte",
        "explanation": "Abschnitt, der die früheren Erkrankungen des Patienten beschreibt",
        "synonyms": ["Vorgeschichte", "Anamnese", "Historie"]
    }},
    {{
        "name": "Körperliche Untersuchung",
        "explanation": "Abschnitt, der die Befunde der körperlichen Untersuchung beschreibt",
        "synonyms": ["Untersuchungsbefund", "Körperlicher Befund", "Untersuchung"]
    }},
    {{
        "name": "Beurteilung",
        "explanation": "Abschnitt, der Diagnose und Behandlungsplan beschreibt",
        "synonyms": ["Beurteilung und Plan", "Eindruck", "Plan", "Diagnose"]
    }}]
    
    %EXAMPLE_OUTPUT:
    {{
        "Krankengeschichte": {{
            "begin": "KRANKENGESCHICHTE:",
            "end": "Patient behandelt beide Erkrankungen mit Medikamenten."
        }},
        "Körperliche Untersuchung": {{
            "begin": "KÖRPERLICHE UNTERSUCHUNG:",
            "end": "Atmung: Beidseitig frei auskultierbar"
        }},
        "Beurteilung": {{
            "begin": "BEURTEILUNG UND PLAN:",
            "end": "Patient wird zur Beobachtung und weiteren Evaluation aufgenommen."
        }}
    }}
    
    JSON_OUTPUT:
"""


class Text_Segmentation_Prompt_List:
    def __init__(self):
        template_list = Text_Segmentation_Template_List()
        self.text_segmentation_prompt = PromptTemplate(
            input_variables=["profile_points", "text"],
            template=template_list.text_segmentation_prompt,
        )
        self.text_segmentation_prompt_german = PromptTemplate(
            input_variables=["profile_points", "text"],
            template=template_list.text_segmentation_prompt_german,
        )


def create_text_segmentation_prompt(document_text, profile_points, language="en"):
    """
    Creates a prompt for an LLM to identify segments in a document based on profile points.
    
    Args:
        document_text (str): The text document to analyze
        profile_points (list): List of dictionaries containing segment definitions with
                              'name', 'explanation', and 'synonyms' keys
        language (str): Language code, either "en" for English or "de" for German
    
    Returns:
        str: The formatted prompt for the LLM
    """
    prompt_list = Text_Segmentation_Prompt_List()
    
    if language.lower() in ["de", "german", "deutsch"]:
        prompt = prompt_list.text_segmentation_prompt_german.format(
            text=document_text,
            profile_points=profile_points
        )
    else:
        prompt = prompt_list.text_segmentation_prompt.format(
            text=document_text,
            profile_points=profile_points
        )
    
    return prompt
