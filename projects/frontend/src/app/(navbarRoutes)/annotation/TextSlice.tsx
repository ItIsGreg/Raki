import { createDataPoint } from "@/lib/db/crud";
import { TextSliceProps } from "../../types";

const TextSlice = (props: TextSliceProps) => {
  const { text, startIndex, annotatedTextId, setActiveDataPointId } = props;

  return (
    <span
      onMouseUp={async () => {
        const selection = window.getSelection();
        if (selection) {
          const [start, end] = [
            selection.anchorOffset,
            selection.focusOffset,
          ].sort();
          console.log(start, end);

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
      }}
    >
      {text}
    </span>
  );
};

export default TextSlice;
