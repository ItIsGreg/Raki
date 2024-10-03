import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextDisplayProps } from "../../types";

const TextDisplay = (props: TextDisplayProps) => {
  const { activeText } = props;
  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader>
          <CardTitle>{activeText?.filename}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{activeText?.text}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextDisplay;
