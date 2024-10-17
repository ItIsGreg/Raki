import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProfile, readAllProfiles, updateProfile } from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { ProfileListProps } from "../../types";
import ProfileCard from "./ProfileCard";
import EntityForm from "@/components/EntityForm";
import { Profile } from "@/lib/db/db";

const ProfileList = (props: ProfileListProps) => {
  const { activeProfile, setActiveProfile } = props;

  const [addingProfile, setAddingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | undefined>(
    undefined
  );
  const dbProfiles = useLiveQuery(() => readAllProfiles());

  const handleCancelAddProfile = () => {
    setAddingProfile(false);
  };

  const handleSaveProfile = (profile: Profile) => {
    if (profile.id) {
      updateProfile(profile);
    } else {
      createProfile(profile);
    }
  };

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Profiles</CardTitle>
          <div className="flex-grow"></div>
          <Button onClick={() => setAddingProfile(true)}>Add</Button>
        </CardHeader>
        <CardContent>
          {addingProfile && (
            <EntityForm<Profile>
              onCancel={handleCancelAddProfile}
              onSave={handleSaveProfile}
              entityType="Profile"
            />
          )}
          {dbProfiles &&
            dbProfiles.map((profile) => {
              if (editingProfile && editingProfile.id === profile.id) {
                return (
                  <EntityForm<Profile>
                    key={profile.id}
                    onCancel={() => setEditingProfile(undefined)}
                    onSave={handleSaveProfile}
                    existingEntity={editingProfile}
                    entityType="Profile"
                  />
                );
              }
              return (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  activeProfile={activeProfile}
                  setActiveProfile={setActiveProfile}
                  setEditingProfile={setEditingProfile}
                />
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileList;
