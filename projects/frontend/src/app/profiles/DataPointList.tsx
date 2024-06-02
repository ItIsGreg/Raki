import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DataPointList = () => {
  const dataPoints = [
    {
      id: 1,
      name: "LVEF",
      explanation: "Left ventricular ejection fraction",
      synonyms: ["LVEF", "EF"],
      dimension: "number",
      unit: "%",
      valueset: undefined,
    },
    {
      id: 2,
      name: "LVOT",
      explanation: "Left ventricular outflow tract",
      synonyms: ["LVOT"],
      dimension: "number",
      unit: "mm",
      valueset: undefined,
    },
    {
      id: 3,
      name: "Mitralinsuffizienz",
      explanation: "Mitral insufficiency",
      synonyms: ["Mitralinsuffizienz", "MI"],
      dimension: "string",
      unit: "",
      valueset: ["I", "II", "III", "IV"],
    },
    {
      id: 4,
      name: "Trikuspidalinsuffizienz",
      explanation: "Tricuspid insufficiency",
      synonyms: ["Trikuspidalinsuffizienz", "TI"],
      dimension: "string",
      unit: "",
      valueset: ["I", "II", "III", "IV"],
    },
    {
      id: 5,
      name: "Aortenklappenstenose",
      explanation: "Aortic valve stenosis",
      synonyms: ["Aortenklappenstenose", "AS"],
      dimension: "string",
      unit: "",
      valueset: ["I°", "II°", "III°", "IV°"],
    },
  ];
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Data Points</CardTitle>
          <div className="flex-grow"></div>
          <Button>Add</Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {dataPoints.map((dataPoint) => {
            return (
              <Card key={dataPoint.id}>
                <CardHeader>
                  <CardTitle>{dataPoint.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{dataPoint.explanation}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPointList;
