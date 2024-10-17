import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dataset, Profile } from "@/lib/db/db";

interface EntityFormProps<T> {
  onCancel: () => void;
  onSave: (entity: T) => void;
  existingEntity?: T;
  entityType: string;
}

const EntityForm = <T extends Profile | Dataset>({
  onCancel,
  onSave,
  existingEntity,
  entityType,
}: EntityFormProps<T>) => {
  const [name, setName] = React.useState(existingEntity?.name || "");
  const [description, setDescription] = React.useState(
    existingEntity?.description || ""
  );

  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (
    event: React.KeyboardEvent,
    type: "name" | "description"
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (type === "name" && name.trim() !== "") {
        descriptionInputRef.current?.focus();
      } else if (type === "description") {
        handleSave();
      }
    }
  };

  const handleSave = () => {
    onSave({
      ...(existingEntity || {}),
      name: name,
      description: description,
    } as T);
    onCancel();
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          {existingEntity ? `Edit ${entityType}` : `New ${entityType}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Input
          ref={nameInputRef}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "name")}
        />
        <Input
          ref={descriptionInputRef}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "description")}
        />
      </CardContent>
      <CardFooter className="flex flex-row gap-2">
        <Button onClick={handleSave}>
          {existingEntity ? "Update" : "Save"}
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </CardFooter>
    </Card>
  );
};

export default EntityForm;
