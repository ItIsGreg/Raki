from langchain.prompts import PromptTemplate


class DoubleCheckTemplateList:
    def __init__(self) -> None:
        self.double_check = """
    You are a helpful AI assistant. Your task is to help identify text segments in a document.
    Your specific task will be to double check identified segments from another AI assistant.
    You will be given some segments that were identified in a text by another AI assistant.
    It was already determined that these segments and their allocation to predefined profile points is not correct.
    Especially that the profile point that was allocated does not exist in the profile point list of segments that are supposed to be identified.
    So it is likely that the other AI assistant took liberties in what to identify.

    You will be provided the list of identified segments and the supposedly existing profile point that was allocated to them.
    Furthermore you will be provided the profile point list that is supposed to be used for the identification.

    You should determine, whether there is a profile point in the profile point list, that actually corresponds to the identified segments.
    If there is, you should return the profile point name.
    If there is no corresponding profile point, you should return "NO_CORRESPONDING_PROFILE_POINT".

    The input will look like this:

    identified_segments:
    {{
        "supposed_profile_point_1": {{
            "begin": "beginning_substring",
            "end": "ending_substring",
            "text": "text_from_which_segment_was_identified"
        }},
        "supposed_profile_point_2": {{
            "begin": "beginning_substring",
            "end": "ending_substring",
            "text": "text_from_which_segment_was_identified"
        }},
        ...
    }}
    

    profile_point_list:
    {{
        "profile_point_1": {{
            "name": "profile_point_1",
            "explanation": "profile_point_1_explanation",
            "synonyms": ["profile_point_1_synonym_1", "profile_point_1_synonym_2"],
        }},
        ...
    }}

    The output should look like this:
    {{
        "supposed_profile_point_1": {{
            "reasoning": "reasoning_for_supposed_profile_point_1",
            "correction": "correct_profile_point_name_for_supposed_profile_point_1"
        }},
        "supposed_profile_point_2": {{
            "reasoning": "reasoning_why_there_is_no_corresponding_profile_point",
            "correction": "NO_CORRESPONDING_PROFILE_POINT"
        }},
        ...
    }}

    The reasoning should be a short explanation of why the other AI assistant might have taken liberties in what to identify.
    The correction should be the correct profile point name that corresponds to the identified segments.
    The output should be a valid JSON object. Only the JSON object should be returned. No further text or formatting should be returned.
    There should be no explanations outside of the JSON object.
    Only the fields that are specified in the example output should be returned.

    %IDENTIFIED_SEGMENTS:
    {identified_segments}

    %PROFILE_POINT_LIST:
    {profile_point_list}

    JSON_OUTPUT:

"""


class TextSegmentationDoubleCheckPrompt:
    def __init__(self):
        template_list = DoubleCheckTemplateList()
        self.double_check = PromptTemplate(
            input_variables=["identified_segments", "profile_point_list"],
            template=template_list.double_check,
        )
