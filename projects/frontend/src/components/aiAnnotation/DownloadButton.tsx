import React from "react";
import { TiDownloadOutline } from "react-icons/ti";
import { AnnotatedDataset } from "@/lib/db/db";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";
import {
  readAnnotatedTextsByAnnotatedDataset,
  readDataPointsByAnnotatedText,
  readSegmentDataPointsByAnnotatedText,
  readProfile,
  readProfilePointsByProfile,
  readSegmentationProfilePointsByProfile,
  readText,
  readDataset,
} from "@/lib/db/crud";
import { downloadAnnotatedDataset } from "./annotationUtils";
import { DataPoint, SegmentDataPoint } from "@/lib/db/db";
import { TaskMode } from "@/app/constants";

interface DownloadButtonProps {
  dataset: AnnotatedDataset;
  mode: TaskMode;
}

interface AnnotatedTextDatapointsHolder {
  annotatedTextId: string;
  filename: string;
  datapoints: DataPoint[] | SegmentDataPoint[];
  text: string;
}

const DownloadButton = ({ dataset, mode }: DownloadButtonProps) => {
  const downLoadAnnotatedDataset = async (format: "json" | "csv" | "xlsx") => {
    if (format === "json") {
      // Use the correct downloadAnnotatedDataset function for JSON exports
      await downloadAnnotatedDataset(dataset);
      return;
    }

    // Keep existing logic for CSV and XLSX exports
    // collect data for export
    const activeProfile = await readProfile(dataset.profileId);

    const profilePoints =
      mode === "datapoint_extraction"
        ? await readProfilePointsByProfile(activeProfile?.id)
        : await readSegmentationProfilePointsByProfile(activeProfile?.id);

    const annotatedTexts = await readAnnotatedTextsByAnnotatedDataset(
      dataset.id
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

    if (format === "json") {
      // Download as JSON with complete structure for upload compatibility
      const jsonData = {
        annotatedDataset: dataset,
        originalDataset: await readDataset(dataset.datasetId),
        profile: activeProfile,
        profilePoints: profilePoints,
        texts: await Promise.all(
          annotatedTexts.map(async (at) => {
            return await readText(at.textId);
          })
        ),
        annotatedTexts: await readAnnotatedTextsByAnnotatedDataset(dataset.id),
        dataPoints: await Promise.all(
          annotatedTexts.map(async (at) => {
            return await readDataPointsByAnnotatedText(at.id);
          })
        ).then((arrays) => arrays.flat()),
      };
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json",
      });
      downloadFile(blob, `${dataset.name}.json`);
    } else if (format === "csv") {
      // Generate and download CSV
      const csv =
        mode === "datapoint_extraction"
          ? generateCsv(
              annotatedTextDatapoints as {
                annotatedTextId: string;
                filename: string;
                datapoints: DataPoint[];
                text: string;
              }[],
              profilePoints
            )
          : generateSegmentationCsv(
              annotatedTextDatapoints as {
                annotatedTextId: string;
                filename: string;
                datapoints: SegmentDataPoint[];
                text: string;
              }[],
              profilePoints
            );

      const blob = new Blob([csv], { type: "text/csv" });
      downloadFile(blob, `${dataset.name}.csv`);
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
              profilePoints
            )
          : generateSegmentationXlsx(
              annotatedTextDatapoints as {
                annotatedTextId: string;
                filename: string;
                datapoints: SegmentDataPoint[];
                text: string;
              }[],
              profilePoints
            );
      const blob = new Blob([xlsx], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      downloadFile(blob, `${dataset.name}.xlsx`);
    }
  };

  const generateCsv = (
    annotatedTextDatapoints: {
      annotatedTextId: string;
      filename: string;
      datapoints: DataPoint[];
      text: string;
    }[],
    profilePoints: any[]
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
    profilePoints: any[]
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
          const begin = segmentPoint.beginMatch[0];
          const end = segmentPoint.endMatch[1];
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
    profilePoints: any[]
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
    profilePoints: any[]
  ) => {
    const headers = ["filename", ...profilePoints.map((pp) => pp.name)];

    const rows = annotatedTextDatapoints.map((atd) => {
      const row: string[] = [atd.filename];
      for (const pp of profilePoints) {
        const segmentPoint = atd.datapoints.find(
          (dp) => dp.profilePointId === pp.id
        );

        if (segmentPoint && segmentPoint.beginMatch && segmentPoint.endMatch) {
          const begin = segmentPoint.beginMatch[0];
          const end = segmentPoint.endMatch[1];
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
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        onClick={(e) => e.stopPropagation()}
        data-cy="download-dataset-trigger"
      >
        <div className="cursor-pointer">
          <TiDownloadOutline size={20} onClick={(e) => e.stopPropagation()} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem
          data-cy="download-dataset-json"
          onClick={() => downLoadAnnotatedDataset("json")}
        >
          Download as JSON
        </DropdownMenuItem>
        <DropdownMenuItem
          data-cy="download-dataset-csv"
          onClick={() => downLoadAnnotatedDataset("csv")}
        >
          Download as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          data-cy="download-dataset-xlsx"
          onClick={() => downLoadAnnotatedDataset("xlsx")}
        >
          Download as XLSX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadButton;
