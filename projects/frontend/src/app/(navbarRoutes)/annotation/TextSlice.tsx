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
      data-cy="text-slice"
      onMouseUp={async () => {
        const selection = window.getSelection();
        if (selection) {
          const [start, end] = [
            selection.anchorOffset,
            selection.focusOffset,
          ].sort((a, b) => a - b); // Use a numeric comparison

          if (activeDataPoint && !activeDataPoint.match) {
            const updatedDataPoint = {
              ...activeDataPoint,
              match: [startIndex + start, startIndex + end],
            };
            updateDataPoint(updatedDataPoint);
          } else {
            const newDataPoint = await createDataPoint({
              name: selection.toString(),
              annotatedTextId: annotatedTextId!,
              match: [startIndex + start, startIndex + end],
              profilePointId: undefined,
              value: "",
              verified: undefined,
            });
            const id = newDataPoint.id;
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
