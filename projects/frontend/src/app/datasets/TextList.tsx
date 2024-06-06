import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createText, deleteText, readTextsByDataset } from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";
import { TextListProps } from "../types";
import { TiDeleteOutline } from "react-icons/ti";
import { useRef } from "react";

const TextList = (props: TextListProps) => {
  const { activeText, activeDataset, setActiveText } = props;

  const dbTexts = useLiveQuery(
    () => readTextsByDataset(activeDataset?.id),
    [activeDataset]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadButtonClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        if (!activeDataset) return;
        createText({
          datasetId: activeDataset.id,
          filename: file.name,
          text,
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Texts</CardTitle>
          <div className="flex-grow"></div>

          {activeDataset && (
            <Button onClick={handleUploadButtonClick}>Upload Texts</Button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept=".txt"
            multiple
            onChange={handleFileChange}
          />
        </CardHeader>
        <CardContent>
          {dbTexts?.map((text) => {
            return (
              <Card
                key={text.id}
                onClick={() => {
                  setActiveText(text);
                }}
                className={`${
                  activeText == text &&
                  "bg-gray-100 shadow-lg border-black border-2"
                } transition-transform hover:bg-gray-100 hover:shadow-lg transform`}
              >
                <CardHeader className="flex flex-row">
                  <CardTitle>{text.filename}</CardTitle>
                  <div className="flex-grow"></div>
                  <TiDeleteOutline
                    className="hover:text-red-500 cursor-pointer"
                    size={24}
                    onClick={() => {
                      deleteText(text.id);
                    }}
                  />
                </CardHeader>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default TextList;
