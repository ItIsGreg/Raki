import { useLiveQuery } from "dexie-react-hooks";
import { LLMAnnotationAnnotatedTextsListProps } from "../types";
import {
  createAnnotatedDataset,
  readAllAnnotatedDatasets,
} from "@/lib/db/crud";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const AnnotatedTextsList = (props: LLMAnnotationAnnotatedTextsListProps) => {
  return <div></div>;
};

export default AnnotatedTextsList;
