from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, DateTime, JSON, ARRAY
from sqlalchemy.sql.sqltypes import Text as TextType
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.config.database import Base

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)  # Nullable for local workspaces
    name = Column(String, nullable=False)
    description = Column(TextType)
    storage_type = Column(String, nullable=False)  # 'local' | 'cloud'
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="workspaces")
    profiles = relationship("Profile", back_populates="workspace", cascade="all, delete-orphan")
    datasets = relationship("Dataset", back_populates="workspace", cascade="all, delete-orphan")
    annotated_datasets = relationship("AnnotatedDataset", back_populates="workspace", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(TextType)
    mode = Column(String, nullable=False)  # TaskMode: datapoint_extraction | text_segmentation
    example = Column(JSON)  # {text: string, output: Record<string, string>}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="profiles")
    workspace = relationship("Workspace", back_populates="profiles")
    profile_points = relationship("ProfilePoint", back_populates="profile", cascade="all, delete-orphan")
    segmentation_profile_points = relationship("SegmentationProfilePoint", back_populates="profile", cascade="all, delete-orphan")
    annotated_datasets = relationship("AnnotatedDataset", back_populates="profile")

class ProfilePoint(Base):
    __tablename__ = "profile_points"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    explanation = Column(TextType)
    synonyms = Column(ARRAY(String), default=list)
    datatype = Column(String, nullable=False)
    valueset = Column(ARRAY(String))
    unit = Column(String)
    order = Column(Integer, default=0)
    previous_point_id = Column(UUID(as_uuid=True), ForeignKey("profile_points.id"))
    next_point_id = Column(UUID(as_uuid=True), ForeignKey("profile_points.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    profile = relationship("Profile", back_populates="profile_points")
    data_points = relationship("DataPoint", back_populates="profile_point")

class SegmentationProfilePoint(Base):
    __tablename__ = "segmentation_profile_points"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    explanation = Column(TextType)
    synonyms = Column(ARRAY(String), default=list)
    order = Column(Integer, default=0)
    previous_point_id = Column(UUID(as_uuid=True), ForeignKey("segmentation_profile_points.id"))
    next_point_id = Column(UUID(as_uuid=True), ForeignKey("segmentation_profile_points.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    profile = relationship("Profile", back_populates="segmentation_profile_points")
    segment_data_points = relationship("SegmentDataPoint", back_populates="profile_point")

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(TextType)
    mode = Column(String, nullable=False)  # TaskMode
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="datasets")
    workspace = relationship("Workspace", back_populates="datasets")
    texts = relationship("Text", back_populates="dataset", cascade="all, delete-orphan")
    annotated_datasets = relationship("AnnotatedDataset", back_populates="dataset")

class Text(Base):
    __tablename__ = "texts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    text = Column(TextType, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    dataset = relationship("Dataset", back_populates="texts")
    annotated_texts = relationship("AnnotatedText", back_populates="text")

class AnnotatedDataset(Base):
    __tablename__ = "annotated_datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(TextType)
    mode = Column(String, nullable=False)  # TaskMode
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="annotated_datasets")
    workspace = relationship("Workspace", back_populates="annotated_datasets")
    dataset = relationship("Dataset", back_populates="annotated_datasets")
    profile = relationship("Profile", back_populates="annotated_datasets")
    annotated_texts = relationship("AnnotatedText", back_populates="annotated_dataset", cascade="all, delete-orphan")

class AnnotatedText(Base):
    __tablename__ = "annotated_texts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    text_id = Column(UUID(as_uuid=True), ForeignKey("texts.id", ondelete="CASCADE"), nullable=False, index=True)
    annotated_dataset_id = Column(UUID(as_uuid=True), ForeignKey("annotated_datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    verified = Column(Boolean)
    ai_faulty = Column(Boolean)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    text = relationship("Text", back_populates="annotated_texts")
    annotated_dataset = relationship("AnnotatedDataset", back_populates="annotated_texts")
    data_points = relationship("DataPoint", back_populates="annotated_text", cascade="all, delete-orphan")
    segment_data_points = relationship("SegmentDataPoint", back_populates="annotated_text", cascade="all, delete-orphan")

class DataPoint(Base):
    __tablename__ = "data_points"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    annotated_text_id = Column(UUID(as_uuid=True), ForeignKey("annotated_texts.id", ondelete="CASCADE"), nullable=False, index=True)
    profile_point_id = Column(UUID(as_uuid=True), ForeignKey("profile_points.id"))
    name = Column(String, nullable=False)
    value = Column(String)  # Store as string, can be converted as needed
    match = Column(ARRAY(Integer))  # Array of match indices
    verified = Column(Boolean)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    annotated_text = relationship("AnnotatedText", back_populates="data_points")
    profile_point = relationship("ProfilePoint", back_populates="data_points")

class SegmentDataPoint(Base):
    __tablename__ = "segment_data_points"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    annotated_text_id = Column(UUID(as_uuid=True), ForeignKey("annotated_texts.id", ondelete="CASCADE"), nullable=False, index=True)
    profile_point_id = Column(UUID(as_uuid=True), ForeignKey("segmentation_profile_points.id"))
    name = Column(String, nullable=False)
    begin_match = Column(ARRAY(Integer))  # Array of begin match indices
    end_match = Column(ARRAY(Integer))    # Array of end match indices
    verified = Column(Boolean)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    annotated_text = relationship("AnnotatedText", back_populates="segment_data_points")
    profile_point = relationship("SegmentationProfilePoint", back_populates="segment_data_points")

# User settings and LLM configurations - these remain user-specific
class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    tutorial_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="settings")

class UserLLMConfig(Base):
    __tablename__ = "user_llm_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    api_key = Column(String)
    llm_provider = Column(String)
    llm_model = Column(String)
    llm_url = Column(String)
    batch_size = Column(Integer, default=10)
    max_tokens = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="llm_configs") 