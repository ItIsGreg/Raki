import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextAnnotationProps } from "../../types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  deleteDataPoint,
  readAnnotatedDataset,
  readDataPointsByAnnotatedText,
  readProfile,
  readProfilePoint,
  readProfilePointsByProfile,
  readTextsByDataset,
  updateDataPoint,
} from "@/lib/db/crud";
import { DataPoint } from "@/lib/db/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TextSlice from "./TextSlice";

const TextAnnotation = (props: TextAnnotationProps) => {
  const {
    activeAnnotatedDataset,
    setActiveAnnotatedDataset,
    activeDataPoint,
    setActiveDataPoint,
    activeAnnotatedText,
  } = props;

  const texts = useLiveQuery(
    () => readTextsByDataset(activeAnnotatedDataset?.datasetId),
    [activeAnnotatedDataset]
  );

  const dataPoints = useLiveQuery(
    () => readDataPointsByAnnotatedText(activeAnnotatedText?.id),
    [activeAnnotatedText]
  );

  const activeProfile = useLiveQuery(
    () => readProfile(activeAnnotatedDataset?.profileId),
    [activeAnnotatedDataset]
  );
  const activeProfilePoints = useLiveQuery(
    () => readProfilePointsByProfile(activeProfile?.id),
    [activeProfile]
  );
  const activeProfilePoint = useLiveQuery(
    () => readProfilePoint(activeDataPoint?.profilePointId),
    [activeDataPoint]
  );

  const [activeDataPointValue, setActiveDataPointValue] = useState<string>("");

  // create a representation of the text and the data points
  // where the data points are highlighted
  const generateHighlightedText = (text: string, dataPoints: DataPoint[]) => {
    const matchedDataPoints = dataPoints.filter((dataPoint) => dataPoint.match);
    const sortedDataPoints = matchedDataPoints.sort(
      (a, b) => a.match![0] - b.match![0]
    );
    let highlightedText = [];
    let lastEnd = 0;
    sortedDataPoints.forEach((dataPoint) => {
      highlightedText.push(
        <TextSlice
          startIndex={lastEnd}
          text={text.slice(lastEnd, dataPoint.match![0])}
          annotatedTextId={activeAnnotatedText?.id}
        />
      );
      highlightedText.push(
        <TooltipProvider>
          <Tooltip open={activeDataPoint === dataPoint}>
            <TooltipTrigger>
              <Badge
                onClick={() =>
                  setActiveDataPoint(
                    activeDataPoint === dataPoint ? undefined : dataPoint
                  )
                }
                className="mr-1"
              >
                {text.slice(dataPoint.match![0], dataPoint.match![1])}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <Card>
                <CardHeader>
                  <CardTitle>{dataPoint.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!dataPoint.profilePointId ? (
                    <Select
                      onValueChange={(value: string) => {
                        // update the placeholder data point
                        const placeholderDataPoint = dataPoints.find(
                          (dp) => dp.profilePointId === value
                        );
                        if (placeholderDataPoint) {
                          deleteDataPoint(placeholderDataPoint.id);
                        }
                        updateDataPoint({
                          ...dataPoint,
                          name:
                            activeProfilePoints?.find(
                              (profilePoint) => profilePoint.id === value
                            )?.name ?? "Unknown",
                          profilePointId: value,
                        });
                        // delete the old placeholder point
                      }}
                    >
                      <SelectTrigger>Select a profile Point</SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {activeProfilePoints
                            ?.filter((profilePoint) => {
                              return (
                                dataPoints.find((dp) => {
                                  return (
                                    dp.profilePointId === profilePoint.id &&
                                    dp.match
                                  );
                                }) === undefined
                              );
                            })
                            .map((profilePoint) => (
                              <SelectItem
                                key={profilePoint.id}
                                value={profilePoint.id}
                              >
                                {profilePoint.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : null}

                  {dataPoint.profilePointId &&
                  activeProfilePoint?.datatype === "valueset" ? (
                    <Select
                      onValueChange={(value: string) => {
                        // update the data point value
                        updateDataPoint({
                          ...dataPoint,
                          value: value as string,
                        });
                      }}
                    >
                      <SelectTrigger>
                        {dataPoint.value?.toString() ?? "Value"}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {activeProfilePoint?.valueset?.map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Input
                        value={activeDataPointValue}
                        onChange={(e) =>
                          setActiveDataPointValue(e.target.value)
                        }
                        placeholder={dataPoint.value?.toString() ?? "Value"}
                      />
                      <Button
                        onClick={() => {
                          // update the data point value
                          updateDataPoint({
                            ...dataPoint,
                            value: activeDataPointValue,
                          });
                        }}
                      >
                        Update
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      lastEnd = dataPoint.match![1];
    });
    highlightedText.push(
      <TextSlice
        startIndex={lastEnd}
        text={text.slice(lastEnd)}
        annotatedTextId={activeAnnotatedText?.id}
      />
    );
    return highlightedText;
  };

  return (
    <div className="col-span-4">
      <Card>
        <CardHeader>
          <CardTitle>Annotation</CardTitle>
        </CardHeader>
        <CardContent>
          {generateHighlightedText(
            texts?.find((text) => text.id === activeAnnotatedText?.textId)
              ?.text ?? "",
            dataPoints ?? []
          ).map((element, index) => (
            <span key={index}>{element}</span>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TextAnnotation;
