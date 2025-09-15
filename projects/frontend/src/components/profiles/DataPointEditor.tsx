"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SelectGroup } from "@radix-ui/react-select";
import { TiDeleteOutline } from "react-icons/ti";
import { createProfilePoint, updateProfilePoint } from "@/lib/db/crud";
import { useMemo } from "react";
import { useStorage } from "@/contexts/StorageContext";
import { useCreateProfilePoint } from "@/lib/queries/profilePoints";
import { getNextOrderNumber } from "@/lib/db/ordering";
import debounce from "lodash/debounce";
import { DataPointEditorProps } from "@/app/types";

export function DataPointEditor(props: DataPointEditorProps) {
  const {
    activeDataPoint,
    setActiveDataPoint,
    creatingNewDataPoint,
    setCreatingNewDataPoint,
    activeProfile,
  } = props;

  const [name, setName] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [valueset, setValueset] = useState<string[]>([]);
  const [datatype, setDatatype] = useState<string>("");
  const [unit, setUnit] = useState<string>("");
  const [currentSynonym, setCurrentSynonym] = useState<string>("");
  const [currentValuesetItem, setCurrentValuesetItem] = useState<string>("");

  // Cloud storage integration via React Query
  const { currentStorage } = useStorage();
  const storageId = useMemo(
    () =>
      currentStorage?.type === "cloud" ? currentStorage.storageId : undefined,
    [currentStorage]
  );
  const createCloudPoint = useCreateProfilePoint(storageId);

  const updateDataPoint = (updates: Partial<typeof activeDataPoint>) => {
    if (!creatingNewDataPoint && activeDataPoint) {
      updateProfilePoint({
        id: activeDataPoint.id,
        name,
        explanation,
        synonyms,
        datatype,
        valueset,
        unit,
        profileId: activeProfile!.id,
        order: activeDataPoint.order,
        previousPointId: activeDataPoint.previousPointId,
        nextPointId: activeDataPoint.nextPointId,
        ...updates,
      });
    }
  };

  const handleArrayUpdate = (
    type: "synonym" | "valueset",
    action: "add" | "delete",
    value?: string
  ) => {
    if (type === "synonym") {
      let newSynonyms: string[];
      if (action === "add" && value) {
        newSynonyms = [...synonyms, value.trim()];
      } else if (action === "delete" && value) {
        newSynonyms = synonyms.filter((item) => item !== value);
      } else {
        return;
      }
      setSynonyms(newSynonyms);
      updateDataPoint({ synonyms: newSynonyms });
    } else {
      let newValueset: string[];
      if (action === "add" && value) {
        newValueset = [...valueset, value.trim()];
      } else if (action === "delete" && value) {
        newValueset = valueset.filter((item) => item !== value);
      } else {
        return;
      }
      setValueset(newValueset);
      updateDataPoint({ valueset: newValueset });
    }
  };

  const handleKeyPress = (
    event: React.KeyboardEvent,
    type: "synonym" | "valueset"
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const value = type === "synonym" ? currentSynonym : currentValuesetItem;
      if (value.trim() !== "") {
        handleArrayUpdate(type, "add", value);
        type === "synonym" ? setCurrentSynonym("") : setCurrentValuesetItem("");
      }
    }
  };

  const handleDeleteClick = (
    type: "synonyms" | "valueset",
    element: string
  ) => {
    handleArrayUpdate(
      type === "synonyms" ? "synonym" : "valueset",
      "delete",
      element
    );
  };

  const resetEditor = () => {
    setName("");
    setExplanation("");
    setSynonyms([]);
    setValueset([]);
    setDatatype("");
    setUnit("");
    setCurrentSynonym("");
    setCurrentValuesetItem("");
  };

  const SaveButton = () => {
    return (
      <Button
        onClick={() => {
          (async () => {
            if (!creatingNewDataPoint) return;
            if (storageId) {
              // Cloud path: compute order, then use React Query mutation
              const order = await getNextOrderNumber(activeProfile!.id, false);
              await createCloudPoint.mutateAsync({
                name,
                explanation,
                synonyms,
                datatype,
                valueset,
                unit,
                profileId: activeProfile!.id,
                order,
                previousPointId: null,
                nextPointId: null,
              });
              setCreatingNewDataPoint(false);
            } else {
              // Local path via Dexie CRUD
              await createProfilePoint({
                name,
                explanation,
                synonyms,
                datatype,
                valueset,
                unit,
                profileId: activeProfile!.id,
              });
            }
            resetEditor();
          })();
        }}
        data-cy="save-datapoint-button"
      >
        Save
      </Button>
    );
  };

  const UpdateButton = () => {
    return (
      <Button
        onClick={() => {
          if (activeDataPoint) {
            updateProfilePoint({
              id: activeDataPoint.id,
              name: name,
              explanation: explanation,
              synonyms: synonyms,
              datatype: datatype,
              valueset: valueset,
              unit: unit,
              profileId: activeProfile!.id,
              order: activeDataPoint.order,
              previousPointId: activeDataPoint.previousPointId,
              nextPointId: activeDataPoint.nextPointId,
            });
            resetEditor();
          }
        }}
        data-cy="update-datapoint-button"
      >
        Update
      </Button>
    );
  };

  useEffect(() => {
    const popuplateDataPoint = () => {
      if (activeDataPoint) {
        setName(activeDataPoint.name);
        setExplanation(activeDataPoint.explanation);
        setSynonyms(activeDataPoint.synonyms);
        setDatatype(activeDataPoint.datatype);
        setValueset(activeDataPoint.valueset || []);
        setUnit(activeDataPoint.unit || "");
      } else {
        resetEditor();
      }
    };
    popuplateDataPoint();
  }, [activeDataPoint]);

  const debouncedSave = useCallback(
    debounce((data: any) => {
      if (!creatingNewDataPoint && activeDataPoint) {
        updateProfilePoint({
          id: activeDataPoint.id,
          name: data.name,
          explanation: data.explanation,
          synonyms: data.synonyms,
          datatype: data.datatype,
          valueset: data.valueset,
          unit: data.unit,
          profileId: activeProfile!.id,
          order: activeDataPoint.order,
          previousPointId: activeDataPoint.previousPointId,
          nextPointId: activeDataPoint.nextPointId,
        });
      }
    }, 1000),
    [creatingNewDataPoint, activeDataPoint, activeProfile]
  );

  const handleChange = (field: string, value: any) => {
    switch (field) {
      case "name":
        setName(value);
        break;
      case "explanation":
        setExplanation(value);
        break;
      case "datatype":
        setDatatype(value);
        break;
      case "unit":
        setUnit(value);
        break;
    }

    if (!creatingNewDataPoint && activeDataPoint) {
      debouncedSave({
        name,
        explanation,
        synonyms,
        datatype,
        valueset,
        unit,
        [field]: value,
      });
    }
  };

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row gap-2">
          <CardTitle>Data Point Editor</CardTitle>
          <div className="flex-grow"></div>
          {creatingNewDataPoint && <SaveButton />}
          {activeDataPoint && <UpdateButton />}
        </CardHeader>
        {(activeDataPoint || creatingNewDataPoint) && (
          <CardContent className="overflow-y-scroll flex flex-col gap-2">
            <Card>
              <CardHeader>
                <CardTitle>Name</CardTitle>
                <CardDescription>The name of the Data Point</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  data-cy="datapoint-name-input"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Explanation</CardTitle>
                <CardDescription>
                  Some explanation to help understand the Data Point
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Explanation"
                  value={explanation}
                  onChange={(e) => handleChange("explanation", e.target.value)}
                  data-cy="datapoint-explanation-input"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Synonyms</CardTitle>
                <CardDescription>
                  Other names that can be used to refer to this Data Point, e.g.
                  abbreviations or full names
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 flex-wrap">
                <div
                  className="flex flex-row gap-1 flex-wrap"
                  data-cy="synonyms-list"
                >
                  {synonyms.map((synonym, index) => (
                    <Badge key={index} data-cy={`synonym-badge-${index}`}>
                      {synonym}
                      <TiDeleteOutline
                        size={20}
                        onClick={() => handleDeleteClick("synonyms", synonym)}
                        data-cy={`delete-synonym-${index}`}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-row gap-1">
                  <Input
                    placeholder="Synonym"
                    value={currentSynonym}
                    onChange={(e) => setCurrentSynonym(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, "synonym")}
                    data-cy="synonym-input"
                  />
                  <Button
                    onClick={() => {
                      if (currentSynonym.trim() !== "") {
                        handleArrayUpdate("synonym", "add", currentSynonym);
                        setCurrentSynonym("");
                      }
                    }}
                    data-cy="add-synonym-button"
                  >
                    Add Synonym
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Datatype</CardTitle>
                <CardDescription>
                  The type of data that this Data Point represents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  onValueChange={(value) => handleChange("datatype", value)}
                  value={datatype}
                  data-cy="datatype-select"
                >
                  <SelectTrigger data-cy="datatype-trigger">
                    <SelectValue placeholder="Select a Datatype" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="valueset" data-cy="datatype-valueset">
                        Valueset
                      </SelectItem>
                      <SelectItem value="number" data-cy="datatype-number">
                        Number
                      </SelectItem>
                      <SelectItem value="text" data-cy="datatype-text">
                        Text
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            {datatype == "valueset" && (
              <Card>
                <CardHeader>
                  <CardTitle>Valueset</CardTitle>
                  <CardDescription>
                    In case the datatype is a valueset, you can define the
                    possible values here
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 flex-wrap">
                  <div className="flex flex-row gap-1">
                    {valueset.map((valueset, index) => (
                      <Badge key={index}>
                        {valueset}
                        <TiDeleteOutline
                          size={20}
                          onClick={() =>
                            handleDeleteClick("valueset", valueset)
                          }
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-row gap-1">
                    <Input
                      placeholder="Valueset Item"
                      value={currentValuesetItem}
                      onChange={(e) => setCurrentValuesetItem(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, "valueset")}
                      data-cy="valueset-item-input"
                    />
                    <Button
                      onClick={() => {
                        if (currentValuesetItem.trim() !== "") {
                          handleArrayUpdate(
                            "valueset",
                            "add",
                            currentValuesetItem
                          );
                          setCurrentValuesetItem("");
                        }
                      }}
                      data-cy="add-valueset-item-button"
                    >
                      Add Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {datatype == "number" && (
              <Card>
                <CardHeader>
                  <CardTitle>Unit</CardTitle>
                  <CardDescription>
                    The unit in which the number is expressed. Leave empty if no
                    unit is applicable.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Unit"
                    value={unit}
                    onChange={(e) => handleChange("unit", e.target.value)}
                  />
                </CardContent>
              </Card>
            )}
            {creatingNewDataPoint && <SaveButton />}
            {activeDataPoint && <UpdateButton />}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default DataPointEditor;
