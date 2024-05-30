"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";

interface DataPointMatch {
  startIndex: number;
  endIndex: number;
}

interface DataPoint {
  id: String;
  name: String;
  value: String | number;
  match: DataPointMatch;
}

const dummyText =
  "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";

const dummyDataPoints: DataPoint[] = [
  {
    id: "1",
    name: "LVEF",
    value: 55,
    match: {
      startIndex: 5,
      endIndex: 15,
    },
  },
  {
    id: "2",
    name: "LVOT",
    value: 20,
    match: {
      startIndex: 25,
      endIndex: 35,
    },
  },
  {
    id: "3",
    name: "Mitralinsuffizienz",
    value: "III",
    match: {
      startIndex: 45,
      endIndex: 55,
    },
  },
  {
    id: "4",
    name: "Trikuspidalinsuffizienz",
    value: "IV",
    match: {
      startIndex: 65,
      endIndex: 75,
    },
  },
  {
    id: "5",
    name: "Aortenklappenstenose",
    value: "II°",
    match: {
      startIndex: 85,
      endIndex: 95,
    },
  },
];

const Annotation = () => {
  const [text, setText] = useState<String>("");
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  return (
    <div>
      <span>Moin</span>
      <span>Moin</span>
      <Badge>Moin</Badge>
      <span>Moin</span>
      <span>Moin</span>
      <span>Moin</span>
    </div>
  );
};

export default Annotation;
