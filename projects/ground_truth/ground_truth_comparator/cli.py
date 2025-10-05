"""
Command-line interface for ground truth comparison.
"""

import json
import click
from pathlib import Path
from rich.console import Console
from .comparator import GroundTruthComparator
from .reporter import ComparisonReporter


@click.command()
@click.argument('ground_truth', type=click.Path(exists=True, path_type=Path))
@click.argument('extracted', type=click.Path(exists=True, path_type=Path))
@click.option('--output', '-o', type=click.Path(path_type=Path), 
              help='Output CSV file path for detailed results')
@click.option('--limit', '-l', default=20, type=int,
              help='Limit number of detailed results shown (default: 20)')
@click.option('--no-details', is_flag=True,
              help='Skip showing detailed results')
@click.option('--csv-only', is_flag=True,
              help='Only export to CSV, no console output')
@click.option('--true-positive', is_flag=True,
              help='Show true positive results')
@click.version_option(version='0.1.0')
def main(ground_truth: Path, extracted: Path, output: Path, limit: int, 
         no_details: bool, csv_only: bool, true_positive: bool):
    """
    Compare medical text extraction results against ground truth.
    
    GROUND_TRUTH: Path to the ground truth JSON file
    EXTRACTED: Path to the extracted results JSON file
    
    Example:
        ground-truth-compare ground-truth.json extracted-results.json
    """
    console = Console()
    
    try:
        # Initialize comparator
        comparator = GroundTruthComparator(str(ground_truth), str(extracted))
        
        # Load data
        console.print("[blue]Loading data files...[/blue]")
        comparator.load_data()
        
        # Perform comparison
        console.print("[blue]Performing comparison...[/blue]")
        summary = comparator.compare()
        
        # Initialize reporter
        reporter = ComparisonReporter(console)
        
        if csv_only:
            # Only export to CSV
            if not output:
                output = Path("comparison_results.csv")
            reporter.export_to_csv(summary, str(output), show_true_positives=true_positive)
        else:
            # Show results
            reporter.print_all(summary, show_details=not no_details, limit=limit, show_true_positives=true_positive)
            
            # Export to CSV if requested
            if output:
                reporter.export_to_csv(summary, str(output), show_true_positives=true_positive)
    
    except FileNotFoundError as e:
        console.print(f"[red]Error: File not found - {e}[/red]")
        raise click.Abort()
    except json.JSONDecodeError as e:
        console.print(f"[red]Error: Invalid JSON format - {e}[/red]")
        raise click.Abort()
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise click.Abort()


if __name__ == '__main__':
    main()
