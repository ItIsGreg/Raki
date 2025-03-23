"use client";
import { useState } from "react";
import { Profile, ProfilePoint } from "@/lib/db/db";
import ProfileList from "@/components/profiles/ProfileList";
import DataPointEditor from "@/components/profiles/DataPointEditor";
import DataPointList from "@/components/profiles/DataPointList";

const Profiles = () => {
  const [activeProfile, setActiveProfile] = useState<Profile | undefined>();
  const [activeDataPoint, setActiveDataPoint] = useState<
    ProfilePoint | undefined
  >(undefined);
  const [creatingNewDataPoint, setCreatingNewDataPoint] =
    useState<boolean>(false);

  return (
    <div className="grid grid-cols-3 gap-4 h-full" data-cy="profiles-page">
      <ProfileList
        activeProfile={activeProfile}
        setActiveProfile={setActiveProfile}
        data-cy="profile-list"
      />
      <DataPointList
        activeProfile={activeProfile}
        activeDataPoint={activeDataPoint}
        setActiveDataPoint={setActiveDataPoint}
        setCreatingNewDataPoint={setCreatingNewDataPoint}
        data-cy="datapoint-list"
      />
      <DataPointEditor
        activeProfile={activeProfile}
        activeDataPoint={activeDataPoint}
        setActiveDataPoint={setActiveDataPoint}
        creatingNewDataPoint={creatingNewDataPoint}
        setCreatingNewDataPoint={setCreatingNewDataPoint}
        data-cy="datapoint-editor"
      />
    </div>
  );
};

export default Profiles;
