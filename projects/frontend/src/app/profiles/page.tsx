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
  >();

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      <ProfileList
        activeProfile={activeProfile}
        setActiveProfile={setActiveProfile}
      />
      <DataPointList
        activeProfile={activeProfile}
        setActiveDataPoint={setActiveDataPoint}
      />
      <DataPointEditor
        activeDataPoint={activeDataPoint}
        setActiveDataPoint={setActiveDataPoint}
      />
    </div>
  );
};

export default Profiles;
