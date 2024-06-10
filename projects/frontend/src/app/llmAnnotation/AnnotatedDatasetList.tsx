import { useCallback, useEffect, useState } from "react";
import { LLMAnnotationAnnotatedDatasetListProps } from "../types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  createAnnotatedDataset,
  deleteAnnotatedDataset,
  readAllAnnotatedDatasets,
  readAllAnnotatedTexts,
  readAllDatasets,
  readAllProfiles,
  readAllTexts,
  readProfile,
  readProfilePointsByProfile,
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
import { Text } from "@/lib/db/db";
import { set } from "react-hook-form";

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

  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [annotationTexts, setAnnotationTexts] = useState<Text[]>([]);

  const dbAnnotatedTexts = useLiveQuery(() => readAllAnnotatedTexts());
  const dbTexts = useLiveQuery(() => readAllTexts());
  const dbAnnotatedDatasets = useLiveQuery(() => readAllAnnotatedDatasets());
  const profiles = useLiveQuery(() => readAllProfiles());
  const datasets = useLiveQuery(() => readAllDatasets());
  const activeProfilePoints = useLiveQuery(() =>
    readProfilePointsByProfile(activeAnnotatedDataset?.profileId)
  );

  const getReqProfilePoints = () => {
    const reqProfilePoints = [];
    activeProfilePoints?.forEach((profilePoint) => {
      reqProfilePoints.push({
        name: profilePoint.name,
        explanation: profilePoint.explanation,
        synonyms: profilePoint.synonyms,
        datatype: profilePoint.datatype,
        valueset: profilePoint.valueset,
        unit: profilePoint.unit,
      });
    });
  };

  // create the array containing the text that should be annotated
  useEffect(() => {
    const annotationTexts: Text[] = [];
    if (dbTexts && dbAnnotatedDatasets) {
      console.log("Creating Annotation Texts");
      dbTexts.forEach((text) => {
        if (
          dbAnnotatedDatasets.find(
            (annotatedDataset) => annotatedDataset.datasetId === text.datasetId
          )
        ) {
          annotationTexts.push(text);
        }
      });
      if (dbAnnotatedTexts) {
        setAnnotationTexts(
          annotationTexts.filter((text) => {
            return !dbAnnotatedTexts.find((annotatedText) => {
              return annotatedText.textId === text.id;
            });
          })
        );
      }
    }
  }, [isRunning, activeAnnotatedDataset]);

  // start annotating the text
  const annotateText = useCallback(async (text: Text) => {
    try {
      console.log("Annotating Text:", text.text);
      const response = await fetch(`http://localhost:8000/pipeline/pipeline/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          llm_provider: "openai",
          model: "gpt-4o",
          api_key: get_api_key(),
          text: text.text,
          datapoints: getReqProfilePoints(),
        }),
      });
      console.log("Success:", response);
    } catch (error) {
      console.error("Error:", error);
    }
  }, []);

  // annotation control useEffect
  useEffect(() => {
    let isCancelled = false;
    console.log("Annotation Control");

    const runAnnotation = async () => {
      if (isRunning && currentIndex < annotationTexts.length) {
        console.log("Annotating Text");
        const annotation = await annotateText(annotationTexts[currentIndex]);
        if (!isCancelled) {
          setCurrentIndex(currentIndex + 1);
        }
      }
    };

    runAnnotation();

    return () => {
      isCancelled = true;
    };
  }, [isRunning, currentIndex, annotationTexts]);

  const handleStart = () => {
    setIsRunning(true);
    console.log("Start");
  };

  const handleStop = () => {
    setIsRunning(false);
    console.log("Stop");
  };

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
          <Button
            onClick={() => {
              console.log("Log");
              // log all the state
              console.log("isRunning:", isRunning);
              console.log("currentIndex:", currentIndex);
              console.log("annotationTexts:", annotationTexts);
              console.log("activeAnnotatedDataset:", activeAnnotatedDataset);
              console.log("activeProfilePoints:", activeProfilePoints);
              console.log("dbAnnotatedTexts:", dbAnnotatedTexts);
              console.log("dbTexts:", dbTexts);
              console.log("dbAnnotatedDatasets:", dbAnnotatedDatasets);
              console.log("profiles:", profiles);
              console.log("datasets:", datasets);
            }}
          >
            Log
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
                <CardDescription className="flex flex-row gap-2">
                  {profiles && (
                    <div>
                      Profile:{" "}
                      {
                        profiles.find(
                          (profile) => profile.id === dataset.profileId
                        )?.name
                      }
                    </div>
                  )}
                  <div className="flex-grow"></div>
                  {datasets && (
                    <div>
                      Dataset:{" "}
                      {
                        datasets.find(
                          (dbDataset) => dbDataset.id === dataset.datasetId
                        )?.name
                      }
                    </div>
                  )}
                  <div className="flex-grow"></div>
                </CardDescription>
                <CardDescription>
                  Description: {dataset.description}
                </CardDescription>
                {dbTexts && dbAnnotatedTexts && (
                  <CardDescription>
                    Annotated Texts:{" "}
                    {
                      dbAnnotatedTexts.filter((text) => {
                        return text.annotatedDatasetId === dataset.id;
                      }).length
                    }{" "}
                    /{" "}
                    {
                      dbTexts.filter((text) => {
                        return text.datasetId === dataset.datasetId;
                      }).length
                    }
                  </CardDescription>
                )}
                {!isRunning && (
                  <Button
                    onClick={() => {
                      setActiveAnnotatedDataset(dataset);
                      handleStart();
                    }}
                  >
                    Start Annotation
                  </Button>
                )}

                {isRunning && (
                  <Button
                    onClick={() => {
                      setActiveAnnotatedDataset(dataset);
                      handleStop();
                    }}
                  >
                    Stop Annotation
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnotatedDatasetList;
