"use client";
import { useState } from "react";
import {
  Profile,
  ProfilePoint,
  SegmentationProfilePoint,
  SegmentationProfilePointCreate,
} from "@/lib/db/db";
import ProfileList from "@/components/profiles/ProfileList";
import DataPointEditorSegmentation from "@/components/profiles/DataPointEditorSegmentation";
import DataPointList from "@/components/profiles/DataPointList";
import { TASK_MODE } from "@/app/constants";
import { readSegmentationProfilePointsByProfile } from "@/lib/db/crud";
import { createSegmentationProfilePoint } from "@/lib/db/crud";

const Profiles = () => {
  const [activeProfile, setActiveProfile] = useState<Profile | undefined>();
  const [activeDataPoint, setActiveDataPoint] = useState<
    SegmentationProfilePoint | undefined
  >(undefined);
  const [creatingNewDataPoint, setCreatingNewDataPoint] =
    useState<boolean>(false);

  return (
    <div className="grid grid-cols-3 gap-4 h-full" data-cy="profiles-page">
      <ProfileList
        activeProfile={activeProfile}
        setActiveProfile={setActiveProfile}
        mode={TASK_MODE.TEXT_SEGMENTATION}
        data-cy="profile-list"
      />
      <DataPointList
        activeProfile={activeProfile}
        activeDataPoint={activeDataPoint}
        setActiveDataPoint={(dataPoint) =>
          setActiveDataPoint(dataPoint as SegmentationProfilePoint | undefined)
        }
        setCreatingNewDataPoint={setCreatingNewDataPoint}
        readPointsByProfile={readSegmentationProfilePointsByProfile}
        createPoint={(point) =>
          createSegmentationProfilePoint(
            point as SegmentationProfilePointCreate
          )
        }
        data-cy="datapoint-list"
      />
      <DataPointEditorSegmentation
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
