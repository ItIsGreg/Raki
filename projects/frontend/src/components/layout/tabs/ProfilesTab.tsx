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
import { TiUpload, TiDownloadOutline } from "react-icons/ti";
import { AddButton } from "@/components/shared/AddButton";
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
import ProfileDataPointList from "@/components/profiles/DataPointList";
import { ProfilesTabProps, BaseProfilePoint } from "@/types/annotation";
import { Profile } from "@/lib/db/db";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export function ProfilesTab<TProfilePoint extends BaseProfilePoint>({
  state,
  handlers,
  configuration,
  profiles,
  fileInputRef,
}: ProfilesTabProps<TProfilePoint>) {
  return (
    <TabsContent
      value="profiles"
      className="flex-1 min-h-0 mt-0 overflow-hidden"
    >
      <div className="h-full overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex gap-4 items-center">
            <Select
              value={state.activeProfile?.id}
              onValueChange={(value) => {
                const profile = profiles?.find((p) => p.id === value);
                handlers.setActiveProfile(profile);
              }}
              data-cy="profile-select"
            >
              <SelectTrigger
                className="w-full"
                data-cy="profile-select-trigger"
              >
                <SelectValue placeholder="Select a profile" />
              </SelectTrigger>
              <SelectContent data-cy="profile-select-content">
                {profiles?.map((profile) => (
                  <SelectItem
                    key={profile.id}
                    value={profile.id}
                    data-cy={`profile-option-${profile.id}`}
                  >
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlers.handleUploadButtonClick}
              data-cy="upload-profile-button"
              title="Upload Profile"
            >
              <TiUpload className="h-4 w-4" />
            </Button>
            <AddButton
              onClick={() => handlers.setAddingProfile(true)}
              label="Profile"
              data-cy="add-profile-button"
            />
            {state.activeProfile && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlers.handleDownloadProfile}
                  data-cy="download-profile-button"
                  title="Download Profile"
                >
                  <TiDownloadOutline className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlers.setShowDeleteProfileDialog(true)}
                  data-cy="delete-profile-button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handlers.handleUploadProfile}
              data-cy="upload-profile-input"
            />
          </div>
          <AlertDialog
            open={state.showDeleteProfileDialog}
            onOpenChange={handlers.setShowDeleteProfileDialog}
            data-cy="delete-profile-dialog"
          >
            <AlertDialogContent data-cy="delete-profile-dialog-content">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  profile and all associated data points.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-cy="delete-profile-cancel">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handlers.handleDeleteProfile}
                  className="bg-red-600 hover:bg-red-700"
                  data-cy="delete-profile-confirm"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {state.addingProfile && (
            <EntityForm<Profile>
              onCancel={handlers.handleCancelAddProfile}
              onSave={handlers.handleSaveProfile}
              entityType="Profile"
              data-cy="new-profile-form"
            />
          )}
          <PanelGroup direction="horizontal">
            <Panel defaultSize={60} minSize={30}>
              <div
                className="overflow-y-auto h-full"
                data-cy="datapoint-editor-container"
              >
                <configuration.components.DataPointEditor
                  data-cy="profile-datapoint-editor"
                  activeProfile={state.activeProfile}
                  activeDataPoint={
                    state.activeDataPoint as TProfilePoint | undefined
                  }
                  setActiveDataPoint={handlers.setActiveDataPoint}
                  creatingNewDataPoint={state.creatingNewDataPoint}
                  setCreatingNewDataPoint={handlers.setCreatingNewDataPoint}
                />
              </div>
            </Panel>
            <PanelResizeHandle className="w-2 bg-border hover:bg-border/80 transition-colors flex items-center justify-center group">
              <div className="w-1 h-8 bg-border/50 rounded-full group-hover:bg-border transition-colors" />
            </PanelResizeHandle>
            <Panel defaultSize={40} minSize={30}>
              <div
                className="overflow-y-auto h-full"
                data-cy="profile-datapoint-list-container"
              >
                <ProfileDataPointList
                  data-cy="profile-datapoint-list"
                  activeProfile={state.activeProfile}
                  activeDataPoint={state.activeDataPoint}
                  setActiveDataPoint={handlers.setActiveDataPoint}
                  setCreatingNewDataPoint={handlers.setCreatingNewDataPoint}
                  readPointsByProfile={
                    configuration.crudOperations.readProfilePoints
                  }
                  createPoint={(point) =>
                    configuration.crudOperations.createProfilePoint(
                      point as any
                    )
                  }
                />
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </TabsContent>
  );
}
