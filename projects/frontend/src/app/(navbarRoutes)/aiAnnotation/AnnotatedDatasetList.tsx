import { useCallback, useEffect, useRef, useState } from "react";
import {
  LLMAnnotationAnnotatedDatasetListProps,
  ReqProfilePoint,
  ResDataPoint,
} from "../../types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  createAnnotatedDataset,
  createAnnotatedText,
  createApiKey,
  createDataPoint,
  deleteAnnotatedDataset,
  deleteApiKey,
  readAllAnnotatedDatasets,
  readAllAnnotatedTexts,
  readAllApiKeys,
  readAllDatasets,
  readAllProfilePoints,
  readAllProfiles,
  readAllTexts,
  createText,
  createProfile,
  createProfilePoint,
  createDataset,
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
import { TiDeleteOutline, TiDownloadOutline } from "react-icons/ti";
import {
  AnnotatedDataset,
  DataPoint,
  DataPointCreate,
  db,
  ProfilePoint,
  ProfilePointCreate,
  Text,
} from "@/lib/db/db";
import { backendURL, llmModel, llmProvider } from "../../constants";
import { v4 as uuidv4 } from "uuid";

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
  const profiles = useLiveQuery(() => readAllProfiles());
  const datasets = useLiveQuery(() => readAllDatasets());
  const profilePoints = useLiveQuery(() => readAllProfilePoints());
  const apiKeys = useLiveQuery(() => readAllApiKeys());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getReqProfilePoints = useCallback(
    (activeProfilePoints: ProfilePoint[]) => {
      const reqProfilePoints: ReqProfilePoint[] = [];
      activeProfilePoints.forEach((profilePoint) => {
        reqProfilePoints.push({
          name: profilePoint.name,
          explanation: profilePoint.explanation,
          synonyms: profilePoint.synonyms,
          datatype: profilePoint.datatype,
          valueset: profilePoint.valueset,
          unit: profilePoint.unit,
        });
      });
      return reqProfilePoints;
    },
    [activeProfilePoints]
  );

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

  const complementMissingDatapoints = (
    dataPoints: DataPointCreate[],
    profilePoints: ProfilePoint[],
    annotatedTextId: string
  ): DataPointCreate[] => {
    const missingDataPoints: DataPointCreate[] = [];
    profilePoints.forEach((profilePoint) => {
      if (
        !dataPoints.find((dataPoint) => dataPoint.name === profilePoint.name)
      ) {
        missingDataPoints.push({
          name: profilePoint.name,
          value: "",
          match: undefined,
          annotatedTextId: annotatedTextId,
          profilePointId: profilePoint.id,
          verified: undefined,
        });
      }
    });
    return dataPoints.concat(missingDataPoints);
  };

  // start annotating the text
  const annotateText = useCallback(
    async (text: Text) => {
      if (!apiKeys || apiKeys.length === 0) {
        throw new Error("No API key found");
      }
      try {
        const body = {
          llm_provider: llmProvider,
          model: llmModel,
          api_key: apiKeys && apiKeys.length > 0 ? apiKeys[0].key : "",
          text: text.text,
          datapoints: getReqProfilePoints(activeProfilePoints),
        };
        const response = await fetch(`${backendURL}/pipeline/pipeline/`, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: ResDataPoint[] = await response.json();
        const annotatedText = await createAnnotatedText({
          annotatedDatasetId: activeAnnotatedDataset!.id,
          textId: text.id,
          verified: undefined,
        });
        const annotatedTextID = annotatedText.id;
        let dataPoints: DataPointCreate[] = data.map((dataPoint) => {
          return {
            name: dataPoint.name,
            value: dataPoint.value,
            match: dataPoint.match,
            annotatedTextId: annotatedTextID,
            profilePointId: activeProfilePoints.find(
              (profilePoint) => profilePoint.name === dataPoint.name
            )?.id,
            verified: undefined,
          };
        });
        // add missing empty data points according to profile points
        dataPoints = complementMissingDatapoints(
          dataPoints,
          activeProfilePoints,
          annotatedTextID
        );

        dataPoints.forEach((dataPoint) => {
          const profilePoint = activeProfilePoints.find(
            (profilePoint) => profilePoint.name === dataPoint.name
          );
          createDataPoint({
            name: dataPoint.name,
            value: dataPoint.value,
            match: dataPoint.match,
            annotatedTextId: annotatedTextID,
            profilePointId: profilePoint?.id,
            verified: undefined,
          });
        });
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [getReqProfilePoints, activeProfilePoints]
  );

  // annotation control useEffect
  useEffect(() => {
    let isCancelled = false;

    const runAnnotation = async () => {
      if (isRunning && currentIndex < annotationTexts.length) {
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
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const identifyActiveProfilePoints = (profileId: string) => {
    if (profilePoints) {
      const activeProfilePoints: ProfilePoint[] = [];
      profilePoints.forEach((profilePoint) => {
        if (profilePoint.profileId === profileId) {
          activeProfilePoints.push(profilePoint);
        }
      });
      setActiveProfilePoints(activeProfilePoints);
    }
  };

  const getPlaceholder = () => {
    if (apiKeys && apiKeys.length > 0 && apiKeys[0].key) {
      const key = apiKeys[0].key;
      return `${key.slice(0, 3)}...${key.slice(-3)}`;
    }
    return "Add Api Key";
  };

  const downloadAnnotatedDataset = async (dataset: AnnotatedDataset) => {
    try {
      // Fetch the corresponding profile
      const profile = await db.Profiles.get(dataset.profileId);
      if (!profile) throw new Error("Profile not found");

      // Fetch profile points for the profile
      const profilePoints = await readProfilePointsByProfile(profile.id);

      // Fetch all texts associated with this annotated dataset
      const annotatedTexts = await db.AnnotatedTexts.where({
        annotatedDatasetId: dataset.id,
      }).toArray();
      const textIds = annotatedTexts.map((at) => at.textId);
      const texts = await db.Texts.bulkGet(textIds);

      // Fetch the corresponding dataset
      const originalDataset = await db.Datasets.get(dataset.datasetId);
      if (!originalDataset) throw new Error("Original dataset not found");

      // Fetch all data points for this annotated dataset
      const dataPoints = await db.DataPoints.where("annotatedTextId")
        .anyOf(annotatedTexts.map((at) => at.id))
        .toArray();

      // Get current timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      // Construct the data to be downloaded with modified names
      const downloadData = {
        annotatedDataset: { ...dataset, name: `${dataset.name}_${timestamp}` },
        originalDataset: {
          ...originalDataset,
          name: `${originalDataset.name}_${timestamp}`,
        },
        profile: { ...profile, name: `${profile.name}_${timestamp}` },
        profilePoints: profilePoints,
        texts: texts,
        annotatedTexts: annotatedTexts,
        dataPoints: dataPoints,
      };

      // Convert to JSON and create a Blob
      const jsonData = JSON.stringify(downloadData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });

      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${dataset.name}_${timestamp}_annotated_dataset.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading annotated dataset:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleUploadButtonClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current?.click();
  };

  const handleUploadAnnotatedDataset = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      const uploadedData = JSON.parse(fileContent);

      // Validate the structure of the uploaded data
      if (
        !uploadedData.annotatedDataset ||
        !uploadedData.originalDataset ||
        !uploadedData.profile ||
        !uploadedData.profilePoints ||
        !uploadedData.texts ||
        !uploadedData.annotatedTexts ||
        !uploadedData.dataPoints
      ) {
        throw new Error("Invalid file structure");
      }

      // Create the new dataset
      const newDataset = await createDataset({
        ...uploadedData.originalDataset,
        id: undefined, // Let the create function generate the ID
      });

      // Create the new profile
      const newProfile = await createProfile({
        ...uploadedData.profile,
        id: undefined, // Let the create function generate the ID
      });

      // Create the new annotated dataset
      const newAnnotatedDataset = await createAnnotatedDataset({
        ...uploadedData.annotatedDataset,
        id: undefined, // Let the create function generate the ID
        datasetId: newDataset.id,
        profileId: newProfile.id,
      });

      // Create new profile points
      const newProfilePoints = await Promise.all(
        uploadedData.profilePoints.map((point: ProfilePoint) =>
          createProfilePoint({
            ...point,
            profileId: newProfile.id,
          })
        )
      );

      // Create new texts and annotated texts
      const textIdMap = new Map();
      const annotatedTextIdMap = new Map();
      for (const text of uploadedData.texts) {
        const newText = await createText({
          ...text,
          id: undefined, // Let the create function generate the ID
          datasetId: newDataset.id,
        });
        textIdMap.set(text.id, newText.id);
      }

      for (const annotatedText of uploadedData.annotatedTexts) {
        const newAnnotatedText = await createAnnotatedText({
          ...annotatedText,
          id: undefined, // Let the create function generate the ID
          textId: textIdMap.get(annotatedText.textId),
          annotatedDatasetId: newAnnotatedDataset.id,
        });
        annotatedTextIdMap.set(annotatedText.id, newAnnotatedText.id);
      }

      // Create new data points
      for (const dataPoint of uploadedData.dataPoints) {
        const newAnnotatedTextId = annotatedTextIdMap.get(
          dataPoint.annotatedTextId
        );
        if (newAnnotatedTextId) {
          const profilePointId = newProfilePoints.find(
            (pp) => pp.name === dataPoint.name
          )?.id;

          await createDataPoint({
            ...dataPoint,
            id: undefined, // Let the create function generate the ID
            annotatedTextId: newAnnotatedTextId,
            profilePointId: profilePointId,
          });
        }
      }

      // You might want to refresh the list of annotated datasets here
    } catch (error) {
      console.error("Error uploading annotated dataset:", error);
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
                if (apiKeys && apiKeys.length > 0) {
                  apiKeys.forEach((key) => {
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
            onChange={handleUploadAnnotatedDataset}
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
                  {profiles && (
                    <CardDescription>
                      Profile:{" "}
                      {
                        profiles.find(
                          (profile) => profile.id === dataset.profileId
                        )?.name
                      }
                    </CardDescription>
                  )}
                  <div className="flex-grow"></div>
                  {datasets && (
                    <CardDescription>
                      Dataset:{" "}
                      {
                        datasets.find(
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
                    disabled={!apiKeys || apiKeys.length === 0}
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
