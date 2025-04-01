import re
import logging
from fuzzywuzzy import process, fuzz
from rich import print as rprint
from rich.console import Console

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

console = Console()

# There is some newline weirdness going on in the transcribed discharge summarie.
# Need some regex magic to cope with it.
def create_pattern(substring: str):
    # Escape special regex characters in the substring
    escaped_substring = substring.encode("unicode_escape").decode()
    
    # Escape common regex special characters
    escaped_substring = escaped_substring.replace("*", r"\*")  # Fix markdown asterisks
    escaped_substring = escaped_substring.replace("(", r"\(")  # Fix parentheses
    escaped_substring = escaped_substring.replace(")", r"\)")
    escaped_substring = escaped_substring.replace("[", r"\[")  # Fix square brackets
    escaped_substring = escaped_substring.replace("]", r"\]")
    escaped_substring = escaped_substring.replace(".", r"\.")  # Fix dots
    escaped_substring = escaped_substring.replace("+", r"\+")  # Fix plus signs
    escaped_substring = escaped_substring.replace("?", r"\?")  # Fix question marks
    escaped_substring = escaped_substring.replace("|", r"\|")  # Fix pipes
    escaped_substring = escaped_substring.replace("$", r"\$")  # Fix dollar signs
    escaped_substring = escaped_substring.replace("^", r"\^")  # Fix carets
    
    pattern = escaped_substring
    return pattern


def normalize_text(text: str) -> str:
    # Normalize whitespace and newlines
    text = ' '.join(text.split())
    # Normalize unicode characters (like µ)
    text = text.replace('µ', 'u')
    return text


def fuzzy_matching(substring, main_string, offset_index: int = 0):
    # Normalize both strings for comparison
    normalized_substring = normalize_text(substring)
    normalized_main_string = normalize_text(main_string[offset_index:])
    
    # Split the main string into words
    words = normalized_main_string.split()

    # Create a list of all possible substrings with their positions
    possible_matches = []
    current_pos = offset_index
    
    for i in range(len(words) - len(normalized_substring.split()) + 1):
        match_text = " ".join(words[i : i + len(normalized_substring.split())])
        # Find position in original string
        while current_pos < len(main_string):
            # Look for the first word of our match
            start_pos = main_string.find(words[i], current_pos)
            if start_pos == -1:
                break
                
            # Check if this position contains our full match
            normalized_slice = normalize_text(main_string[start_pos:start_pos + len(match_text) + 10])
            if normalized_slice.startswith(match_text):
                possible_matches.append((match_text, start_pos))
                current_pos = start_pos + 1
                break
            current_pos = start_pos + 1

    # Find the best match using fuzzywuzzy
    if possible_matches:
        best_match, score = process.extractOne(
            normalized_substring, 
            [m[0] for m in possible_matches], 
            scorer=fuzz.ratio
        )
        
        # Get the position of our best match
        match_index = [m[0] for m in possible_matches].index(best_match)
        start_pos = possible_matches[match_index][1]
        
        return best_match, score, start_pos
    
    return None, 0, -1


def get_matches(text: str, substring: str, offset_index: int = 0):
    # filter out if substring is None or empty string
    if not substring or substring.strip() == "":
        return []

    try:
        pattern = create_pattern(substring)
        re_matches = list(re.finditer(pattern, text[offset_index:], re.IGNORECASE))
        # Adjust match positions to account for offset
        matches = [[match.start() + offset_index, match.end() + offset_index] for match in re_matches]

        if len(matches) == 0:
            # Pass offset to fuzzy matching
            best_match, score, start_pos = fuzzy_matching(substring, text, offset_index)
            if score > 80 and start_pos != -1:
                matches.append([start_pos, start_pos + len(best_match)])

        return matches
    except re.error as e:
        # Pass offset to fuzzy matching in error case too
        best_match, score, start_pos = fuzzy_matching(substring, text, offset_index)
        if score > 80 and start_pos != -1:
            return [[start_pos, start_pos + len(best_match)]]
        return []


def create_select_substring_text_excerpt(match, text, window_size=50):
    start = max(0, match[0] - window_size)
    end = min(len(text), match[1] + window_size)
    # mark the match with @@
    text = text[: match[0]] + "@@" + text[match[0] : match[1]] + "@@" + text[match[1] :]
    return text[start:end]
