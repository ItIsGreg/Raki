import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnnotationDatasetListProps } from "../types";
import { useLiveQuery } from "dexie-react-hooks";
import { readAllAnnotatedDatasets } from "@/lib/db/crud";

const DatasetList = (props: AnnotationDatasetListProps) => {
  const { activeAnnotatedDataset, setActiveAnnotatedDataset } = props;

  const annotatedDatasets = useLiveQuery(() => readAllAnnotatedDatasets());

  return (
    <div className="col-span-1">
      <Card>
        <CardHeader>
          <CardTitle>Annotated Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          {annotatedDatasets?.map((annotatedDataset) => {
            return (
              <Card
                key={annotatedDataset.id}
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
                <CardHeader>
                  <CardTitle>{annotatedDataset.name}</CardTitle>
                </CardHeader>
                <CardFooter>{annotatedDataset.description}</CardFooter>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetList;
