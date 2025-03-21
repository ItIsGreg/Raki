import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnotationDatasetListProps } from "../../types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  readAllAnnotatedDatasets,
  readAnnotatedTextsByAnnotatedDataset,
  readDataPointsByAnnotatedText,
  readProfile,
  readProfilePointsByProfile,
  readText,
} from "@/lib/db/crud";
import { TiDownloadOutline } from "react-icons/ti";
import { AnnotatedDataset, DataPoint, ProfilePoint } from "@/lib/db/db";
import CompactCard from "@/components/CompactCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";

const DatasetList = (props: AnnotationDatasetListProps) => {
  const { activeAnnotatedDataset, setActiveAnnotatedDataset } = props;

  const annotatedDatasets = useLiveQuery(() => readAllAnnotatedDatasets());

  interface AnnotatedTextDatapointsHolder {
    annotatedTextId: string;
    filename: string;
    datapoints: DataPoint[];
  }

  const downLoadAnnotatedDataset = async (
    annotatedDataset: AnnotatedDataset,
    format: "csv" | "xlsx"
  ) => {
    console.log(
      `Download initiated for dataset: ${annotatedDataset.name} in ${format} format`
    );

    // collect data for csv export
    const activeProfile = await readProfile(activeAnnotatedDataset?.profileId);

    const profilePoints = await readProfilePointsByProfile(activeProfile?.id);

    const annotatedTexts = await readAnnotatedTextsByAnnotatedDataset(
      annotatedDataset.id
    );
    // bring data into shape that is easy to work with
    const annotatedTextDatapoints: AnnotatedTextDatapointsHolder[] = [];
    for (const annotatedText of annotatedTexts) {
      const datapoints = await readDataPointsByAnnotatedText(annotatedText.id);
      const text = await readText(annotatedText.textId);
      if (text) {
        annotatedTextDatapoints.push({
          annotatedTextId: annotatedText.id,
          filename: text.filename,
          datapoints,
        });
      }
    }

    if (format === "csv") {
      // generate csv
      const csv = generateCsv(annotatedTextDatapoints, profilePoints);

      // download csv
      const blob = new Blob([csv], { type: "text/csv" });
      downloadFile(blob, `${annotatedDataset.name}.csv`);
    } else {
      // Generate and download XLSX
      const xlsx = generateXlsx(annotatedTextDatapoints, profilePoints);
      const blob = new Blob([xlsx], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      downloadFile(blob, `${annotatedDataset.name}.xlsx`);
    }
  };

  const generateCsv = (
    annotatedTextDatapoints: AnnotatedTextDatapointsHolder[],
    profilePoints: ProfilePoint[]
  ) => {
    const firstHeader = "filename";
    const headers = [
      firstHeader,
      ...profilePoints.map((pp) => pp.name.replace(/"/g, '""')),
    ];
    const headersString = headers.join(",");
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

  const generateXlsx = (
    annotatedTextDatapoints: AnnotatedTextDatapointsHolder[],
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

    return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
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
    <div
      className="col-span-1 overflow-y-scroll"
      data-cy="manual-dataset-list-container"
    >
      <Card>
        <CardHeader>
          <CardTitle data-cy="manual-dataset-list-title">
            Annotated Datasets
          </CardTitle>
        </CardHeader>
        <CardContent data-cy="manual-dataset-list-content">
          {annotatedDatasets?.map((annotatedDataset) => (
            <CompactCard
              key={annotatedDataset.id}
              data-cy="manual-annotated-dataset-card"
              title={annotatedDataset.name}
              description={annotatedDataset.description}
              onClick={() =>
                setActiveAnnotatedDataset(
                  activeAnnotatedDataset === annotatedDataset
                    ? undefined
                    : annotatedDataset
                )
              }
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
  );
};

export default DatasetList;
