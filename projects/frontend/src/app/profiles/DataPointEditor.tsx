"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectGroup } from "@radix-ui/react-select";
import { TiDeleteOutline } from "react-icons/ti";
import { DataPointEditorProps } from "../types";

export function DataPointEditor(props: DataPointEditorProps) {
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [valueset, setValueset] = useState<string[]>([]);
  const [datatype, setDatatype] = useState<string>("");
  const [unit, setUnit] = useState<string>("");
  const [currentSynonym, setCurrentSynonym] = useState<string>("");
  const [currentValuesetItem, setCurrentValuesetItem] = useState<string>("");

  const handleDeleteClick = (array: string, element: string) => {
    if (array == "synonyms") {
      const newSynonyms = synonyms.filter((synonym) => synonym !== element);
      setSynonyms(newSynonyms);
    }
    if (array == "valueset") {
      const newValueset = valueset.filter((valueset) => valueset !== element);
      setValueset(newValueset);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Point Editor</CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-scroll">
        <Card>
          <CardHeader>
            <CardTitle>Name</CardTitle>
            <CardDescription>The name of the Data Point</CardDescription>
          </CardHeader>
          <CardContent>
            <Input placeholder="Name" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Explanation</CardTitle>
            <CardDescription>
              Some explanation to help understand the Data Point
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input placeholder="Explanation" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Synonyms</CardTitle>
            <CardDescription>
              Other names that can be used to refer to this Data Point, e.g.
              abbreviations or full names
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 flex-wrap">
            <div className="flex flex-row gap-1">
              {synonyms.map((synonym, index) => (
                <Badge key={index}>
                  {synonym}
                  <TiDeleteOutline
                    size={20}
                    onClick={() => handleDeleteClick("synonym", synonym)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex flex-row gap-1">
              <Input
                placeholder="Synonym"
                value={currentSynonym}
                onChange={(e) => setCurrentSynonym(e.target.value)}
              />
              <Button
                onClick={() => {
                  setSynonyms([...synonyms, currentSynonym]);
                  setCurrentSynonym("");
                }}
              >
                Add Synonym
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Datatype</CardTitle>
            <CardDescription>
              The type of data that this Data Point represents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setDatatype}>
              <SelectTrigger>
                <SelectValue placeholder="Select a Datatype" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="valueset">Valueset</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">True/False</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        {datatype == "valueset" && (
          <Card>
            <CardHeader>
              <CardTitle>Valueset</CardTitle>
              <CardDescription>
                In case the datatype is a valueset, you can define the possible
                values here
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 flex-wrap">
              <div className="flex flex-row gap-1">
                {valueset.map((valueset, index) => (
                  <Badge key={index}>
                    {valueset}
                    <TiDeleteOutline
                      size={20}
                      onClick={() => handleDeleteClick("valueset", valueset)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex flex-row gap-1">
                <Input
                  placeholder="Valueset Item"
                  value={currentValuesetItem}
                  onChange={(e) => setCurrentValuesetItem(e.target.value)}
                />
                <Button
                  onClick={() => {
                    setValueset([...valueset, currentValuesetItem]);
                    setCurrentValuesetItem("");
                  }}
                >
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {datatype == "number" && (
          <Card>
            <CardHeader>
              <CardTitle>Unit</CardTitle>
              <CardDescription>
                The unit in which the number is expressed. Leave empty if no
                unit is applicable.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

export default DataPointEditor;
