"""
Core comparison logic for ground truth evaluation.
"""

import json
from typing import Dict, List, Tuple
from .models import (
    ExtractionResult, 
    DataPoint, 
    ComparisonResult, 
    ComparisonSummary,
    ProfilePoint
)


class GroundTruthComparator:
    """Compares extraction results against ground truth data."""
    
    def __init__(self, ground_truth_path: str, extracted_path: str):
        """Initialize the comparator with file paths."""
        self.ground_truth_path = ground_truth_path
        self.extracted_path = extracted_path
        self.ground_truth: ExtractionResult = None
        self.extracted: ExtractionResult = None
        
    def load_data(self) -> None:
        """Load both JSON files."""
        with open(self.ground_truth_path, 'r', encoding='utf-8') as f:
            ground_truth_data = json.load(f)
            self.ground_truth = ExtractionResult(**ground_truth_data)
            
        with open(self.extracted_path, 'r', encoding='utf-8') as f:
            extracted_data = json.load(f)
            self.extracted = ExtractionResult(**extracted_data)
    
    def _create_data_point_lookup(self, data_points: List[DataPoint]) -> Dict[Tuple[str, str], DataPoint]:
        """Create a lookup dictionary for data points by (annotatedTextId, profilePointId)."""
        lookup = {}
        for dp in data_points:
            key = (dp.annotatedTextId, dp.profilePointId)
            lookup[key] = dp
        return lookup
    
    def _normalize_value(self, value: str) -> str:
        """Normalize values for comparison (lowercase, strip whitespace)."""
        if value is None:
            return ""
        return str(value).lower().strip()
    
    def _values_match(self, value1: str, value2: str) -> Tuple[bool, str]:
        """
        Check if two values match.
        Returns (is_match, match_type) where match_type is 'exact', 'partial', or 'none'.
        """
        norm1 = self._normalize_value(value1)
        norm2 = self._normalize_value(value2)
        
        if norm1 == norm2:
            return True, "exact"
        
        # Check for partial matches (one contains the other)
        if norm1 and norm2:
            if norm1 in norm2 or norm2 in norm1:
                return True, "partial"
        
        return False, "none"
    
    def compare(self) -> ComparisonSummary:
        """Perform the comparison between ground truth and extracted data."""
        if not self.ground_truth or not self.extracted:
            raise ValueError("Data not loaded. Call load_data() first.")
        
        # Create lookups for efficient comparison
        gt_lookup = self._create_data_point_lookup(self.ground_truth.dataPoints)
        ext_lookup = self._create_data_point_lookup(self.extracted.dataPoints)
        
        # Get all unique combinations of annotatedTextId and profilePointId
        all_keys = set(gt_lookup.keys()) | set(ext_lookup.keys())
        
        detailed_results = []
        true_positives = 0
        false_positives = 0
        true_negatives = 0
        false_negatives = 0
        
        for annotated_text_id, profile_point_id in all_keys:
            gt_point = gt_lookup.get((annotated_text_id, profile_point_id))
            ext_point = ext_lookup.get((annotated_text_id, profile_point_id))
            
            result = ComparisonResult(
                annotatedTextId=annotated_text_id,
                profilePointId=profile_point_id,
                groundTruthValue=gt_point.value if gt_point else None,
                extractedValue=ext_point.value if ext_point else None
            )
            
            # Determine the type of match
            if gt_point and ext_point:
                # Both exist - check if values match
                is_match, match_type = self._values_match(gt_point.value, ext_point.value)
                result.matchType = match_type
                
                if is_match:
                    result.isTruePositive = True
                    true_positives += 1
                else:
                    result.isFalsePositive = True
                    false_positives += 1
                    
            elif gt_point and not ext_point:
                # Ground truth exists but extraction doesn't - False Negative
                result.isFalseNegative = True
                false_negatives += 1
                
            elif not gt_point and ext_point:
                # Extraction exists but ground truth doesn't - False Positive
                result.isFalsePositive = True
                false_positives += 1
                
            else:
                # Neither exists - True Negative (shouldn't happen with our key set)
                result.isTrueNegative = True
                true_negatives += 1
            
            detailed_results.append(result)
        
        # Calculate metrics
        total_comparisons = len(detailed_results)
        precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0.0
        recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0.0
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
        accuracy = (true_positives + true_negatives) / total_comparisons if total_comparisons > 0 else 0.0
        
        return ComparisonSummary(
            totalComparisons=total_comparisons,
            truePositives=true_positives,
            falsePositives=false_positives,
            trueNegatives=true_negatives,
            falseNegatives=false_negatives,
            precision=precision,
            recall=recall,
            f1Score=f1_score,
            accuracy=accuracy,
            detailedResults=detailed_results
        )
