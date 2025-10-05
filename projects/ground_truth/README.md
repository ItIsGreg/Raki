# Ground Truth Comparator

A CLI tool for comparing medical text extraction results against ground truth data.

## Installation

1. Navigate to the project directory:
   ```bash
   cd projects/ground_truth
   ```

2. Install the package in development mode:
   ```bash
   pip install -e .
   ```

## Usage

### Basic Comparison

Compare two JSON files containing extraction results:

```bash
ground-truth-compare ground-truth.json extracted-results.json
```

### Advanced Options

```bash
# Export detailed results to CSV
ground-truth-compare ground-truth.json extracted-results.json --output results.csv

# Show only summary (no detailed results)
ground-truth-compare ground-truth.json extracted-results.json --no-details

# Limit detailed results shown
ground-truth-compare ground-truth.json extracted-results.json --limit 10

# Export to CSV only (no console output)
ground-truth-compare ground-truth.json extracted-results.json --csv-only --output results.csv
```

## Input Format

The tool expects JSON files with the following structure:

```json
{
  "annotatedDataset": { ... },
  "originalDataset": { ... },
  "profile": { ... },
  "profilePoints": [ ... ],
  "dataPoints": [
    {
      "name": "Parameter Name",
      "value": "extracted_value",
      "match": [1, 2, 3],
      "annotatedTextId": "text-id",
      "profilePointId": "profile-point-id",
      "id": "data-point-id"
    }
  ]
}
```

## Output

The tool provides:

1. **Summary Metrics**:
   - Total comparisons
   - True Positives, False Positives, False Negatives, True Negatives
   - Precision, Recall, F1-Score, Accuracy

2. **Detailed Results**: Table showing individual comparisons

3. **False Positives**: Cases where extraction found something not in ground truth

4. **False Negatives**: Cases where ground truth has something not extracted

5. **CSV Export**: Detailed results in CSV format for further analysis

## Comparison Logic

The tool compares data points based on:
- `annotatedTextId`: Identifies the text being analyzed
- `profilePointId`: Identifies the specific parameter being extracted
- `value`: The extracted value (normalized for comparison)

**Match Types**:
- **True Positive**: Both files have the same parameter with matching values
- **False Positive**: Extraction found a parameter not in ground truth, or values don't match
- **False Negative**: Ground truth has a parameter not found in extraction
- **True Negative**: Neither file has the parameter (rare in this context)

## Example

```bash
# Compare the example files
ground-truth-compare scripts-to-compare/ground-truth.json "scripts-to-compare/Model_ gpt-4o-mini, prompt-version_ 1_2025-10-01T17-10-43-662Z_annotated_dataset.json"
```
