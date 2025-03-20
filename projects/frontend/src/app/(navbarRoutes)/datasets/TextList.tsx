import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createText, deleteText, readTextsByDataset } from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";
import { TextListProps } from "../../types";
import { TiDeleteOutline } from "react-icons/ti";
import { useRef, useState, useEffect } from "react";
import { FaTable, FaFolderOpen, FaDownload } from "react-icons/fa";
import TableView from "./TableView";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import SingleTextInput from "./SingleTextInput";
import * as pdfjsLib from "pdfjs-dist";

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
  const [isSingleTextOpen, setIsSingleTextOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
    }
  }, []);

  const handleUploadButtonClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current?.click();
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension === "pdf") {
        try {
          const text = await extractTextFromPDF(file);
          if (!activeDataset) return;
          await createText({
            datasetId: activeDataset.id,
            filename: file.name,
            text,
          });
        } catch (error) {
          console.error("Error processing PDF:", error);
        }
      } else {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target?.result as string;
          if (!activeDataset) return;
          await createText({
            datasetId: activeDataset.id,
            filename: file.name,
            text,
          });
        };
        reader.readAsText(file);
      }
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

  // Add this sorting function
  const sortedTexts = dbTexts?.sort((a, b) =>
    a.filename.localeCompare(b.filename, undefined, { sensitivity: "base" })
  );

  const handleDownloadTexts = async () => {
    if (!sortedTexts || sortedTexts.length === 0) return;

    const zip = new JSZip();

    sortedTexts.forEach((text) => {
      zip.file(`${text.filename}.txt`, text.text);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${activeDataset?.name || "dataset"}_texts.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row items-center">
          <CardTitle>Texts</CardTitle>
          <div className="flex-grow"></div>

          {activeDataset && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleUploadButtonClick}
                data-cy="upload-texts-btn"
              >
                Upload Texts
              </Button>
              <Button
                onClick={() => setIsSingleTextOpen(true)}
                data-cy="single-text-btn"
              >
                Single Text
              </Button>
              <Button
                onClick={handleUploadTableClick}
                className="flex items-center"
                data-cy="upload-table-btn"
              >
                <FaTable className="mr-2" />
                Upload Table
              </Button>
              <Button
                onClick={handleOpenTableClick}
                className="flex items-center"
                data-cy="open-table-btn"
              >
                <FaFolderOpen className="mr-2" />
                Open Table
              </Button>
              <Button
                onClick={handleDownloadTexts}
                className="col-span-2 flex items-center justify-center"
                title="Download Texts"
                data-cy="download-all-btn"
              >
                <FaDownload className="mr-2" />
                Download All
              </Button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept=".txt,.pdf"
            multiple
            onChange={handleFileChange}
            data-cy="file-input"
          />
          <input
            type="file"
            ref={tableFileInputRef}
            hidden
            accept=".csv,.xlsx,.xls"
            onChange={handleTableFileUpload}
            data-cy="table-file-input"
          />
        </CardHeader>
        <CardContent>
          {sortedTexts?.map((text) => {
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
                data-cy="text-card"
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
                    data-cy="delete-text-btn"
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
      <SingleTextInput
        isOpen={isSingleTextOpen}
        onClose={() => setIsSingleTextOpen(false)}
        activeDataset={activeDataset}
      />
    </div>
  );
};

export default TextList;
