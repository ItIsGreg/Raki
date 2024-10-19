import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createText, deleteText, readTextsByDataset } from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";
import { TextListProps } from "../../types";
import { TiDeleteOutline } from "react-icons/ti";
import { useRef, useState } from "react";
import { FaTable, FaFolderOpen } from "react-icons/fa";
import TableView from "./TableView";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const TextList = (props: TextListProps) => {
  const { activeText, activeDataset, setActiveText } = props;

  const dbTexts = useLiveQuery(
    () => readTextsByDataset(activeDataset?.id),
    [activeDataset]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableFileInputRef = useRef<HTMLInputElement>(null);

  const [isTableViewOpen, setIsTableViewOpen] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);

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

  const handleTableFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension === "csv") {
      Papa.parse(file, {
        complete: (result) => {
          setTableData(result.data);
          setIsTableViewOpen(true);
        },
        header: true,
      });
    } else if (["xlsx", "xls"].includes(fileExtension || "")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(worksheet);
        setTableData(parsedData);
        setIsTableViewOpen(true);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleUploadTableClick = () => {
    if (!tableFileInputRef.current) return;
    tableFileInputRef.current?.click();
  };

  const handleOpenTableClick = () => {
    setIsTableViewOpen(true);
  };

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row items-center">
          <CardTitle>Texts</CardTitle>
          <div className="flex-grow"></div>

          {activeDataset && (
            <>
              <Button onClick={handleUploadButtonClick} className="mr-2">
                Upload Texts
              </Button>
              <Button
                onClick={handleUploadTableClick}
                className="flex items-center mr-2"
              >
                <FaTable className="mr-2" />
                Upload Table
              </Button>
              <Button
                onClick={handleOpenTableClick}
                className="flex items-center"
              >
                <FaFolderOpen className="mr-2" />
                Open Table
              </Button>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept=".txt"
            multiple
            onChange={handleFileChange}
          />
          <input
            type="file"
            ref={tableFileInputRef}
            hidden
            accept=".csv,.xlsx,.xls"
            onChange={handleTableFileUpload}
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
      <TableView
        isOpen={isTableViewOpen}
        onClose={() => setIsTableViewOpen(false)}
        data={tableData}
        activeDataset={activeDataset}
      />
    </div>
  );
};

export default TextList;
