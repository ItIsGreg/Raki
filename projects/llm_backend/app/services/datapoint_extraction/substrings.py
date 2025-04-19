from typing import Callable
from uu import Error
from rich import print
from rich.panel import Panel
from rich.syntax import Syntax

from app.llm_calls import call_llm
from app.models.datapoint_extraction_models import (
    DataPointSubstring,
    DataPointSubstringMatch,
    ExtractDatapointSubstringsReq,
    SelectSubstringReq,
)
from app.prompts.datapoint_extraction.substrings import (
    Extract_Datapoint_Substrings_Prompt_List,
)
from app.config.environment import prompt_language
from app.utils.matching import create_select_substring_text_excerpt, get_matches

prompt_list = Extract_Datapoint_Substrings_Prompt_List()


async def extract_datapoint_substrings_service(
    req: ExtractDatapointSubstringsReq,
    lang: str = prompt_language,
    call_llm_function: Callable = call_llm,
) -> list[DataPointSubstring]:

    print(Panel.fit(
        "[bold blue]Starting substring extraction service[/bold blue]",
        title="Service Start",
        border_style="blue"
    ))

    lang_prompts = {
        "de": prompt_list.extract_datapoint_substrings_german,
        "en": prompt_list.extract_datapoint_substrings,
    }

    # Convert Pydantic models to raw JSON/dict
    datapoints_json = [datapoint.model_dump() for datapoint in req.datapoints]
    
    print(Panel.fit(
        f"[bold]Processing {len(datapoints_json)} datapoints[/bold]",
        title="Datapoints",
        border_style="green"
    ))
    
    # Convert example datapoints if provided
    example_datapoints_json = None
    if req.example_datapoints:
        example_datapoints_json = [datapoint.model_dump() for datapoint in req.example_datapoints]
        print(Panel.fit(
            f"[bold]Using {len(example_datapoints_json)} example datapoints[/bold]",
            title="Example Datapoints",
            border_style="yellow"
        ))
        print(Panel.fit(
            f"[bold]Example Datapoints:[/bold]\n{example_datapoints_json}",
            title="Example Datapoints Details",
            border_style="yellow"
        ))
    else:
        print(Panel.fit(
            "[yellow]No example datapoints provided, using defaults[/yellow]",
            title="Example Datapoints",
            border_style="yellow"
        ))

    if req.example_text:
        print(Panel.fit(
            f"[bold]Example Text:[/bold]\n{req.example_text}",
            title="Example Text",
            border_style="yellow"
        ))
    else:
        print(Panel.fit(
            "[yellow]No example text provided, using defaults[/yellow]",
            title="Example Text",
            border_style="yellow"
        ))

    if req.example_output:
        print(Panel.fit(
            f"[bold]Example Output:[/bold]\n{req.example_output}",
            title="Example Output",
            border_style="yellow"
        ))
    else:
        print(Panel.fit(
            "[yellow]No example output provided, using defaults[/yellow]",
            title="Example Output",
            border_style="yellow"
        ))

    print(Panel.fit(
        f"[bold]Making LLM call with provider: {req.llm_provider}, model: {req.model}[/bold]",
        title="LLM Call",
        border_style="magenta"
    ))

    result = await call_llm_function(
        lang_prompts[lang],
        {
            "datapoints": datapoints_json,
            "text": req.text,
            "example_text": req.example_text,
            "example_datapoints": example_datapoints_json,
            "example_output": req.example_output,
        },
        llm_provider=req.llm_provider,
        model=req.model,
        llm_url=req.llm_url,
        api_key=req.api_key,
        max_tokens=req.max_tokens,
    )

    print(Panel.fit(
        f"[bold]Received LLM response with {len(result)} results[/bold]",
        title="LLM Response",
        border_style="cyan"
    ))

    def convert_result(result: dict) -> list[DataPointSubstring]:
        return [
            DataPointSubstring(name=key, substring=value)
            for key, value in result.items()
        ]

    result = convert_result(result)

    print(Panel.fit(
        f"[bold green]Successfully processed {len(result)} substrings[/bold green]",
        title="Service Complete",
        border_style="green"
    ))

    return result


async def extract_datapoint_substrings_and_match_service(
    req: ExtractDatapointSubstringsReq,
    lang: str = prompt_language,
    call_llm_function: Callable = call_llm,
) -> list[DataPointSubstringMatch]:
    print(Panel.fit(
        "[bold blue]Starting substring extraction and matching service[/bold blue]",
        title="Service Start",
        border_style="blue"
    ))

    datapoints_wo_match = await extract_datapoint_substrings_service(
        req,
        lang,
        call_llm_function,
    )
    datapoints_w_matches: list[DataPointSubstringMatch] = []

    print(Panel.fit(
        f"[bold]Processing {len(datapoints_wo_match)} substrings for matching[/bold]",
        title="Matching Phase",
        border_style="yellow"
    ))

    # Match substrings
    for datapoint in datapoints_wo_match:
        matches = get_matches(req.text, datapoint.substring)
        if not matches:
            print(f"[yellow]No matches found for datapoint: {datapoint.name}[/yellow]")
            datapoints_w_matches.append(
                DataPointSubstringMatch(
                    name=datapoint.name,
                    substring=datapoint.substring,
                    match=None,
                )
            )
            continue

        # if there are multiple matches, make another llm call to select the correct one
        if len(matches) > 1:
            print(f"[yellow]Multiple matches ({len(matches)}) found for datapoint: {datapoint.name}[/yellow]")
            text_excerpts = []
            for match in matches:
                text_excerpts.append(
                    create_select_substring_text_excerpt(match, req.text)
                )
            base_datapoint = next(
                (dp for dp in req.datapoints if dp.name == datapoint.name), None
            )
            print(Panel.fit(
                f"[bold]Making selection call for datapoint: {datapoint.name}[/bold]",
                title="Selection Call",
                border_style="magenta"
            ))
            index = await select_substring_service(
                SelectSubstringReq(
                    api_key=req.api_key,
                    llm_provider=req.llm_provider,
                    model=req.model,
                    llm_url=req.llm_url,
                    datapoint=base_datapoint,
                    substrings=text_excerpts,
                    max_tokens=req.max_tokens,
                )
            )
            try:
                # Handle case where index is just a number
                if isinstance(index, int):
                    selected_index = index
                # Handle case where index is a dict with "index" key
                elif isinstance(index, dict) and "index" in index:
                    selected_index = index["index"]
                else:
                    print(f"[red]Invalid index format: {index}[/red]")
                    selected_index = 0  # Default to first match if format is invalid

                datapoint_w_match = DataPointSubstringMatch(
                    name=datapoint.name,
                    substring=datapoint.substring,
                    match=matches[selected_index],
                )
                datapoints_w_matches.append(datapoint_w_match)
            except (IndexError, TypeError) as e:
                print(f"[red]Error selecting match: {e}[/red]")
                datapoints_w_matches.append(
                    DataPointSubstringMatch(
                        name=datapoint.name,
                        substring=datapoint.substring,
                        match=None,
                    )
                )
        else:
            print(f"[green]Single match found for datapoint: {datapoint.name}[/green]")
            datapoints_w_matches.append(
                DataPointSubstringMatch(
                    name=datapoint.name,
                    substring=datapoint.substring,
                    match=matches[0],
                )
            )

    print(Panel.fit(
        f"[bold green]Successfully processed {len(datapoints_w_matches)} matches[/bold green]",
        title="Service Complete",
        border_style="green"
    ))

    return datapoints_w_matches


async def select_substring_service(
    req: SelectSubstringReq,
    lang: str = prompt_language,
    call_llm_function: Callable = call_llm,
) -> dict:

    print(Panel.fit(
        "[bold blue]Starting substring selection service[/bold blue]",
        title="Service Start",
        border_style="blue"
    ))

    lang_prompts = {
        "de": prompt_list.select_substring_german,
        "en": prompt_list.select_substring,
    }
    
    # Handle case where datapoint is None
    datapoint_data = req.datapoint.model_dump() if req.datapoint else None
    
    print(Panel.fit(
        f"[bold]Making selection call with provider: {req.llm_provider}, model: {req.model}[/bold]",
        title="LLM Call",
        border_style="magenta"
    ))

    result = await call_llm_function(
        lang_prompts[lang],
        {
            "datapoint": datapoint_data,  # Convert to JSON or None
            "substrings": req.substrings,
        },
        llm_provider=req.llm_provider,
        llm_url=req.llm_url,
        model=req.model,
        api_key=req.api_key,
        max_tokens=req.max_tokens,
    )

    print(Panel.fit(
        f"[bold green]Received selection result: {result}[/bold green]",
        title="Service Complete",
        border_style="green"
    ))

    return result
