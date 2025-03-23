import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  createAnnotatedDataset,
  readAllDatasets,
  readAllProfiles,
} from "@/lib/db/crud";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddDatasetFormProps {
  onClose: () => void;
}

export const AddDatasetForm = ({ onClose }: AddDatasetFormProps) => {
  const [addDatasetName, setAddDatasetName] = useState<string>("");
  const [addDatasetDescription, setAddDatasetDescription] =
    useState<string>("");
  const [addDatasetDatasetId, setAddDatasetDatasetId] = useState<
    string | undefined
  >(undefined);
  const [addDatasetProfileId, setAddDatasetProfileId] = useState<
    string | undefined
  >(undefined);

  const dbProfiles = useLiveQuery(() => readAllProfiles());
  const dbDatasets = useLiveQuery(() => readAllDatasets());

  const handleSave = () => {
    if (
      !addDatasetDatasetId ||
      !addDatasetProfileId ||
      !addDatasetName ||
      !addDatasetDescription
    ) {
      return;
    }
    createAnnotatedDataset({
      name: addDatasetName,
      description: addDatasetDescription,
      datasetId: addDatasetDatasetId,
      profileId: addDatasetProfileId,
    });
    onClose();
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>New Dataset</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Input
          data-cy="dataset-name-input"
          placeholder="Name"
          value={addDatasetName}
          onChange={(e) => setAddDatasetName(e.target.value)}
        />
        <Input
          data-cy="dataset-description-input"
          placeholder="Description"
          value={addDatasetDescription}
          onChange={(e) => setAddDatasetDescription(e.target.value)}
        />
        <Select
          data-cy="dataset-select"
          onValueChange={setAddDatasetDatasetId}
          value={addDatasetDatasetId}
        >
          <SelectTrigger data-cy="dataset-select-trigger">
            <SelectValue placeholder="Select a dataset" />
          </SelectTrigger>
          <SelectContent>
            {dbDatasets?.map((dataset) => (
              <SelectItem
                key={dataset.id}
                value={dataset.id}
                data-cy="dataset-option"
              >
                {dataset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          data-cy="profile-select"
          onValueChange={setAddDatasetProfileId}
          value={addDatasetProfileId}
        >
          <SelectTrigger data-cy="profile-select-trigger">
            <SelectValue placeholder="Select a profile" />
          </SelectTrigger>
          <SelectContent>
            {dbProfiles?.map((profile) => (
              <SelectItem
                key={profile.id}
                value={profile.id}
                data-cy="profile-option"
              >
                {profile.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
      <CardFooter className="flex flex-row gap-2">
        <Button
          data-cy="save-dataset-button"
          onClick={handleSave}
          disabled={
            !addDatasetDatasetId ||
            !addDatasetProfileId ||
            !addDatasetName ||
            !addDatasetDescription
          }
        >
          Save
        </Button>
        <Button data-cy="cancel-dataset-button" onClick={onClose}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};
