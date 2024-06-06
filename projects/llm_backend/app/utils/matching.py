import re


# There is some newline weirdness going on in the transcribed discharge summarie.
# Need some regex magic to cope with it.
def create_pattern(substring: str):
    # Escape special regex characters in the substring
    escaped_substring = substring.encode("unicode_escape").decode()
    # escape parenthesis
    # escaped_substring = escaped_substring.replace("(", r"\(")
    # escaped_substring = escaped_substring.replace(")", r"\)")
    # escaped_substring = escaped_substring.replace("$", r"\$")

    # # Replace escaped newline characters with a pattern that allows optional whitespace
    # pattern = escaped_substring.replace(r"\n", r"\s*?\n")
    pattern = escaped_substring

    return pattern


def get_matches(text: str, substring: str):
    pattern = create_pattern(substring)
    print("pattern", pattern)
    re_matches = list(re.finditer(pattern, text, re.IGNORECASE))
    print("re_matches", re_matches)
    matches = [[match.start(), match.end()] for match in re_matches]
    print("matches", matches)
    return matches
