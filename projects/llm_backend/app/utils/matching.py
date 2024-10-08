import re
import logging

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


def get_matches(text: str, substring: str):
    # filter out if substring is an empty string
    if substring == "":
        return []

    pattern = create_pattern(substring)
    re_matches = list(re.finditer(pattern, text, re.IGNORECASE))
    matches = [[match.start(), match.end()] for match in re_matches]

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
