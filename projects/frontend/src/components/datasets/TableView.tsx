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
  const gridRef = useRef(null);

  const columnNames = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const handleColumnHeaderClick = useCallback(
    (field: string) => {
      if (!isAnonymisationMode) {
        return;
      }

      setSelectedAnonymisationColumns((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(field)) {
          newSet.delete(field);
        } else {
          newSet.add(field);
        }
        return newSet;
      });
    },
    [isAnonymisationMode]
  );

  // Custom header component for clickable headers
  const CustomHeader = React.useMemo(() => {
    return (props: any) => {
      const { displayName, column } = props;
      const fieldName = column.getColId();

      const handleClick = () => {
        if (isAnonymisationMode) {
          handleColumnHeaderClick(fieldName);
        }
      };

      return (
        <div
          onClick={handleClick}
          className={`w-full h-full flex items-center justify-center cursor-pointer ${
            isAnonymisationMode ? "hover:bg-yellow-100" : ""
          }`}
          style={{
            fontWeight: selectedAnonymisationColumns.has(fieldName)
              ? "bold"
              : "normal",
          }}
        >
          {displayName}
        </div>
      );
    };
  }, [
    isAnonymisationMode,
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
      headerComponent: isAnonymisationMode ? CustomHeader : undefined,
      headerClass: [
        indexColumn === key ? "highlighted-column-index" : "",
        textColumn === key ? "highlighted-column-text" : "",
        isAnonymisationMode ? "anonymisation-selectable" : "",
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
                    <div>
                      <Select onValueChange={setIndexColumn}>
                        <SelectTrigger
                          className="w-[180px]"
                          data-cy="index-column-select"
                        >
                          <SelectValue placeholder="Select index column" />
                        </SelectTrigger>
                        <SelectContent>
                          {columnNames.map((name) => (
                            <SelectItem
                              key={name}
                              value={name}
                              data-cy={`index-column-option-${name}`}
                            >
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Choose the column that uniquely identifies each text
                      entry, such as an ID or name. This will help organize and
                      reference your data efficiently.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select onValueChange={setTextColumn}>
                        <SelectTrigger
                          className="w-[180px]"
                          data-cy="text-column-select"
                        >
                          <SelectValue placeholder="Select text column" />
                        </SelectTrigger>
                        <SelectContent>
                          {columnNames.map((name) => (
                            <SelectItem
                              key={name}
                              value={name}
                              data-cy={`text-column-option-${name}`}
                            >
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Select the column containing the main text content. This
                      text will be processed and converted into a structured,
                      tabular format for further analysis.
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
                          setIsAnonymisationMode(!isAnonymisationMode);
                          if (!isAnonymisationMode) {
                            setSelectedAnonymisationColumns(new Set());
                          }
                        }}
                        disabled={!hasData}
                        variant={isAnonymisationMode ? "default" : "outline"}
                        data-cy="start-anonymisation-btn"
                      >
                        {isAnonymisationMode
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

            {isAnonymisationMode && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">
                  Anonymisation Mode Active
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Click on column headers to select which columns to anonymise.
                </p>
                {selectedAnonymisationColumns.size > 0 && (
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
        .anonymisation-selectable {
          cursor: pointer !important;
          transition: background-color 0.2s ease !important;
        }
        .anonymisation-selectable:hover {
          background-color: #fef3c7 !important;
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
