import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readAllProfiles } from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { ProfileListProps } from "../../types";
import ProfileCard from "./ProfileCard";
import AddProfileForm from "./AddProfileForm";

const ProfileList = (props: ProfileListProps) => {
  const { activeProfile, setActiveProfile } = props;

  const [addingProfile, setAddingProfile] = useState(false);
  const dbProfiles = useLiveQuery(() => readAllProfiles());

  const handleCancelAddProfile = () => {
    setAddingProfile(false);
  };

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Profiles</CardTitle>
          <div className="flex-grow"></div>
          <Button
            onClick={() => {
              setAddingProfile(true);
            }}
          >
            Add
          </Button>
        </CardHeader>
        <CardContent>
          {addingProfile && (
            <AddProfileForm onCancel={handleCancelAddProfile} />
          )}
          {dbProfiles &&
            dbProfiles.map((profile) => {
              return (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  activeProfile={activeProfile}
                  setActiveProfile={setActiveProfile}
                />
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileList;
