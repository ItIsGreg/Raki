import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextDisplayProps } from "../../app/types";

const TextDisplay = (props: TextDisplayProps) => {
  const { activeText } = props;
  return (
    <div className="overflow-y-scroll" data-cy="text-display">
      <Card>
        <CardHeader>
          <CardTitle data-cy="text-display-filename">
            {activeText?.filename}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap" data-cy="text-display-content">
            {activeText?.text}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextDisplay;
