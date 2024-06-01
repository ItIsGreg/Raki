def handle_json_prefix(result_structured):
    if result_structured.startswith("```json\n"):
        result_structured = result_structured[8:]
        # remove end backticks
        result_structured = result_structured[:-4]
    return result_structured
