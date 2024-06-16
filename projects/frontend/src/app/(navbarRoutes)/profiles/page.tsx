"use client";
import ProfileList from "./ProfileList";
import DataPointList from "./DataPointList";
import DataPointEditor from "./DataPointEditor";
import { useState } from "react";
import { Profile, ProfilePoint } from "@/lib/db/db";

const Profiles = () => {
  const [activeProfile, setActiveProfile] = useState<Profile | undefined>();
  const [activeDataPoint, setActiveDataPoint] = useState<
    ProfilePoint | undefined
  >(undefined);
  const [creatingNewDataPoint, setCreatingNewDataPoint] =
    useState<boolean>(false);

  return (
    <div className="grid grid-cols-3 gap-4">
      <ProfileList
        activeProfile={activeProfile}
        setActiveProfile={setActiveProfile}
      />
      <DataPointList
        activeProfile={activeProfile}
        activeDataPoint={activeDataPoint}
        setActiveDataPoint={setActiveDataPoint}
        setCreatingNewDataPoint={setCreatingNewDataPoint}
      />
      <DataPointEditor
        activeProfile={activeProfile}
        activeDataPoint={activeDataPoint}
        setActiveDataPoint={setActiveDataPoint}
        creatingNewDataPoint={creatingNewDataPoint}
        setCreatingNewDataPoint={setCreatingNewDataPoint}
      />
    </div>
  );
};

export default Profiles;
