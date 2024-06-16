import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextDisplayProps } from "../../types";

const TextDisplay = (props: TextDisplayProps) => {
  const { activeText } = props;
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{activeText?.filename}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{activeText?.text}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextDisplay;
