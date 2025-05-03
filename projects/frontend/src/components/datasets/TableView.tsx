import React, { useState, useMemo, useCallback } from "react";
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

  const columnNames = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const columnDefs = useMemo(() => {
    if (!data || data.length === 0) return [];
    return columnNames.map((key) => ({
      field: key,
      sortable: false,
      filter: false,
      resizable: false,
      suppressMovable: true,
      headerClass:
        indexColumn === key
          ? "highlighted-column-index"
          : textColumn === key
          ? "highlighted-column-text"
          : "",
      cellClass:
        indexColumn === key
          ? "highlighted-column-index"
          : textColumn === key
          ? "highlighted-column-text"
          : "",
    }));
  }, [data, columnNames, indexColumn, textColumn]);

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
      const text = row[textColumn];

      if (filename && text) {
        createText({
          datasetId: activeDataset.id,
          filename: String(filename),
          text: String(text),
        });
      }
    });

    onClose(); // Close the dialog after import
  }, [activeDataset, indexColumn, textColumn, data, onClose]);

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
            </div>
            <div
              className="ag-theme-alpine"
              style={{ height: 400, width: "100%" }}
              data-cy="table-grid"
            >
              <AgGridReact
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowData={data}
                suppressColumnMoveAnimation={true}
                suppressDragLeaveHidesColumns={true}
                enableCellTextSelection={true}
                ensureDomOrder={true}
                suppressRowVirtualisation={true}
                suppressColumnVirtualisation={true}
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
      `}</style>
    </Dialog>
  );
};

export default TableView;
