import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createText, deleteText, readTextsByDataset } from "@/lib/db/crud";
import { TextListProps } from "../../app/types";
import { TiDeleteOutline } from "react-icons/ti";
import { useRef, useState, useEffect } from "react";
import { FaTable, FaFolderOpen, FaDownload, FaUpload } from "react-icons/fa";
import TableView from "./TableView";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import SingleTextInput from "./SingleTextInput";
import * as pdfjsLib from "pdfjs-dist";
import { backendURL } from "../../app/constants";
import CompactCard from "@/components/CompactCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TextList = (props: TextListProps) => {
  const { activeText, activeDataset, setActiveText } = props;

  const [dbTexts, setDbTexts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableFileInputRef = useRef<HTMLInputElement>(null);

  const [isTableViewOpen, setIsTableViewOpen] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [isSingleTextOpen, setIsSingleTextOpen] = useState(false);

  // Function to refresh texts
  const refreshTexts = async () => {
    if (!activeDataset?.id) {
      setDbTexts([]);
      return;
    }

    try {
      const texts = await readTextsByDataset(activeDataset.id);
      setDbTexts(texts || []);
    } catch (error) {
      console.error("Error refreshing texts:", error);
    }
  };

  // Load texts when activeDataset changes
  useEffect(() => {
    const loadTexts = async () => {
      if (!activeDataset?.id) {
        setDbTexts([]);
        return;
      }

      setIsLoading(true);
      try {
        const texts = await readTextsByDataset(activeDataset.id);
        setDbTexts(texts || []);
      } catch (error) {
        console.error("Error loading texts:", error);
        setDbTexts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTexts();
  }, [activeDataset?.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
    }
  }, []);

  const handleUploadButtonClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current?.click();
  };

  const extractTextFromPDFBackend = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${backendURL}/text-segmentation/extract-pdf`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to extract PDF text from backend");
    }

    const data = await response.json();
    return data.markdown;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension === "pdf") {
        try {
          const text = await extractTextFromPDFBackend(file);
          if (!activeDataset) return;
          await createText({
            datasetId: activeDataset.id,
            filename: file.name,
            text,
          });
          await refreshTexts();
        } catch (error) {
          console.error("Error processing PDF:", error);
        }
      } else if (fileExtension === "md") {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target?.result as string;
          if (!activeDataset) return;
          await createText({
            datasetId: activeDataset.id,
            filename: file.name,
            text,
          });
          await refreshTexts();
        };
        reader.readAsText(file);
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
          await refreshTexts();
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
          if (result.errors && result.errors.length > 0) {
            console.error("CSV parsing errors:", result.errors);
            return;
          }
          // Ensure we have valid data
          if (!result.data || result.data.length === 0) {
            console.error("No data found in CSV file");
            return;
          }
          // Filter out any empty rows
          const validData = result.data.filter((row: any) =>
            Object.values(row).some(
              (value) => value !== null && value !== undefined && value !== ""
            )
          );
          setTableData(validData);
          setIsTableViewOpen(true);
        },
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        transform: (value: string) => value.trim(),
      });
    } else if (["xlsx", "xls"].includes(fileExtension || "")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            console.error("No data read from file");
            return;
          }
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON with proper header handling
          const parsedData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            defval: "",
          });

          // Convert to proper format with headers
          const headers = parsedData[0] as string[];
          const rows = parsedData.slice(1) as string[][];

          const formattedData = rows
            .map((row) => {
              const obj: { [key: string]: string } = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] || "";
              });
              return obj;
            })
            .filter((row) =>
              Object.values(row).some(
                (value) => value !== null && value !== undefined && value !== ""
              )
            );

          setTableData(formattedData);
          setIsTableViewOpen(true);
        } catch (error) {
          console.error("Error processing Excel file:", error);
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleUploadTableClick = () => {
    if (!tableFileInputRef.current) return;
    tableFileInputRef.current?.click();
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
        <CardHeader className="grid grid-cols-3 items-center">
          <div>
            <CardTitle>
              Texts {sortedTexts && `(${sortedTexts.length})`}
            </CardTitle>
            <CardDescription>{activeDataset?.name}</CardDescription>
          </div>
          {activeDataset && (
            <>
              <div className="flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button data-cy="upload-texts-btn">
                      <FaUpload className="mr-2" />
                      Upload
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent data-cy="upload-dropdown-content">
                    <DropdownMenuItem
                      onClick={handleUploadButtonClick}
                      data-cy="upload-files-option"
                    >
                      Upload Files
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsSingleTextOpen(true)}
                      data-cy="single-text-option"
                    >
                      Single Text
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleUploadTableClick}
                      data-cy="upload-table-option"
                    >
                      <FaTable className="mr-2" />
                      Upload Table
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleDownloadTexts}
                  className="flex items-center"
                  title="Download Texts"
                  data-cy="download-all-btn"
                  variant="ghost"
                  size="icon"
                >
                  <FaDownload className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept=".txt,.pdf,.md"
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
        <CardContent className="flex flex-col gap-1">
          {sortedTexts?.map((text) => (
            <CompactCard
              key={text.id}
              title={text.filename}
              onClick={() => setActiveText(text)}
              isActive={activeText?.id === text.id}
              tooltipContent={text.filename}
              rightIcon={
                <TiDeleteOutline
                  className="hover:text-red-500 cursor-pointer"
                  size={20}
                  onClick={async (e) => {
                    e.stopPropagation();
                    await deleteText(text.id);
                    await refreshTexts();
                  }}
                  data-cy="delete-text-btn"
                />
              }
              data-cy="text-card"
            />
          ))}
        </CardContent>
      </Card>
      <TableView
        isOpen={isTableViewOpen}
        onClose={() => setIsTableViewOpen(false)}
        data={tableData}
        activeDataset={activeDataset}
        onTextsImported={refreshTexts}
      />
      <SingleTextInput
        isOpen={isSingleTextOpen}
        onClose={() => setIsSingleTextOpen(false)}
        activeDataset={activeDataset}
        onTextCreated={refreshTexts}
      />
    </div>
  );
};

export default TextList;
