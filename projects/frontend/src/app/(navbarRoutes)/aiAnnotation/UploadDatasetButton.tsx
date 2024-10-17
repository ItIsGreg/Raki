import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { handleUploadAnnotatedDataset } from "./annotationUtils";

export const UploadDatasetButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadButtonClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await handleUploadAnnotatedDataset(file);
      // You might want to refresh the list of annotated datasets here
    } catch (error) {
      console.error("Error uploading annotated dataset:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <>
      <Button onClick={handleUploadButtonClick}>Upload Dataset</Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileUpload}
      />
    </>
  );
};
