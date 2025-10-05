"""
Data models for ground truth comparison.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ProfilePoint(BaseModel):
    """Represents a profile point definition."""
    name: str
    explanation: str
    synonyms: List[str]
    datatype: str
    valueset: Optional[List[str]] = None
    unit: str
    profileId: str
    id: str
    order: int
    previousPointId: Optional[str] = None
    nextPointId: Optional[str] = None


class DataPoint(BaseModel):
    """Represents an extracted data point."""
    name: str
    value: Optional[str] = None
    match: Optional[List[int]] = None
    annotatedTextId: str
    profilePointId: str
    id: str


class AnnotatedDataset(BaseModel):
    """Represents the metadata of an annotated dataset."""
    name: str
    description: str
    datasetId: str
    profileId: str
    mode: str
    id: str


class OriginalDataset(BaseModel):
    """Represents the metadata of the original dataset."""
    name: str
    description: str
    mode: str
    id: str


class Profile(BaseModel):
    """Represents a profile definition."""
    name: str
    description: str
    mode: str
    id: str


class ExtractionResult(BaseModel):
    """Represents the complete extraction result."""
    annotatedDataset: AnnotatedDataset
    originalDataset: OriginalDataset
    profile: Profile
    profilePoints: List[ProfilePoint]
    dataPoints: List[DataPoint]


class ComparisonResult(BaseModel):
    """Represents the result of comparing two data points."""
    annotatedTextId: str
    profilePointId: str
    groundTruthValue: Optional[str] = None
    extractedValue: Optional[str] = None
    isTruePositive: bool = False
    isFalsePositive: bool = False
    isTrueNegative: bool = False
    isFalseNegative: bool = False
    matchType: str = "none"  # "exact", "partial", "none"


class ComparisonSummary(BaseModel):
    """Summary of comparison results."""
    totalComparisons: int = 0
    truePositives: int = 0
    falsePositives: int = 0
    trueNegatives: int = 0
    falseNegatives: int = 0
    precision: float = 0.0
    recall: float = 0.0
    f1Score: float = 0.0
    accuracy: float = 0.0
    detailedResults: List[ComparisonResult] = Field(default_factory=list)
