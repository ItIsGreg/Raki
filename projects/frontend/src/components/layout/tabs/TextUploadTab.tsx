"use client";

import { TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import EntityForm from "@/components/shared/EntityForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TextList from "@/components/datasets/TextList";
import { TextUploadTabProps } from "@/types/annotation";
import { Dataset } from "@/lib/db/db";

export function TextUploadTab({
  state,
  handlers,
  datasets,
}: TextUploadTabProps) {
  return (
    <TabsContent
      value="text-upload"
      className="flex-1 min-h-0 mt-0 overflow-hidden"
    >
      <div className="h-full overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-4">
            <Select
              value={state.activeDataset?.id}
              onValueChange={(value) => {
                const dataset = datasets?.find((d) => d.id === value);
                handlers.setActiveDataset(dataset);
              }}
              data-cy="text-dataset-select"
            >
              <SelectTrigger
                className="w-full"
                data-cy="text-dataset-select-trigger"
              >
                <SelectValue placeholder="Select a text set" />
              </SelectTrigger>
              <SelectContent data-cy="text-dataset-select-content">
                {datasets?.map((dataset) => (
                  <SelectItem
                    key={dataset.id}
                    value={dataset.id}
                    data-cy={`text-dataset-option-${dataset.id}`}
                  >
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => handlers.setAddingDataset(true)}
              className="w-full"
              data-cy="add-dataset-button"
            >
              New Text Set
            </Button>
          </div>
          {state.activeDataset && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlers.setShowDeleteDialog(true)}
              data-cy="delete-dataset-button"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <AlertDialog
            open={state.showDeleteDialog}
            onOpenChange={handlers.setShowDeleteDialog}
            data-cy="delete-dataset-dialog"
          >
            <AlertDialogContent data-cy="delete-dataset-dialog-content">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  dataset and all associated texts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-cy="delete-dataset-cancel">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handlers.handleDeleteDataset}
                  className="bg-red-600 hover:bg-red-700"
                  data-cy="delete-dataset-confirm"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {state.addingDataset && (
            <EntityForm<Dataset>
              onCancel={handlers.handleCancelAddDataset}
              onSave={handlers.handleSaveDataset}
              entityType="Dataset"
              data-cy="new-dataset-form"
            />
          )}
          <TextList
            activeText={state.activeText}
            activeDataset={state.activeDataset}
            setActiveText={handlers.setActiveText}
            data-cy="text-list"
          />
        </div>
      </div>
    </TabsContent>
  );
}
