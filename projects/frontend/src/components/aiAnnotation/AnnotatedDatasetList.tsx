import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddDatasetForm } from "./AddDatasetForm";
import { AnnotatedDatasetCard } from "./AnnotatedDatasetCard";
import { useAnnotationState } from "./hooks/useAnnotationState";
import EntityForm from "@/components/EntityForm";
import {
  AnnotatedDataset,
  ProfilePoint,
  SegmentationProfilePoint,
  DataPoint,
  SegmentDataPoint,
} from "@/lib/db/db";
import {
  updateAnnotatedDataset,
  readAllAnnotatedDatasets,
  readAnnotatedTextsByAnnotatedDataset,
  readDataPointsByAnnotatedText,
  readSegmentDataPointsByAnnotatedText,
  readProfile,
  readProfilePointsByProfile,
  readSegmentationProfilePointsByProfile,
  readText,
} from "@/lib/db/crud";
import { UploadDatasetButton } from "./UploadDatasetButton";
import { AddButton } from "@/components/AddButton";
import SettingsMenu from "../llmSettings/SettingsMenu";
import SettingsButton from "../llmSettings/SettingsButton";
import { TaskMode } from "@/app/constants";
import { useLiveQuery } from "dexie-react-hooks";
import * as XLSX from "xlsx";
import { TiDownloadOutline } from "react-icons/ti";
import { Table } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Update the props interface to include the mode and make it generic
interface AnnotatedDatasetListProps<
  T extends ProfilePoint | SegmentationProfilePoint
> {
  activeAnnotatedDataset: AnnotatedDataset | null;
  activeProfilePoints: T[];
  setActiveAnnotatedDataset: (dataset: AnnotatedDataset | null) => void;
  setActiveProfilePoints: (points: T[]) => void;
  mode: TaskMode;
  addingDataset: boolean;
  setAddingDataset: (adding: boolean) => void;
  annotationState: "idle" | "regular" | "faulty";
  handleStart: () => void;
  handleStop: () => void;
  identifyActiveProfilePoints: (profileId: string) => void;
  isOpen: boolean;
}

const AnnotatedDatasetList = <
  T extends ProfilePoint | SegmentationProfilePoint
>(
  props: AnnotatedDatasetListProps<T>
) => {
  const {
    activeAnnotatedDataset,
    activeProfilePoints,
    setActiveAnnotatedDataset,
    setActiveProfilePoints,
    mode,
    addingDataset,
    setAddingDataset,
    annotationState,
    handleStart,
    handleStop,
    identifyActiveProfilePoints,
    isOpen,
  } = props;

  const [editingDataset, setEditingDataset] = useState<
    AnnotatedDataset | undefined
  >(undefined);
  const activeDatasetRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  const handleSaveDataset = (dataset: AnnotatedDataset) => {
    updateAnnotatedDataset(dataset);
    setEditingDataset(undefined);
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoRerunFaulty, setAutoRerunFaulty] = useState<boolean>(true);

  // Get annotated datasets from the database
  const dbAnnotatedDatasets = useLiveQuery(() => readAllAnnotatedDatasets());

  // Filter annotated datasets based on mode
  const filteredDatasets = dbAnnotatedDatasets?.filter(
    (dataset) => dataset.mode === mode
  );

  // Scroll active dataset into view when sheet opens or active dataset changes
  useEffect(() => {
    if (activeAnnotatedDataset && isOpen) {
      // Reset the scroll state when the sheet opens
      hasScrolledRef.current = false;

      // Use a small delay to ensure the DOM is ready after sheet opens
      const timeoutId = setTimeout(() => {
        if (activeDatasetRef.current) {
          activeDatasetRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          hasScrolledRef.current = true;
        } else {
          // If ref is still not available, try again after a longer delay
          setTimeout(() => {
            if (activeDatasetRef.current) {
              activeDatasetRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              hasScrolledRef.current = true;
            }
          }, 500);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [activeAnnotatedDataset, isOpen]);

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
      mode === "datapoint_extraction"
        ? await readProfilePointsByProfile(activeProfile?.id)
        : await readSegmentationProfilePointsByProfile(activeProfile?.id);

    const annotatedTexts = await readAnnotatedTextsByAnnotatedDataset(
      annotatedDataset.id
    );

    // bring data into shape that is easy to work with
    const annotatedTextDatapoints: AnnotatedTextDatapointsHolder[] = [];
    for (const annotatedText of annotatedTexts) {
      const datapoints =
        mode === "datapoint_extraction"
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
        mode === "datapoint_extraction"
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
        mode === "datapoint_extraction"
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
    <div className="overflow-y-scroll" data-cy="ai-annotate-datasets-container">
      <Card>
        <CardHeader className="flex flex-row items-center">
          <CardTitle>
            {mode === "datapoint_extraction"
              ? "Annotated Datasets"
              : "Segmentation Datasets"}
          </CardTitle>
          <div className="flex-grow"></div>
          <SettingsButton
            data-cy="ai-annotate-settings-button"
            onClick={() => setIsSettingsOpen(true)}
          />
          <div className="w-4"></div>
          <AddButton
            data-cy="ai-annotate-add-dataset-button"
            onClick={() => setAddingDataset(true)}
            label="Dataset"
          />
          <div className="w-2"></div>
          <UploadDatasetButton data-cy="ai-annotate-upload-dataset-button" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {addingDataset && (
            <AddDatasetForm
              data-cy="ai-annotate-add-dataset-form"
              onClose={() => setAddingDataset(false)}
              mode={mode}
            />
          )}

          {editingDataset && (
            <EntityForm<AnnotatedDataset>
              data-cy="ai-annotate-edit-dataset-form"
              onCancel={() => setEditingDataset(undefined)}
              onSave={handleSaveDataset}
              existingEntity={editingDataset}
              entityType="Annotated Dataset"
            />
          )}

          <div data-cy="ai-annotate-datasets-list">
            {filteredDatasets?.map((dataset) => {
              const isActive = activeAnnotatedDataset?.id === dataset.id;

              return editingDataset && editingDataset.id === dataset.id ? (
                <EntityForm<AnnotatedDataset>
                  key={dataset.id}
                  data-cy="ai-annotate-edit-dataset-form"
                  onCancel={() => setEditingDataset(undefined)}
                  onSave={handleSaveDataset}
                  existingEntity={editingDataset}
                  entityType="Annotated Dataset"
                />
              ) : (
                <div
                  key={dataset.id}
                  ref={isActive ? activeDatasetRef : undefined}
                >
                  <AnnotatedDatasetCard<T>
                    data-cy="ai-annotate-dataset-card"
                    dataset={dataset}
                    isActive={isActive}
                    annotationState={annotationState}
                    onSelect={() => {
                      hasScrolledRef.current = false;
                      identifyActiveProfilePoints(dataset.profileId);
                      setActiveAnnotatedDataset(dataset);
                    }}
                    onStart={() => {
                      identifyActiveProfilePoints(dataset.profileId);
                      setActiveAnnotatedDataset(dataset);
                      handleStart();
                    }}
                    onStop={handleStop}
                    onEdit={() => setEditingDataset(dataset)}
                    onDelete={() => setActiveAnnotatedDataset(null)}
                    mode={mode}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <SettingsMenu
        data-cy="ai-annotate-settings-menu"
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        autoRerunFaulty={autoRerunFaulty}
        setAutoRerunFaulty={setAutoRerunFaulty}
      />
    </div>
  );
};

export default AnnotatedDatasetList;
