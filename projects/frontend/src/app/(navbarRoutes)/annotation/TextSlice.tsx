import { createDataPoint, readDataPoint, updateDataPoint } from "@/lib/db/crud";
import { TextSliceProps } from "../../types";
import { useLiveQuery } from "dexie-react-hooks";

const TextSlice = (props: TextSliceProps) => {
  const {
    text,
    startIndex,
    annotatedTextId,
    setActiveDataPointId,
    activeDataPointId,
  } = props;

  const activeDataPoint = useLiveQuery(
    () => readDataPoint(activeDataPointId),
    [activeDataPointId]
  );

  return (
    <span
      onMouseUp={async () => {
        const selection = window.getSelection();
        if (selection) {
          const [start, end] = [
            selection.anchorOffset,
            selection.focusOffset,
          ].sort();

          if (activeDataPoint && !activeDataPoint.match) {
            updateDataPoint({
              ...activeDataPoint,
              match: [startIndex + start, startIndex + end],
            });
          } else {
            const id = await createDataPoint({
              name: selection.toString(),
              annotatedTextId: annotatedTextId!,
              match: [startIndex + start, startIndex + end],
              profilePointId: undefined,
              value: undefined,
              verified: undefined,
            });
            setActiveDataPointId(id);
          }
        }
      }}
    >
      {text}
    </span>
  );
};

export default TextSlice;
