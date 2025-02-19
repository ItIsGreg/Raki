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

const DatasetList = (props: AnnotationDatasetListProps) => {
  const { activeAnnotatedDataset, setActiveAnnotatedDataset } = props;

  const annotatedDatasets = useLiveQuery(() => readAllAnnotatedDatasets());

  interface AnnotatedTextDatapointsHolder {
    annotatedTextId: string;
    filename: string;
    datapoints: DataPoint[];
  }

  const downLoadAnnotatedDataset = async (
    annotatedDataset: AnnotatedDataset
  ) => {
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
    // generate csv
    const csv = generateCsv(annotatedTextDatapoints, profilePoints);
    // download csv
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = url;
    link.download = annotatedDataset.name + ".csv";

    // Append the link to the body
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  const handleCsvDownload = async (annotatedDataset: AnnotatedDataset) => {
    await downLoadAnnotatedDataset(annotatedDataset);
  };

  const handleXlsxDownload = async (annotatedDataset: AnnotatedDataset) => {
    // Will implement Excel download logic later
    console.log("Excel download not implemented yet");
  };

  return (
    <div className="col-span-1 overflow-y-scroll">
      <Card>
        <CardHeader>
          <CardTitle>Annotated Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          {annotatedDatasets?.map((annotatedDataset) => (
            <CompactCard
              key={annotatedDataset.id}
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
                <TiDownloadOutline size={20} className="cursor-pointer" />
              }
              onDownloadCsv={() => handleCsvDownload(annotatedDataset)}
              onDownloadXlsx={() => handleXlsxDownload(annotatedDataset)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetList;
