import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  return (
    <div className="col-span-1 overflow-y-scroll">
      <Card>
        <CardHeader>
          <CardTitle>Annotated Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          {annotatedDatasets?.map((annotatedDataset) => {
            return (
              <TooltipProvider key={annotatedDataset.id} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card
                      onClick={() =>
                        setActiveAnnotatedDataset(
                          activeAnnotatedDataset === annotatedDataset
                            ? undefined
                            : annotatedDataset
                        )
                      }
                      className={`cursor-pointer ${
                        activeAnnotatedDataset?.id === annotatedDataset.id
                          ? "bg-gray-100"
                          : ""
                      }`}
                    >
                      <CardHeader className="flex flex-row gap-2">
                        <CardTitle className="truncate">
                          {annotatedDataset.name}
                        </CardTitle>
                        <div className="flex flex-grow"></div>
                        <TiDownloadOutline
                          size={24}
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            downLoadAnnotatedDataset(annotatedDataset);
                          }}
                        />
                      </CardHeader>
                      <CardFooter>{annotatedDataset.description}</CardFooter>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>{annotatedDataset.name}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetList;
