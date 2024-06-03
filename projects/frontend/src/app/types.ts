import { Profile, ProfilePoint } from "@/lib/db/db";

export interface ProfileListProps {
  activeProfile: Profile | undefined;
  setActiveProfile: (profile: Profile) => void;
}

export interface DataPointListProps {
  activeProfile: Profile | undefined;
  setActiveDataPoint: (dataPoint: ProfilePoint | undefined) => void;
  setCreatingNewDataPoint: (creating: boolean) => void;
}

export interface DataPointEditorProps {
  activeDataPoint: ProfilePoint | undefined;
  setActiveDataPoint: (dataPoint: ProfilePoint | undefined) => void;
  creatingNewDataPoint: boolean;
  setCreatingNewDataPoint: (creating: boolean) => void;
  activeProfile: Profile | undefined;
}
