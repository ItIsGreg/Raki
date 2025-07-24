import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { readDatasetsByMode, readProfilesByMode } from "@/lib/db/crud";
import { HybridDataService } from "@/lib/api/hybridDataService";
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
import { TaskMode } from "@/app/constants";
import { AnnotatedDataset } from "@/lib/db/db";

interface AddDatasetFormProps {
  onClose: () => void;
  mode: TaskMode;
  onDatasetCreated?: (dataset: AnnotatedDataset) => void;
}

export const AddDatasetForm = ({
  onClose,
  mode,
  onDatasetCreated,
}: AddDatasetFormProps) => {
  const [addDatasetName, setAddDatasetName] = useState<string>("");
  const [addDatasetDescription, setAddDatasetDescription] =
    useState<string>("");
  const [addDatasetDatasetId, setAddDatasetDatasetId] = useState<
    string | undefined
  >(undefined);
  const [addDatasetProfileId, setAddDatasetProfileId] = useState<
    string | undefined
  >(undefined);

  // Query datasets and profiles based on mode
  const dbDatasets = useLiveQuery(() => readDatasetsByMode(mode));
  const dbProfiles = useLiveQuery(() => readProfilesByMode(mode));

  const handleSave = () => {
    if (
      !addDatasetDatasetId ||
      !addDatasetProfileId ||
      !addDatasetName ||
      !addDatasetDescription
    ) {
      return;
    }
    HybridDataService.createAnnotatedDataset({
      name: addDatasetName,
      description: addDatasetDescription,
      datasetId: addDatasetDatasetId,
      profileId: addDatasetProfileId,
      mode: mode,
      workspaceId: "", // This will be set by HybridDataService
    }).then((newDataset) => {
      onDatasetCreated?.(newDataset);
      onClose();
    });
  };

  const getFormTitle = () => {
    switch (mode) {
      case "datapoint_extraction":
        return "New Annotated Dataset";
      case "text_segmentation":
        return "New Segmentation Dataset";
      default:
        return "New Dataset";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>{getFormTitle()}</CardDescription>
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
          <SelectContent
            data-cy="dataset-select-content"
            position="popper"
            sideOffset={5}
          >
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
            <SelectValue
              placeholder={`Select a ${
                mode === "text_segmentation" ? "segmentation " : ""
              }profile`}
            />
          </SelectTrigger>
          <SelectContent
            data-cy="profile-select-content"
            position="popper"
            sideOffset={5}
          >
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
