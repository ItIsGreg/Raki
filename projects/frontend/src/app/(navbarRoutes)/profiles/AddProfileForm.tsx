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
import { createProfile } from "@/lib/db/crud";

interface AddProfileFormProps {
  onCancel: () => void;
}

const AddProfileForm: React.FC<AddProfileFormProps> = ({ onCancel }) => {
  const [addProfileName, setAddProfileName] = React.useState("");
  const [addProfileDescription, setAddProfileDescription] = React.useState("");

  const profileNameInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    profileNameInputRef.current?.focus();
  }, []);

  const handleKeyDown = (
    event: React.KeyboardEvent,
    type: "name" | "explanation"
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (type === "name" && addProfileName.trim() !== "") {
        descriptionInputRef.current?.focus();
      } else if (type === "explanation") {
        handleSave();
      }
    }
  };

  const handleSave = () => {
    createProfile({
      name: addProfileName,
      description: addProfileDescription,
    });
    onCancel();
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>New Profile</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Input
          ref={profileNameInputRef}
          placeholder="Name"
          value={addProfileName}
          onChange={(e) => setAddProfileName(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "name")}
        />
        <Input
          ref={descriptionInputRef}
          placeholder="Description"
          value={addProfileDescription}
          onChange={(e) => setAddProfileDescription(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "explanation")}
        />
      </CardContent>
      <CardFooter className="flex flex-row gap-2">
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </CardFooter>
    </Card>
  );
};

export default AddProfileForm;
