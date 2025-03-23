import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createProfile,
  readProfilesByMode,
  updateProfile,
} from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import ProfileCard from "./ProfileCard";
import EntityForm from "@/components/EntityForm";
import { Profile } from "@/lib/db/db";
import { AddButton } from "@/components/AddButton";
import { ProfileListProps } from "@/app/types";

const ProfileList = (props: ProfileListProps) => {
  const { activeProfile, setActiveProfile, mode } = props;

  const [addingProfile, setAddingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | undefined>(
    undefined
  );
  const dbProfiles = useLiveQuery(() => readProfilesByMode(mode), [mode]);

  const handleCancelAddProfile = () => {
    setAddingProfile(false);
  };

  const handleSaveProfile = (profile: Profile) => {
    const profileWithMode = { ...profile, mode };

    if (profileWithMode.id) {
      updateProfile(profileWithMode);
    } else {
      createProfile(profileWithMode);
    }
    setAddingProfile(false);
    setEditingProfile(undefined);
  };

  return (
    <div className="overflow-y-scroll" data-cy="profile-list-container">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Profiles</CardTitle>
          <div className="flex-grow"></div>
          <AddButton
            onClick={() => setAddingProfile(true)}
            label="Profile"
            data-cy="add-profile-button"
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {addingProfile && (
            <EntityForm<Profile>
              onCancel={handleCancelAddProfile}
              onSave={handleSaveProfile}
              entityType="Profile"
              data-cy="new-profile-form"
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
                    data-cy="edit-profile-form"
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
                  data-cy="profile-card"
                />
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileList;
