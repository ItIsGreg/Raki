import React from "react";
import { Profile, SegmentationProfilePointCreate } from "@/lib/db/db";
import { createSegmentationProfilePoint } from "@/lib/db/crud";
import {
  isSegmentationProfilePointCreate,
  handleAdoptSegmentationProfilePoint,
} from "./profileChatSegmentationUtils";
import JsonContent from "./JsonContent";

interface TextSegmentationJsonContentProps {
  content: string;
  activeProfile: Profile | undefined;
}

const TextSegmentationJsonContent: React.FC<
  TextSegmentationJsonContentProps
> = ({ content, activeProfile }) => {
  return (
    <JsonContent<SegmentationProfilePointCreate, any>
      content={content}
      activeProfile={activeProfile}
      isValidPoint={isSegmentationProfilePointCreate}
      handleAdoptPoint={handleAdoptSegmentationProfilePoint}
      createPoint={createSegmentationProfilePoint}
    />
  );
};

export default TextSegmentationJsonContent;
