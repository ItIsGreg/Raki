import { createDataPoint } from "@/lib/db/crud";
import { TextSliceProps } from "../../types";

const TextSlice = (props: TextSliceProps) => {
  const { text, startIndex, annotatedTextId } = props;

  return (
    <span
      onMouseUp={() => {
        const selection = window.getSelection();
        if (selection) {
          const [start, end] = [
            selection.anchorOffset,
            selection.focusOffset,
          ].sort();
          console.log(start, end);

          createDataPoint({
            name: selection.toString(),
            annotatedTextId: annotatedTextId!,
            match: [startIndex + start, startIndex + end],
            profilePointId: undefined,
            value: undefined,
          });
        }
      }}
    >
      {text}
    </span>
  );
};

export default TextSlice;
