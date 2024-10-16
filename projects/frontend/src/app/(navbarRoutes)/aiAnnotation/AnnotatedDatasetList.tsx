import { useEffect, useRef, useState } from "react";
import { LLMAnnotationAnnotatedDatasetListProps } from "../../types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  createAnnotatedDataset,
  createApiKey,
  deleteAnnotatedDataset,
  deleteApiKey,
  readAllAnnotatedDatasets,
  readAllAnnotatedTexts,
  readAllApiKeys,
  readAllDatasets,
  readAllProfilePoints,
  readAllProfiles,
  readAllTexts,
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
import { TiDeleteOutline, TiDownloadOutline } from "react-icons/ti";
import { ProfilePoint, Text } from "@/lib/db/db";
import {
  annotateText,
  downloadAnnotatedDataset,
  handleUploadAnnotatedDataset,
} from "./annotationUtils";

const AnnotatedDatasetList = (
  props: LLMAnnotationAnnotatedDatasetListProps
) => {
  const { activeAnnotatedDataset, setActiveAnnotatedDataset } = props;

  const [addingDataset, setAddingDataset] = useState(false);
  const [addDatasetName, setAddDatasetName] = useState<string>("");
  const [addDatasetDescription, setAddDatasetDescription] =
    useState<string>("");
  const [addDatasetDatasetId, setAddDatasetDatasetId] = useState<
    string | undefined
  >(undefined);
  const [addDatasetProfileId, setAddDatasetProfileId] = useState<
    string | undefined
  >(undefined);
  const [activeProfilePoints, setActiveProfilePoints] = useState<
    ProfilePoint[]
  >([]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [annotationTexts, setAnnotationTexts] = useState<Text[]>([]);
  const [newApiKey, setNewApiKey] = useState<string>("");

  const dbAnnotatedTexts = useLiveQuery(() => readAllAnnotatedTexts());
  const dbTexts = useLiveQuery(() => readAllTexts());
  const dbAnnotatedDatasets = useLiveQuery(() => readAllAnnotatedDatasets());
  const dbProfiles = useLiveQuery(() => readAllProfiles());
  const dbDatasets = useLiveQuery(() => readAllDatasets());
  const dbProfilePoints = useLiveQuery(() => readAllProfilePoints());
  const dbApiKeys = useLiveQuery(() => readAllApiKeys());

  const fileInputRef = useRef<HTMLInputElement>(null);

  // create the array containing the text that should be annotated
  useEffect(() => {
    const annotationTexts: Text[] = [];
    if (dbTexts && dbAnnotatedDatasets) {
      dbTexts.forEach((text) => {
        if (text.datasetId === activeAnnotatedDataset?.datasetId) {
          annotationTexts.push(text);
        }
      });
      if (dbAnnotatedTexts) {
        setAnnotationTexts(
          annotationTexts.filter((text) => {
            return !dbAnnotatedTexts.find((annotatedText) => {
              return (
                annotatedText.textId === text.id &&
                annotatedText.annotatedDatasetId === activeAnnotatedDataset?.id
              );
            });
          })
        );
      }
    }
  }, [isRunning, activeAnnotatedDataset]);

  // annotation control useEffect
  useEffect(() => {
    let isCancelled = false;

    const runAnnotation = async () => {
      if (isRunning && currentIndex < annotationTexts.length) {
        await annotateText(
          annotationTexts[currentIndex],
          activeAnnotatedDataset!,
          activeProfilePoints,
          dbApiKeys
        );
        if (!isCancelled) {
          setCurrentIndex(currentIndex + 1);
        }
      }
    };

    runAnnotation();

    return () => {
      isCancelled = true;
    };
  }, [
    isRunning,
    currentIndex,
    annotationTexts,
    activeAnnotatedDataset,
    activeProfilePoints,
    dbApiKeys,
  ]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const identifyActiveProfilePoints = (profileId: string) => {
    if (dbProfilePoints) {
      const activeProfilePoints: ProfilePoint[] = [];
      dbProfilePoints.forEach((profilePoint) => {
        if (profilePoint.profileId === profileId) {
          activeProfilePoints.push(profilePoint);
        }
      });
      setActiveProfilePoints(activeProfilePoints);
    }
  };

  const getPlaceholder = () => {
    if (dbApiKeys && dbApiKeys.length > 0 && dbApiKeys[0].key) {
      const key = dbApiKeys[0].key;
      return `${key.slice(0, 3)}...${key.slice(-3)}`;
    }
    return "Add Api Key";
  };

  const handleUploadButtonClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await handleUploadAnnotatedDataset(file);
      // You might want to refresh the list of annotated datasets here
    } catch (error) {
      console.error("Error uploading annotated dataset:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Annotated Datasets</CardTitle>
          <div className="flex-grow"></div>
          <div className="flex flex-row gap-2">
            <Input
              placeholder={getPlaceholder()}
              onChange={(e) => {
                setNewApiKey(e.target.value);
              }}
            />
            <Button
              onClick={() => {
                // remove old api key
                if (dbApiKeys && dbApiKeys.length > 0) {
                  dbApiKeys.forEach((key) => {
                    deleteApiKey(key.id);
                  });
                }
                createApiKey(newApiKey);
              }}
            >
              Set
            </Button>
          </div>
          <div className="flex-grow"></div>
          <Button
            onClick={() => {
              setAddingDataset(true);
            }}
          >
            New Dataset
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleFileUpload}
          />
          <Button onClick={handleUploadButtonClick}>Upload Dataset</Button>
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
                    {dbDatasets?.map((dataset) => (
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
                    {dbProfiles?.map((profile) => (
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
                    setAddDatasetName("");
                    setAddDatasetDescription("");
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
                identifyActiveProfilePoints(dataset.profileId);
                setActiveAnnotatedDataset(dataset);
              }}
            >
              <CardHeader className="flex flex-row gap-2">
                <CardTitle>{dataset.name}</CardTitle>
                <div className="flex-grow"></div>
                <TiDownloadOutline
                  className="hover:text-gray-500 cursor-pointer mr-2"
                  size={24}
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadAnnotatedDataset(dataset);
                  }}
                />
                <TiDeleteOutline
                  className="hover:text-red-500 cursor-pointer"
                  size={24}
                  onClick={() => {
                    deleteAnnotatedDataset(dataset.id);
                  }}
                />
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-row gap-2">
                  {dbProfiles && (
                    <CardDescription>
                      Profile:{" "}
                      {
                        dbProfiles.find(
                          (profile) => profile.id === dataset.profileId
                        )?.name
                      }
                    </CardDescription>
                  )}
                  <div className="flex-grow"></div>
                  {dbDatasets && (
                    <CardDescription>
                      Dataset:{" "}
                      {
                        dbDatasets.find(
                          (dbDataset) => dbDataset.id === dataset.datasetId
                        )?.name
                      }
                    </CardDescription>
                  )}
                  <div className="flex-grow"></div>
                </div>
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
                      identifyActiveProfilePoints(dataset.profileId);
                      setActiveAnnotatedDataset(dataset);
                      handleStart();
                    }}
                    disabled={!dbApiKeys || dbApiKeys.length === 0}
                  >
                    Start Annotation
                  </Button>
                )}

                {isRunning && (
                  <Button
                    onClick={() => {
                      identifyActiveProfilePoints(dataset.profileId);
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
