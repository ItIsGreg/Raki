import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnotatedTextListProps } from "@/app/types";
import {
  readAnnotatedTextsByAnnotatedDataset,
  readTextsByIds,
} from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";
import CompactCard from "@/components/CompactCard";
import { TASK_MODE, TaskMode } from "@/app/constants";

interface ExtendedAnnotatedTextListProps extends AnnotatedTextListProps {
  mode: TaskMode;
}

const AnnotatedTextList = (props: ExtendedAnnotatedTextListProps) => {
  const {
    activeAnnotatedDataset,
    activeAnnotatedText,
    setActiveAnnotatedText,
    mode,
  } = props;

  const annotatedTexts = useLiveQuery(
    () => readAnnotatedTextsByAnnotatedDataset(activeAnnotatedDataset?.id),
    [activeAnnotatedDataset]
  );
  const texts = useLiveQuery(
    () => readTextsByIds(annotatedTexts?.map((at) => at.textId) || []),
    [annotatedTexts]
  );

  // Sort the annotated texts alphabetically by filename
  const sortedAnnotatedTexts = annotatedTexts
    ?.map((annotatedText) => ({
      ...annotatedText,
      filename:
        texts?.find((text) => text.id === annotatedText.textId)?.filename || "",
    }))
    .sort((a, b) =>
      a.filename.localeCompare(b.filename, undefined, { sensitivity: "base" })
    );

  return (
    <div
      className="overflow-y-scroll"
      data-cy="manual-annotated-text-list-container"
    >
      <Card>
        <CardHeader>
          <CardTitle data-cy="manual-annotated-text-list-title">
            {mode === TASK_MODE.DATAPOINT_EXTRACTION
              ? "Annotated Texts"
              : "Segmented Texts"}
          </CardTitle>
        </CardHeader>
        <CardContent
          className="flex flex-col gap-1"
          data-cy="manual-annotated-text-list-content"
        >
          {sortedAnnotatedTexts?.map((annotatedText) => (
            <CompactCard
              key={annotatedText.id}
              data-cy="manual-annotated-text-card"
              title={annotatedText.filename}
              onClick={() =>
                setActiveAnnotatedText(
                  activeAnnotatedText === annotatedText
                    ? undefined
                    : annotatedText
                )
              }
              isActive={activeAnnotatedText?.id === annotatedText.id}
              tooltipContent={annotatedText.filename}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnotatedTextList;
