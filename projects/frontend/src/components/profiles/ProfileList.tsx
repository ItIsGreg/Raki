import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createProfile,
  readProfilesByMode,
  updateProfile,
  createProfilePoint,
  createSegmentationProfilePoint,
} from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";
import { useState, useRef } from "react";
import ProfileCard from "./ProfileCard";
import EntityForm from "@/components/EntityForm";
import { Profile } from "@/lib/db/db";
import { AddButton } from "@/components/AddButton";
import { ProfileListProps } from "@/app/types";
import { Button } from "@/components/ui/button";
import { TiUpload } from "react-icons/ti";
import { TASK_MODE } from "@/app/constants";

const ProfileList = (props: ProfileListProps) => {
  const { activeProfile, setActiveProfile, mode } = props;

  const [addingProfile, setAddingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | undefined>(
    undefined
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleUploadButtonClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current?.click();
  };

  const handleUploadProfile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      const uploadedData = JSON.parse(fileContent);

      // Validate the structure of the uploaded data
      if (!uploadedData.profile || !uploadedData.profilePoints) {
        throw new Error("Invalid file structure");
      }

      // Create the new profile
      const newProfile = await createProfile({
        ...uploadedData.profile,
        mode: uploadedData.profile.mode || mode, // Use uploaded mode or current mode
      });

      // Create new profile points
      for (const profilePoint of uploadedData.profilePoints) {
        if (newProfile.mode === TASK_MODE.TEXT_SEGMENTATION) {
          await createSegmentationProfilePoint({
            ...profilePoint,
            profileId: newProfile.id,
          });
        } else {
          await createProfilePoint({
            ...profilePoint,
            profileId: newProfile.id,
          });
        }
      }

      // Set the new profile as active
      setActiveProfile(newProfile);

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading profile:", error);
      alert("Error uploading profile. Please check the file format.");
    }
  };

  return (
    <div className="overflow-y-scroll" data-cy="profile-list-container">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Profiles</CardTitle>
          <div className="flex-grow"></div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUploadButtonClick}
            data-cy="upload-profile-button"
            title="Upload Profile"
          >
            <TiUpload className="h-4 w-4" />
          </Button>
          <AddButton
            onClick={() => setAddingProfile(true)}
            label="Profile"
            data-cy="add-profile-button"
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleUploadProfile}
            data-cy="upload-profile-input"
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
