import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createDataset, deleteDataset, readAllDatasets } from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { TiDeleteOutline } from "react-icons/ti";
import { DatasetListProps } from "../types";

const DatasetList = (props: DatasetListProps) => {
  const { activeDataset, setActiveDataset } = props;

  const [addingDataset, setAddingDataset] = useState(false);
  const [addDatasetName, setAddDatasetName] = useState("");
  const [addDatasetDescription, setAddDatasetDescription] = useState("");

  const dbDatasets = useLiveQuery(() => readAllDatasets());
  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Datasets</CardTitle>
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
              </CardContent>
              <CardFooter className="flex flex-row gap-2">
                <Button
                  onClick={() => {
                    createDataset({
                      name: addDatasetName,
                      description: addDatasetDescription,
                    });
                    setAddingDataset(false);
                    setAddDatasetName("");
                    setAddDatasetDescription("");
                  }}
                >
                  Save
                </Button>
                <Button onClick={() => setAddingDataset(false)}>Cancel</Button>
              </CardFooter>
            </Card>
          )}

          {dbDatasets?.map((dataset) => (
            <Card
              key={dataset.id}
              className={`${
                activeDataset == dataset &&
                "bg-gray-100 shadow-lg border-black border-2"
              } transition-transform hover:bg-gray-100 hover:shadow-lg transform`}
              onClick={() => {
                setActiveDataset(dataset);
              }}
            >
              <CardHeader className="flex flex-row">
                <CardTitle>{dataset.name}</CardTitle>
                <div className="flex-grow"></div>
                <TiDeleteOutline
                  className="hover:text-red-500 cursor-pointer"
                  size={24}
                  onClick={() => {
                    deleteDataset(dataset.id);
                  }}
                />
              </CardHeader>
              <CardContent>
                <CardDescription>{dataset.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetList;
