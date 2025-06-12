import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createText } from "@/lib/db/crud";
import { Dataset } from "@/lib/db/db";

interface TableViewProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  activeDataset: Dataset | undefined;
}

const TableView: React.FC<TableViewProps> = ({
  isOpen,
  onClose,
  data,
  activeDataset,
}) => {
  const [indexColumn, setIndexColumn] = useState<string | null>(null);
  const [textColumn, setTextColumn] = useState<string | null>(null);
  const [isAnonymisationMode, setIsAnonymisationMode] = useState(false);
  const [selectedAnonymisationColumns, setSelectedAnonymisationColumns] =
    useState<Set<string>>(new Set());
  const [headerSelectionMode, setHeaderSelectionMode] = useState<
    "none" | "index" | "text" | "anonymisation"
  >("none");
  const gridRef = useRef(null);

  const columnNames = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const handleColumnHeaderClick = useCallback(
    (field: string) => {
      if (headerSelectionMode === "none") {
        return;
      }

      if (headerSelectionMode === "index") {
        setIndexColumn(field);
        setHeaderSelectionMode("none");
      } else if (headerSelectionMode === "text") {
        setTextColumn(field);
        setHeaderSelectionMode("none");
      } else if (headerSelectionMode === "anonymisation") {
        setSelectedAnonymisationColumns((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(field)) {
            newSet.delete(field);
          } else {
            newSet.add(field);
          }
          return newSet;
        });
      }
    },
    [headerSelectionMode]
  );

  // Custom header component for clickable headers
  const CustomHeader = React.useMemo(() => {
    return (props: any) => {
      const { displayName, column } = props;
      const fieldName = column.getColId();

      const handleClick = () => {
        if (headerSelectionMode !== "none") {
          handleColumnHeaderClick(fieldName);
        }
      };

      const getHeaderStyle = () => {
        const isSelected =
          indexColumn === fieldName ||
          textColumn === fieldName ||
          selectedAnonymisationColumns.has(fieldName);

        return {
          fontWeight: isSelected ? "bold" : "normal",
        };
      };

      const getHoverClass = () => {
        if (headerSelectionMode === "none") return "";
        if (headerSelectionMode === "index") return "hover:bg-blue-100";
        if (headerSelectionMode === "text") return "hover:bg-green-100";
        if (headerSelectionMode === "anonymisation")
          return "hover:bg-yellow-100";
        return "";
      };

      return (
        <div
          onClick={handleClick}
          className={`w-full h-full flex items-center justify-center ${
            headerSelectionMode !== "none" ? "cursor-pointer" : ""
          } ${getHoverClass()}`}
          style={getHeaderStyle()}
        >
          {displayName}
        </div>
      );
    };
  }, [
    headerSelectionMode,
    indexColumn,
    textColumn,
    selectedAnonymisationColumns,
    handleColumnHeaderClick,
  ]);

  const columnDefs = useMemo(() => {
    if (!data || data.length === 0) return [];
    return columnNames.map((key) => ({
      field: key,
      headerName: key,
      sortable: false,
      filter: false,
      resizable: false,
      suppressMovable: true,
      headerComponent:
        headerSelectionMode !== "none" ? CustomHeader : undefined,
      headerClass: [
        indexColumn === key ? "highlighted-column-index" : "",
        textColumn === key ? "highlighted-column-text" : "",
        headerSelectionMode !== "none" ? "header-selectable" : "",
        selectedAnonymisationColumns.has(key) ? "anonymisation-selected" : "",
      ]
        .filter(Boolean)
        .join(" "),
      cellClass: [
        indexColumn === key ? "highlighted-column-index" : "",
        textColumn === key ? "highlighted-column-text" : "",
        selectedAnonymisationColumns.has(key) ? "anonymisation-selected" : "",
      ]
        .filter(Boolean)
        .join(" "),
    }));
  }, [
    data,
    columnNames,
    indexColumn,
    textColumn,
    isAnonymisationMode,
    selectedAnonymisationColumns,
    CustomHeader,
  ]);

  const anonymiseText = useCallback(
    (text: string, row: any): string => {
      if (selectedAnonymisationColumns.size === 0) {
        return text; // No anonymisation needed
      }

      let anonymisedText = text;

      // Get all values from selected anonymisation columns for this row
      const sensitiveValues = Array.from(selectedAnonymisationColumns)
        .map((column) => row[column])
        .filter((value) => value && String(value).trim() !== "")
        .map((value) => String(value).trim());

      // Remove each sensitive value from the text
      sensitiveValues.forEach((sensitiveValue) => {
        if (sensitiveValue.length > 0) {
          // Create a case-insensitive regex with word boundaries
          const regex = new RegExp(
            `\\b${sensitiveValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            "gi"
          );
          anonymisedText = anonymisedText.replace(regex, "[REDACTED]");
        }
      });

      return anonymisedText;
    },
    [selectedAnonymisationColumns]
  );

  const handleImportTexts = useCallback(() => {
    if (
      !activeDataset ||
      !indexColumn ||
      !textColumn ||
      !data ||
      data.length === 0
    ) {
      return;
    }

    // Process all rows including the first row
    data.forEach((row) => {
      const filename = row[indexColumn];
      const originalText = row[textColumn];

      if (filename && originalText) {
        // Apply anonymisation if columns are selected
        const processedText = anonymiseText(String(originalText), row);

        createText({
          datasetId: activeDataset.id,
          filename: String(filename),
          text: processedText,
        });
      }
    });

    onClose(); // Close the dialog after import
  }, [
    activeDataset,
    indexColumn,
    textColumn,
    data,
    onClose,
    anonymiseText,
    selectedAnonymisationColumns,
  ]);

  const hasData = data && data.length > 0;

  // AG Grid default column definitions
  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 100,
      maxWidth: 500,
      suppressSizeToFit: true,
    }),
    []
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Table View</DialogTitle>
        </DialogHeader>
        {hasData ? (
          <>
            <div className="flex space-x-4 mb-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium">
                        Index Column: {indexColumn || "None selected"}
                      </span>
                      <Button
                        onClick={() => {
                          if (headerSelectionMode === "index") {
                            setHeaderSelectionMode("none");
                          } else {
                            setHeaderSelectionMode("index");
                          }
                        }}
                        variant={
                          headerSelectionMode === "index"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        data-cy="select-index-column-btn"
                      >
                        {headerSelectionMode === "index"
                          ? "Cancel Selection"
                          : "Select Index Column"}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Click the button then click a column header to select the
                      index column. This column uniquely identifies each text
                      entry.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium">
                        Text Column: {textColumn || "None selected"}
                      </span>
                      <Button
                        onClick={() => {
                          if (headerSelectionMode === "text") {
                            setHeaderSelectionMode("none");
                          } else {
                            setHeaderSelectionMode("text");
                          }
                        }}
                        variant={
                          headerSelectionMode === "text" ? "default" : "outline"
                        }
                        size="sm"
                        data-cy="select-text-column-btn"
                      >
                        {headerSelectionMode === "text"
                          ? "Cancel Selection"
                          : "Select Text Column"}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Click the button then click a column header to select the
                      text column. This column contains the main content to be
                      processed.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        onClick={handleImportTexts}
                        disabled={!indexColumn || !textColumn}
                        data-cy="import-texts-btn"
                      >
                        Import Texts
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      After selecting the index and text columns, click here to
                      import your data for AI-powered annotation and analysis.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        onClick={() => {
                          if (headerSelectionMode === "anonymisation") {
                            setHeaderSelectionMode("none");
                            setIsAnonymisationMode(false);
                          } else {
                            setHeaderSelectionMode("anonymisation");
                            setIsAnonymisationMode(true);
                            setSelectedAnonymisationColumns(new Set());
                          }
                        }}
                        disabled={!hasData}
                        variant={
                          headerSelectionMode === "anonymisation"
                            ? "default"
                            : "outline"
                        }
                        data-cy="start-anonymisation-btn"
                      >
                        {headerSelectionMode === "anonymisation"
                          ? "Exit Anonymisation"
                          : "Start Anonymisation"}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Anonymise the text content in the selected column before
                      importing. This will help protect sensitive information in
                      medical reports.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {headerSelectionMode !== "none" && (
              <div
                className={`mb-4 p-4 rounded-lg border ${
                  headerSelectionMode === "index"
                    ? "bg-blue-50 border-blue-200"
                    : headerSelectionMode === "text"
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <h4
                  className={`font-medium mb-2 ${
                    headerSelectionMode === "index"
                      ? "text-blue-900"
                      : headerSelectionMode === "text"
                      ? "text-green-900"
                      : "text-yellow-900"
                  }`}
                >
                  {headerSelectionMode === "index"
                    ? "Index Column Selection"
                    : headerSelectionMode === "text"
                    ? "Text Column Selection"
                    : "Anonymisation Mode Active"}
                </h4>
                <p
                  className={`text-sm mb-3 ${
                    headerSelectionMode === "index"
                      ? "text-blue-700"
                      : headerSelectionMode === "text"
                      ? "text-green-700"
                      : "text-yellow-700"
                  }`}
                >
                  {headerSelectionMode === "index"
                    ? "Click on a column header to select it as the index column."
                    : headerSelectionMode === "text"
                    ? "Click on a column header to select it as the text column."
                    : "Click on column headers to select which columns to anonymise."}
                </p>
                {headerSelectionMode === "anonymisation" &&
                  selectedAnonymisationColumns.size > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Selected columns for anonymisation:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(selectedAnonymisationColumns).map(
                          (column) => (
                            <span
                              key={column}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                            >
                              {column}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                {headerSelectionMode === "anonymisation" && (
                  <Button
                    onClick={() => {
                      // Placeholder for future anonymisation logic
                    }}
                    disabled={selectedAnonymisationColumns.size === 0}
                    size="sm"
                    data-cy="proceed-anonymisation-btn"
                  >
                    Proceed with Anonymisation (
                    {selectedAnonymisationColumns.size} columns)
                  </Button>
                )}
              </div>
            )}

            <div
              className="ag-theme-alpine"
              style={{ height: 400, width: "100%" }}
              data-cy="table-grid"
            >
              <AgGridReact
                ref={gridRef}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowData={data}
                domLayout="normal"
                suppressPropertyNamesCheck={true}
                suppressContextMenu={true}
                suppressRowClickSelection={true}
                suppressCellFocus={true}
                suppressRowHoverHighlight={true}
                suppressColumnVirtualisation={true}
                suppressRowVirtualisation={true}
                suppressLoadingOverlay={true}
                suppressNoRowsOverlay={true}
                suppressFieldDotNotation={true}
                suppressScrollOnNewData={true}
                suppressAutoSize={true}
                suppressColumnMoveAnimation={true}
                suppressDragLeaveHidesColumns={true}
                suppressRowTransform={true}
                enableCellTextSelection={true}
                ensureDomOrder={true}
                rowBuffer={0}
                suppressAnimationFrame={true}
                suppressModelUpdateAfterUpdateTransaction={true}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No data available. Please upload a table file first.
          </div>
        )}
      </DialogContent>
      <style jsx global>{`
        .highlighted-column-index {
          background-color: #e6f7ff !important;
        }
        .highlighted-column-text {
          background-color: #e6ffe6 !important;
        }
        .header-selectable {
          cursor: pointer !important;
          transition: background-color 0.2s ease !important;
        }
        .anonymisation-selected {
          background-color: #fbbf24 !important;
          color: #92400e !important;
          font-weight: bold !important;
        }
        .anonymisation-selected:hover {
          background-color: #f59e0b !important;
        }
      `}</style>
    </Dialog>
  );
};

export default TableView;
