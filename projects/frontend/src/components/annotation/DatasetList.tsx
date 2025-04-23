import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnotationDatasetListProps } from "@/app/types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  readAllAnnotatedDatasets,
  readAnnotatedTextsByAnnotatedDataset,
  readDataPointsByAnnotatedText,
  readSegmentDataPointsByAnnotatedText,
  readProfile,
  readProfilePointsByProfile,
  readSegmentationProfilePointsByProfile,
  readText,
} from "@/lib/db/crud";
import { TiDownloadOutline } from "react-icons/ti";
import {
  AnnotatedDataset,
  DataPoint,
  ProfilePoint,
  SegmentDataPoint,
  SegmentationProfilePoint,
} from "@/lib/db/db";
import CompactCard from "@/components/CompactCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";
import { TASK_MODE, TaskMode } from "@/app/constants";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

interface DatasetListProps extends AnnotationDatasetListProps {
  mode: TaskMode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const DatasetList = (props: DatasetListProps) => {
  const {
    activeAnnotatedDataset,
    setActiveAnnotatedDataset,
    mode,
    isOpen,
    setIsOpen,
  } = props;

  const annotatedDatasets = useLiveQuery(
    () => readAllAnnotatedDatasets(),
    []
  )?.filter((dataset) => dataset.mode === mode);

  interface AnnotatedTextDatapointsHolder {
    annotatedTextId: string;
    filename: string;
    datapoints: DataPoint[] | SegmentDataPoint[];
    text: string;
  }

  const downLoadAnnotatedDataset = async (
    annotatedDataset: AnnotatedDataset,
    format: "csv" | "xlsx"
  ) => {
    // collect data for csv export
    const activeProfile = await readProfile(annotatedDataset.profileId);

    const profilePoints =
      mode === TASK_MODE.DATAPOINT_EXTRACTION
        ? await readProfilePointsByProfile(activeProfile?.id)
        : await readSegmentationProfilePointsByProfile(activeProfile?.id);

    const annotatedTexts = await readAnnotatedTextsByAnnotatedDataset(
      annotatedDataset.id
    );

    // bring data into shape that is easy to work with
    const annotatedTextDatapoints: AnnotatedTextDatapointsHolder[] = [];
    for (const annotatedText of annotatedTexts) {
      const datapoints =
        mode === TASK_MODE.DATAPOINT_EXTRACTION
          ? await readDataPointsByAnnotatedText(annotatedText.id)
          : await readSegmentDataPointsByAnnotatedText(annotatedText.id);

      const text = await readText(annotatedText.textId);
      if (text) {
        annotatedTextDatapoints.push({
          annotatedTextId: annotatedText.id,
          filename: text.filename,
          datapoints,
          text: text.text,
        });
      }
    }

    if (format === "csv") {
      // generate csv
      const csv =
        mode === TASK_MODE.DATAPOINT_EXTRACTION
          ? generateCsv(
              annotatedTextDatapoints as {
                annotatedTextId: string;
                filename: string;
                datapoints: DataPoint[];
                text: string;
              }[],
              profilePoints as ProfilePoint[]
            )
          : generateSegmentationCsv(
              annotatedTextDatapoints as {
                annotatedTextId: string;
                filename: string;
                datapoints: SegmentDataPoint[];
                text: string;
              }[],
              profilePoints as SegmentationProfilePoint[]
            );

      // download csv
      const blob = new Blob([csv], { type: "text/csv" });
      downloadFile(blob, `${annotatedDataset.name}.csv`);
    } else {
      // Generate and download XLSX
      const xlsx =
        mode === TASK_MODE.DATAPOINT_EXTRACTION
          ? generateXlsx(
              annotatedTextDatapoints as {
                annotatedTextId: string;
                filename: string;
                datapoints: DataPoint[];
                text: string;
              }[],
              profilePoints as ProfilePoint[]
            )
          : generateSegmentationXlsx(
              annotatedTextDatapoints as {
                annotatedTextId: string;
                filename: string;
                datapoints: SegmentDataPoint[];
                text: string;
              }[],
              profilePoints as SegmentationProfilePoint[]
            );
      const blob = new Blob([xlsx], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      downloadFile(blob, `${annotatedDataset.name}.xlsx`);
    }
  };

  const generateCsv = (
    annotatedTextDatapoints: {
      annotatedTextId: string;
      filename: string;
      datapoints: DataPoint[];
      text: string;
    }[],
    profilePoints: ProfilePoint[]
  ) => {
    const firstHeader = "filename";
    const headers = [
      firstHeader,
      ...profilePoints.map((pp) => pp.name.replace(/"/g, '""')),
    ];

    const rows = annotatedTextDatapoints.map((atd) => {
      const row = [atd.filename];
      for (const pp of profilePoints) {
        const dataPoint = atd.datapoints.find(
          (dp) => dp.profilePointId === pp.id
        );
        if (dataPoint && dataPoint.value) {
          row.push(dataPoint.value.toString().replace(/"/g, '""'));
        } else {
          row.push("");
        }
      }
      return row.join(",");
    });
    return [headers, ...rows].join("\n");
  };

  const generateSegmentationCsv = (
    annotatedTextDatapoints: {
      annotatedTextId: string;
      filename: string;
      datapoints: SegmentDataPoint[];
      text: string;
    }[],
    profilePoints: SegmentationProfilePoint[]
  ) => {
    const firstHeader = "filename";
    const headers = [
      firstHeader,
      ...profilePoints.map((pp) => pp.name.replace(/"/g, '""')),
    ];

    const rows = annotatedTextDatapoints.map((atd) => {
      const row = [atd.filename];
      for (const pp of profilePoints) {
        const segmentPoint = atd.datapoints.find(
          (dp) => dp.profilePointId === pp.id
        );

        if (segmentPoint && segmentPoint.beginMatch && segmentPoint.endMatch) {
          // Get the first match (assuming we want the first occurrence)
          const begin = segmentPoint.beginMatch[0];
          const end = segmentPoint.endMatch[1]; // Use endMatch[1] for inclusive end
          const segmentText = atd.text.substring(begin, end);
          row.push(segmentText.replace(/"/g, '""'));
        } else {
          row.push("");
        }
      }
      return row.join(",");
    });
    return [headers, ...rows].join("\n");
  };

  const generateXlsx = (
    annotatedTextDatapoints: {
      annotatedTextId: string;
      filename: string;
      datapoints: DataPoint[];
      text: string;
    }[],
    profilePoints: ProfilePoint[]
  ) => {
    const headers = ["filename", ...profilePoints.map((pp) => pp.name)];

    const rows = annotatedTextDatapoints.map((atd) => {
      const row: (string | number)[] = [atd.filename];
      for (const pp of profilePoints) {
        const dataPoint = atd.datapoints.find(
          (dp) => dp.profilePointId === pp.id
        );

        row.push(dataPoint?.value ?? "");
      }
      return row;
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Annotations");

    const xlsxData = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    return xlsxData;
  };

  const generateSegmentationXlsx = (
    annotatedTextDatapoints: {
      annotatedTextId: string;
      filename: string;
      datapoints: SegmentDataPoint[];
      text: string;
    }[],
    profilePoints: SegmentationProfilePoint[]
  ) => {
    const headers = ["filename", ...profilePoints.map((pp) => pp.name)];

    const rows = annotatedTextDatapoints.map((atd) => {
      const row: string[] = [atd.filename];
      for (const pp of profilePoints) {
        const segmentPoint = atd.datapoints.find(
          (dp) => dp.profilePointId === pp.id
        );

        if (segmentPoint && segmentPoint.beginMatch && segmentPoint.endMatch) {
          // Get the first match (assuming we want the first occurrence)
          const begin = segmentPoint.beginMatch[0];
          const end = segmentPoint.endMatch[1]; // Use endMatch[1] for inclusive end
          const segmentText = atd.text.substring(begin, end);
          row.push(segmentText);
        } else {
          row.push("");
        }
      }
      return row;
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Annotations");

    const xlsxData = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    return xlsxData;
  };

  const downloadFile = (blob: Blob, filename: string) => {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error during download:", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
          data-cy="toggle-dataset-list"
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 w-[300px]">
        <div className="h-full overflow-y-auto">
          <Card className="h-full border-0 rounded-none">
            <CardHeader>
              <CardTitle data-cy="manual-dataset-list-title">
                {mode === TASK_MODE.DATAPOINT_EXTRACTION
                  ? "Annotated Datasets"
                  : "Segmentation Datasets"}
              </CardTitle>
            </CardHeader>
            <CardContent data-cy="manual-dataset-list-content">
              {annotatedDatasets?.map((annotatedDataset) => (
                <CompactCard
                  key={annotatedDataset.id}
                  data-cy="manual-annotated-dataset-card"
                  title={annotatedDataset.name}
                  description={annotatedDataset.description}
                  onClick={() => {
                    setActiveAnnotatedDataset(
                      activeAnnotatedDataset === annotatedDataset
                        ? undefined
                        : annotatedDataset
                    );
                    setIsOpen(false);
                  }}
                  isActive={activeAnnotatedDataset?.id === annotatedDataset.id}
                  tooltipContent={annotatedDataset.name}
                  rightIcon={
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                        data-cy="manual-dataset-download-trigger"
                      >
                        <div className="cursor-pointer">
                          <TiDownloadOutline
                            size={20}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem
                          data-cy="manual-dataset-download-csv"
                          onClick={() =>
                            downLoadAnnotatedDataset(annotatedDataset, "csv")
                          }
                        >
                          Download as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          data-cy="manual-dataset-download-xlsx"
                          onClick={() =>
                            downLoadAnnotatedDataset(annotatedDataset, "xlsx")
                          }
                        >
                          Download as XLSX
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DatasetList;
