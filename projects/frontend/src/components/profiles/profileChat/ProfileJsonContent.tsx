import React from "react";
import { Profile } from "@/lib/db/db";
import DataPointExtractionJsonContent from "./DataPointExtractionJsonContent";
import TextSegmentationJsonContent from "./TextSegmentationJsonContent";
import { TASK_MODE } from "@/app/constants";

interface ProfileJsonContentProps {
  content: string;
  activeProfile: Profile | undefined;
}

const ProfileJsonContent: React.FC<ProfileJsonContentProps> = ({
  content,
  activeProfile,
}) => {
  if (!activeProfile) {
    return <span data-cy="plain-text-content">{content}</span>;
  }

  if (activeProfile.mode === TASK_MODE.TEXT_SEGMENTATION) {
    return (
      <TextSegmentationJsonContent
        content={content}
        activeProfile={activeProfile}
      />
    );
  }

  // Default to datapoint extraction
  return (
    <DataPointExtractionJsonContent
      content={content}
      activeProfile={activeProfile}
    />
  );
};

export default ProfileJsonContent;
