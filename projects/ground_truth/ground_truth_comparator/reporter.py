"""
Reporting functionality for comparison results.
"""

from typing import List
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from tabulate import tabulate
from .models import ComparisonSummary, ComparisonResult


class ComparisonReporter:
    """Generates reports for comparison results."""
    
    def __init__(self, console: Console = None):
        self.console = console or Console()
    
    def print_summary(self, summary: ComparisonSummary) -> None:
        """Print a summary of the comparison results."""
        # Create a summary panel
        summary_text = f"""
[bold green]Total Comparisons:[/bold green] {summary.totalComparisons}
[bold green]True Positives:[/bold green] {summary.truePositives}
[bold red]False Positives:[/bold red] {summary.falsePositives}
[bold red]False Negatives:[/bold red] {summary.falseNegatives}
[bold blue]True Negatives:[/bold blue] {summary.trueNegatives}

[bold yellow]Metrics:[/bold yellow]
[bold]Precision:[/bold] {summary.precision:.4f}
[bold]Recall:[/bold] {summary.recall:.4f}
[bold]F1-Score:[/bold] {summary.f1Score:.4f}
[bold]Accuracy:[/bold] {summary.accuracy:.4f}
        """
        
        panel = Panel(
            summary_text.strip(),
            title="[bold]Comparison Summary[/bold]",
            border_style="blue"
        )
        self.console.print(panel)
    
    def print_detailed_results(self, summary: ComparisonSummary, limit: int = 20, show_true_positives: bool = False) -> None:
        """Print detailed results in a table format."""
        if not summary.detailedResults:
            self.console.print("[yellow]No detailed results to display.[/yellow]")
            return
        
        # Filter out true positives unless explicitly requested
        filtered_results = summary.detailedResults
        if not show_true_positives:
            filtered_results = [r for r in summary.detailedResults if not r.isTruePositive]
        
        if not filtered_results:
            self.console.print("[yellow]No detailed results to display (all results are true positives).[/yellow]")
            return
        
        # Create table
        table = Table(title="Detailed Comparison Results")
        table.add_column("Annotated Text ID", style="cyan", max_width=20)
        table.add_column("Profile Point ID", style="magenta", max_width=20)
        table.add_column("Ground Truth", style="green")
        table.add_column("Extracted", style="blue")
        table.add_column("Match Type", style="yellow")
        table.add_column("Result", style="bold")
        
        # Sort results by annotatedTextId
        sorted_results = sorted(filtered_results, key=lambda x: x.annotatedTextId)
        
        # Add rows (limit for readability)
        results_to_show = sorted_results[:limit]
        
        for result in results_to_show:
            # Determine result type and color
            if result.isTruePositive:
                result_text = Text("True Positive", style="bold green")
            elif result.isFalsePositive:
                result_text = Text("False Positive", style="bold red")
            elif result.isFalseNegative:
                result_text = Text("False Negative", style="bold red")
            elif result.isTrueNegative:
                result_text = Text("True Negative", style="bold blue")
            else:
                result_text = Text("Unknown", style="dim")
            
            table.add_row(
                result.annotatedTextId[:20] + "..." if len(result.annotatedTextId) > 20 else result.annotatedTextId,
                result.profilePointId[:20] + "..." if len(result.profilePointId) > 20 else result.profilePointId,
                str(result.groundTruthValue) if result.groundTruthValue else "N/A",
                str(result.extractedValue) if result.extractedValue else "N/A",
                result.matchType,
                result_text
            )
        
        self.console.print(table)
        
        if len(summary.detailedResults) > limit:
            self.console.print(f"[dim]Showing first {limit} results out of {len(summary.detailedResults)} total.[/dim]")
    
    def print_false_positives(self, summary: ComparisonSummary) -> None:
        """Print false positive results."""
        false_positives = [r for r in summary.detailedResults if r.isFalsePositive]
        
        if not false_positives:
            self.console.print("[green]No false positives found![/green]")
            return
        
        self.console.print(f"\n[bold red]False Positives ({len(false_positives)}):[/bold red]")
        
        table = Table()
        table.add_column("Annotated Text ID", style="cyan")
        table.add_column("Profile Point ID", style="magenta")
        table.add_column("Ground Truth", style="green")
        table.add_column("Extracted", style="red")
        
        for result in false_positives:
            table.add_row(
                result.annotatedTextId,
                result.profilePointId,
                str(result.groundTruthValue) if result.groundTruthValue else "N/A",
                str(result.extractedValue) if result.extractedValue else "N/A"
            )
        
        self.console.print(table)
    
    def print_false_negatives(self, summary: ComparisonSummary) -> None:
        """Print false negative results."""
        false_negatives = [r for r in summary.detailedResults if r.isFalseNegative]
        
        if not false_negatives:
            self.console.print("[green]No false negatives found![/green]")
            return
        
        self.console.print(f"\n[bold red]False Negatives ({len(false_negatives)}):[/bold red]")
        
        table = Table()
        table.add_column("Annotated Text ID", style="cyan")
        table.add_column("Profile Point ID", style="magenta")
        table.add_column("Ground Truth", style="green")
        table.add_column("Extracted", style="red")
        
        for result in false_negatives:
            table.add_row(
                result.annotatedTextId,
                result.profilePointId,
                str(result.groundTruthValue) if result.groundTruthValue else "N/A",
                str(result.extractedValue) if result.extractedValue else "N/A"
            )
        
        self.console.print(table)
    
    def print_true_positives(self, summary: ComparisonSummary) -> None:
        """Print true positive results."""
        true_positives = [r for r in summary.detailedResults if r.isTruePositive]
        
        if not true_positives:
            self.console.print("[yellow]No true positives found![/yellow]")
            return
        
        self.console.print(f"\n[bold green]True Positives ({len(true_positives)}):[/bold green]")
        
        table = Table()
        table.add_column("Annotated Text ID", style="cyan")
        table.add_column("Profile Point ID", style="magenta")
        table.add_column("Ground Truth", style="green")
        table.add_column("Extracted", style="green")
        table.add_column("Match Type", style="yellow")
        
        for result in true_positives:
            table.add_row(
                result.annotatedTextId,
                result.profilePointId,
                str(result.groundTruthValue) if result.groundTruthValue else "N/A",
                str(result.extractedValue) if result.extractedValue else "N/A",
                result.matchType
            )
        
        self.console.print(table)
    
    def export_to_csv(self, summary: ComparisonSummary, output_path: str, show_true_positives: bool = False) -> None:
        """Export detailed results to CSV format."""
        import csv
        
        with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = [
                'annotatedTextId', 'profilePointId', 'groundTruthValue', 
                'extractedValue', 'matchType', 'isTruePositive', 
                'isFalsePositive', 'isTrueNegative', 'isFalseNegative'
            ]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            
            # Filter out true positives unless explicitly requested
            filtered_results = summary.detailedResults
            if not show_true_positives:
                filtered_results = [r for r in summary.detailedResults if not r.isTruePositive]
            
            # Sort results by annotatedTextId before exporting
            sorted_results = sorted(filtered_results, key=lambda x: x.annotatedTextId)
            for result in sorted_results:
                writer.writerow({
                    'annotatedTextId': result.annotatedTextId,
                    'profilePointId': result.profilePointId,
                    'groundTruthValue': result.groundTruthValue,
                    'extractedValue': result.extractedValue,
                    'matchType': result.matchType,
                    'isTruePositive': result.isTruePositive,
                    'isFalsePositive': result.isFalsePositive,
                    'isTrueNegative': result.isTrueNegative,
                    'isFalseNegative': result.isFalseNegative
                })
        
        self.console.print(f"[green]Results exported to {output_path}[/green]")
    
    def print_all(self, summary: ComparisonSummary, show_details: bool = True, limit: int = 20, show_true_positives: bool = False) -> None:
        """Print all reports."""
        self.print_summary(summary)
        
        if show_details:
            self.print_detailed_results(summary, limit, show_true_positives)
            self.print_false_positives(summary)
            self.print_false_negatives(summary)
            
            if show_true_positives:
                self.print_true_positives(summary)
