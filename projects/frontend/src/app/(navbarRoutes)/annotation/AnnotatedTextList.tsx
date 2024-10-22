import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnotatedTextListProps } from "../../types";
import {
  readAnnotatedTextsByAnnotatedDataset,
  readTextsByIds,
} from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";

const AnnotatedTextList = (props: AnnotatedTextListProps) => {
  const {
    activeAnnotatedDataset,
    activeAnnotatedText,
    setActiveAnnotatedText,
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
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader>
          <CardTitle>Annotated Texts</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {sortedAnnotatedTexts?.map((annotatedText) => {
            return (
              <Card
                key={annotatedText.id}
                onClick={() =>
                  setActiveAnnotatedText(
                    activeAnnotatedText === annotatedText
                      ? undefined
                      : annotatedText
                  )
                }
                className={`cursor-pointer ${
                  activeAnnotatedText?.id === annotatedText.id
                    ? "bg-gray-100"
                    : ""
                }`}
              >
                <CardHeader>
                  <CardTitle>{annotatedText.filename}</CardTitle>
                </CardHeader>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnotatedTextList;
