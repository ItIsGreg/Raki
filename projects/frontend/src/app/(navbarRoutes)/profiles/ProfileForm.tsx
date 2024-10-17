import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createProfile, updateProfile } from "@/lib/db/crud";
import { Profile } from "@/lib/db/db";

interface ProfileFormProps {
  onCancel: () => void;
  existingProfile?: Profile | undefined;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  onCancel,
  existingProfile,
}) => {
  const [profileName, setProfileName] = React.useState(
    existingProfile?.name || ""
  );
  const [profileDescription, setProfileDescription] = React.useState(
    existingProfile?.description || ""
  );

  const profileNameInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (
    event: React.KeyboardEvent,
    type: "name" | "explanation"
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (type === "name" && profileName.trim() !== "") {
        descriptionInputRef.current?.focus();
      } else if (type === "explanation") {
        handleSave();
      }
    }
  };

  const handleSave = () => {
    if (existingProfile) {
      updateProfile({
        id: existingProfile.id,
        name: profileName,
        description: profileDescription,
      });
    } else {
      createProfile({
        name: profileName,
        description: profileDescription,
      });
    }
    onCancel();
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          {existingProfile ? "Edit Profile" : "New Profile"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Input
          ref={profileNameInputRef}
          placeholder="Name"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "name")}
        />
        <Input
          ref={descriptionInputRef}
          placeholder="Description"
          value={profileDescription}
          onChange={(e) => setProfileDescription(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "explanation")}
        />
      </CardContent>
      <CardFooter className="flex flex-row gap-2">
        <Button onClick={handleSave}>
          {existingProfile ? "Update" : "Save"}
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileForm;
