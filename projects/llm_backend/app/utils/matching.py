import re
import logging
from fuzzywuzzy import process, fuzz
from rich import print

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


# There is some newline weirdness going on in the transcribed discharge summarie.
# Need some regex magic to cope with it.
def create_pattern(substring: str):
    # Escape special regex characters in the substring
    escaped_substring = substring.encode("unicode_escape").decode()
    # escape parenthesis
    # escaped_substring = escaped_substring.replace("(", r"\(")
    # escaped_substring = escaped_substring.replace(")", r"\)")
    # escaped_substring = escaped_substring.replace("$", r"\$")
    # escape pipes
    escaped_substring = escaped_substring.replace("|", r"\|")

    # # Replace escaped newline characters with a pattern that allows optional whitespace
    # pattern = escaped_substring.replace(r"\n", r"\s*?\n")
    pattern = escaped_substring

    return pattern


def fuzzy_matching(substring, main_string):
    # Split the main string into words
    words = main_string.split()

    # Create a list of all possible substrings of the same length as the input substring
    possible_matches = [
        " ".join(words[i : i + len(substring.split())])
        for i in range(len(words) - len(substring.split()) + 1)
    ]

    # Find the best match using fuzzywuzzy
    best_match, score = process.extractOne(
        substring, possible_matches, scorer=fuzz.ratio
    )

    return best_match, score


def get_matches(text: str, substring: str):
    # filter out if substring is an empty string
    if substring == "":
        return []

    pattern = create_pattern(substring)
    re_matches = list(re.finditer(pattern, text, re.IGNORECASE))
    matches = [[match.start(), match.end()] for match in re_matches]

    # add fuzzy matching if no matches are found
    if len(matches) == 0:
        print(f"No matches found for substring: {substring}")
        print("Using fuzzy matching")
        best_match, score = fuzzy_matching(substring, text)
        print(f"Best match: {best_match}")
        print(f"Score: {score}")
        if score > 80:
            matches.append(
                [text.find(best_match), text.find(best_match) + len(best_match)]
            )
        else:
            print("No good fuzzy match found")

    # add some logging
    # log if more than one match is found
    if len(matches) > 1:
        logger.debug(f"More than one match found for substring: {substring}")
        logger.debug(f"Pattern: {pattern}")
        logger.debug(f"Re matches: {re_matches}")
        logger.debug(f"Matches: {matches}")

    return matches


def create_select_substring_text_excerpt(match, text, window_size=50):
    # # some logging
    # logger.debug(f"Match: {match}")
    # logger.debug(f"Text: {text}")
    # logger.debug(f"Window size: {window_size}")
    start = max(0, match[0] - window_size)
    end = min(len(text), match[1] + window_size)
    # mark the match with @@
    text = text[: match[0]] + "@@" + text[match[0] : match[1]] + "@@" + text[match[1] :]
    return text[start:end]
