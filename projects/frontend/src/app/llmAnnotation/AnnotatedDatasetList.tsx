import { useState } from "react";
import { LLMAnnotationAnnotatedDatasetListProps } from "../types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  createAnnotatedDataset,
  deleteAnnotatedDataset,
  readAllAnnotatedDatasets,
  readAllDatasets,
  readAllProfiles,
} from "@/lib/db/crud";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { TiDeleteOutline } from "react-icons/ti";

const AnnotatedDatasetList = (
  props: LLMAnnotationAnnotatedDatasetListProps
) => {
  const { activeAnnotatedDataset, setActiveAnnotatedDataset } = props;

  const [addingDataset, setAddingDataset] = useState(false);
  const [addDatasetName, setAddDatasetName] = useState<string | undefined>(
    undefined
  );
  const [addDatasetDescription, setAddDatasetDescription] = useState<
    string | undefined
  >(undefined);
  const [addDatasetDatasetId, setAddDatasetDatasetId] = useState<
    string | undefined
  >(undefined);
  const [addDatasetProfileId, setAddDatasetProfileId] = useState<
    string | undefined
  >(undefined);

  const dbAnnotatedDatasets = useLiveQuery(() => readAllAnnotatedDatasets());
  const profiles = useLiveQuery(() => readAllProfiles());
  const datasets = useLiveQuery(() => readAllDatasets());

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Annotated Datasets</CardTitle>
          <div className="flex-grow"></div>
          <Button
            onClick={() => {
              setAddingDataset(true);
            }}
          >
            New Dataset
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {addingDataset && (
            <Card>
              <CardHeader>
                <CardDescription>New Dataset</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Input
                  placeholder="Name"
                  value={addDatasetName}
                  onChange={(e) => setAddDatasetName(e.target.value)}
                />
                <Input
                  placeholder="Description"
                  value={addDatasetDescription}
                  onChange={(e) => setAddDatasetDescription(e.target.value)}
                />
                <Select
                  onValueChange={setAddDatasetDatasetId}
                  value={addDatasetDatasetId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets?.map((dataset) => (
                      <SelectItem key={dataset.id} value={dataset.id}>
                        {dataset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={setAddDatasetProfileId}
                  value={addDatasetProfileId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles?.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
              <CardFooter className="flex flex-row gap-2">
                <Button
                  onClick={() => {
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
                    setAddingDataset(false);
                    setAddDatasetName(undefined);
                    setAddDatasetDescription(undefined);
                    setAddDatasetDatasetId(undefined);
                    setAddDatasetProfileId(undefined);
                  }}
                  disabled={
                    !addDatasetDatasetId ||
                    !addDatasetProfileId ||
                    !addDatasetName ||
                    !addDatasetDescription
                  }
                >
                  Save
                </Button>
                <Button onClick={() => setAddingDataset(false)}>Cancel</Button>
              </CardFooter>
            </Card>
          )}

          {dbAnnotatedDatasets?.map((dataset) => (
            <Card
              key={dataset.id}
              className={`${
                activeAnnotatedDataset == dataset &&
                "bg-gray-100 shadow-lg border-black border-2"
              } transition-transform hover:bg-gray-100 hover:shadow-lg transform`}
              onClick={() => {
                setActiveAnnotatedDataset(dataset);
              }}
            >
              <CardHeader className="flex flex-row">
                <CardTitle>{dataset.name}</CardTitle>
                <div className="flex-grow"></div>
                <TiDeleteOutline
                  className="hover:text-red-500 cursor-pointer"
                  size={24}
                  onClick={() => {
                    deleteAnnotatedDataset(dataset.id);
                  }}
                />
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <CardDescription>{dataset.description}</CardDescription>
                <CardDescription>Annotated datasets: 44 / 105</CardDescription>
                <Button>Start Annotation</Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnotatedDatasetList;
