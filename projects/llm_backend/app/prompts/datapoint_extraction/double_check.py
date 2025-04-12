from langchain.prompts import PromptTemplate


class DoubleCheckTemplateList:
    def __init__(self) -> None:
        self.double_check = """
    You are a helpful AI assistant. Your task is to help extract datapoints from a text.
    Your specific task will be to double check extracted datapoints from another AI assistant.
    You will be given some substrings that were extracted from a text by another AI assistant.
    It was already determined that these substrings and their allocation to a predefined profile point is not correct.
    Especially that the profile point that was allocated does not exist in the profile point list of datapoints that are supposed to be extracted.
    So it is likely that the other AI assistant took liberties in what to extract.

    You will be provided the list of extracted substrings and the supposedly existing profile point that was allocated to them.
    Furthermore you will be provided the profile point list that is supposed to be used for the extraction.

    You should determine, whether there is a profile point in the profile point list, that actually corresponds to the extracted substrings.
    If there is, you should return the profile point name.
    If there is no corresponding profile point, you should return "NO_CORRESPONDING_PROFILE_POINT".

    The input will look like this:

    extracted_substrings:
    {{
        "supposed_profile_point_1": {{
            "substring": "extracted_substring_1",
            "text": "text_from_which_substring_was_extracted"
        }},
        "supposed_profile_point_2": {{
            "substring": "extracted_substring_2",
            "text": "text_from_which_substring_was_extracted"
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

    The reasoning should be a short explanation of why the other AI assistant might have taken liberties in what to extract.
    The correction should be the correct profile point name that corresponds to the extracted substrings.

    %EXTRACTED_SUBSTRINGS:
    {extracted_substrings}

    %PROFILE_POINT_LIST:
    {profile_point_list}

    JSON_OUTPUT:

"""


class ProfileChatPrompt:
    def __init__(self):
        template_list = DoubleCheckTemplateList()
        self.double_check = PromptTemplate(
            input_variables=["extracted_substrings", "profile_point_list"],
            template=template_list.double_check,
        )
