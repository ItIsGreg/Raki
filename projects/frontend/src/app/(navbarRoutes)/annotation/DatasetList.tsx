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
    console.log("Download initiated for dataset:", annotatedDataset.name);

    // collect data for csv export
    const activeProfile = await readProfile(activeAnnotatedDataset?.profileId);
    console.log("Active profile:", activeProfile);

    const profilePoints = await readProfilePointsByProfile(activeProfile?.id);
    console.log("Profile points count:", profilePoints?.length);

    const annotatedTexts = await readAnnotatedTextsByAnnotatedDataset(
      annotatedDataset.id
    );
    console.log("Annotated texts count:", annotatedTexts?.length);
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
    console.log("CSV generated, first 100 chars:", csv.substring(0, 100));

    // download csv
    const blob = new Blob([csv], { type: "text/csv" });
    console.log("Blob created");

    try {
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = annotatedDataset.name + ".csv";

      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error during download:", error);
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
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
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
                      onClick={() => downLoadAnnotatedDataset(annotatedDataset)}
                    >
                      Download as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
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
