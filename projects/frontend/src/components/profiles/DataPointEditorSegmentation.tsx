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
import { Textarea } from "@/components/ui/textarea";
import { TiDeleteOutline } from "react-icons/ti";
import {
  createSegmentationProfilePoint,
  updateSegmentationProfilePoint,
} from "@/lib/db/crud";
import debounce from "lodash/debounce";
import { Profile, SegmentationProfilePoint } from "@/lib/db/db";

export interface DataPointEditorSegmentationProps {
  activeDataPoint: SegmentationProfilePoint | undefined;
  setActiveDataPoint: (dataPoint: SegmentationProfilePoint | undefined) => void;
  creatingNewDataPoint: boolean;
  setCreatingNewDataPoint: (creating: boolean) => void;
  activeProfile: Profile | undefined;
}

export function DataPointEditorSegmentation(
  props: DataPointEditorSegmentationProps
) {
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
  const [currentSynonym, setCurrentSynonym] = useState<string>("");

  const updateDataPoint = (updates: Partial<typeof activeDataPoint>) => {
    if (!creatingNewDataPoint && activeDataPoint) {
      updateSegmentationProfilePoint({
        id: activeDataPoint.id,
        name,
        explanation,
        synonyms,
        profileId: activeProfile!.id,
        ...updates,
      });
    }
  };

  const handleArrayUpdate = (action: "add" | "delete", value?: string) => {
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
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (currentSynonym.trim() !== "") {
        handleArrayUpdate("add", currentSynonym);
        setCurrentSynonym("");
      }
    }
  };

  const handleDeleteClick = (element: string) => {
    handleArrayUpdate("delete", element);
  };

  const resetEditor = () => {
    setName("");
    setExplanation("");
    setSynonyms([]);
    setCurrentSynonym("");
  };

  const SaveButton = () => {
    return (
      <Button
        onClick={() => {
          if (creatingNewDataPoint && activeProfile) {
            createSegmentationProfilePoint({
              name: name,
              explanation: explanation,
              synonyms: synonyms,
              profileId: activeProfile.id,
            });
            setCreatingNewDataPoint(false);
            resetEditor();
          }
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
          if (activeDataPoint && activeProfile) {
            updateSegmentationProfilePoint({
              id: activeDataPoint.id,
              name: name,
              explanation: explanation,
              synonyms: synonyms,
              profileId: activeProfile.id,
            });
            setActiveDataPoint(undefined);
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
    const populateDataPoint = () => {
      if (activeDataPoint) {
        setName(activeDataPoint.name);
        setExplanation(activeDataPoint.explanation);
        setSynonyms(activeDataPoint.synonyms);
      } else {
        resetEditor();
      }
    };
    populateDataPoint();
  }, [activeDataPoint]);

  const debouncedSave = useCallback(
    debounce((data: any) => {
      if (!creatingNewDataPoint && activeDataPoint && activeProfile) {
        updateSegmentationProfilePoint({
          id: activeDataPoint.id,
          name: data.name,
          explanation: data.explanation,
          synonyms: data.synonyms,
          profileId: activeProfile.id,
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
    }

    if (!creatingNewDataPoint && activeDataPoint) {
      debouncedSave({
        name,
        explanation,
        synonyms,
        [field]: value,
      });
    }
  };

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row gap-2">
          <CardTitle>Segmentation Point Editor</CardTitle>
          <div className="flex-grow"></div>
          {creatingNewDataPoint && <SaveButton />}
          {activeDataPoint && <UpdateButton />}
        </CardHeader>
        {(activeDataPoint || creatingNewDataPoint) && (
          <CardContent className="overflow-y-scroll flex flex-col gap-2">
            <Card>
              <CardHeader>
                <CardTitle>Name</CardTitle>
                <CardDescription>
                  The name of the Segmentation Point
                </CardDescription>
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
                  Some explanation to help understand the Segmentation Point
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
                  Other names that can be used to refer to this Segmentation
                  Point, e.g. abbreviations or full names
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
                        onClick={() => handleDeleteClick(synonym)}
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
                    onKeyDown={handleKeyPress}
                    data-cy="synonym-input"
                  />
                  <Button
                    onClick={() => {
                      if (currentSynonym.trim() !== "") {
                        handleArrayUpdate("add", currentSynonym);
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
            {creatingNewDataPoint && <SaveButton />}
            {activeDataPoint && <UpdateButton />}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default DataPointEditorSegmentation;
