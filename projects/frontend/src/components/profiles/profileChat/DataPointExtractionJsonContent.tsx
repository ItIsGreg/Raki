import React from "react";
import { Profile, ProfilePointCreate } from "@/lib/db/db";
import { createProfilePoint } from "@/lib/db/crud";
import {
  isProfilePointCreate,
  handleAdoptProfilePoint,
} from "./profileChatUtils";
import JsonContent from "./JsonContent";

interface DataPointExtractionJsonContentProps {
  content: string;
  activeProfile: Profile | undefined;
}

const DataPointExtractionJsonContent: React.FC<
  DataPointExtractionJsonContentProps
> = ({ content, activeProfile }) => {
  return (
    <JsonContent<ProfilePointCreate, any>
      content={content}
      activeProfile={activeProfile}
      isValidPoint={isProfilePointCreate}
      handleAdoptPoint={handleAdoptProfilePoint}
      createPoint={createProfilePoint}
    />
  );
};

export default DataPointExtractionJsonContent;
