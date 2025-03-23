"use client";
import { useState } from "react";
import {
  Profile,
  ProfilePoint,
  ProfilePointCreate,
  SegmentationProfilePoint,
} from "@/lib/db/db";
import ProfileList from "@/components/profiles/ProfileList";
import DataPointEditor from "@/components/profiles/DataPointEditor";
import DataPointList from "@/components/profiles/DataPointList";
import { TASK_MODE } from "@/app/constants";
import { createProfilePoint, readProfilePointsByProfile } from "@/lib/db/crud";

const Profiles = () => {
  const [activeProfile, setActiveProfile] = useState<Profile | undefined>();
  const [activeDataPoint, setActiveDataPoint] = useState<
    ProfilePoint | SegmentationProfilePoint | undefined
  >(undefined);
  const [creatingNewDataPoint, setCreatingNewDataPoint] =
    useState<boolean>(false);

  return (
    <div className="grid grid-cols-3 gap-4 h-full" data-cy="profiles-page">
      <ProfileList
        activeProfile={activeProfile}
        setActiveProfile={setActiveProfile}
        mode={TASK_MODE.DATAPOINT_EXTRACTION}
        data-cy="profile-list"
      />
      <DataPointList
        activeProfile={activeProfile}
        activeDataPoint={activeDataPoint}
        setActiveDataPoint={setActiveDataPoint}
        setCreatingNewDataPoint={setCreatingNewDataPoint}
        readPointsByProfile={readProfilePointsByProfile}
        createPoint={(point) => createProfilePoint(point as ProfilePointCreate)}
        data-cy="datapoint-list"
      />
      <DataPointEditor
        activeProfile={activeProfile}
        activeDataPoint={activeDataPoint as ProfilePoint | undefined}
        setActiveDataPoint={setActiveDataPoint}
        creatingNewDataPoint={creatingNewDataPoint}
        setCreatingNewDataPoint={setCreatingNewDataPoint}
        data-cy="datapoint-editor"
      />
    </div>
  );
};

export default Profiles;
