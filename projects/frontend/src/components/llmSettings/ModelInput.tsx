import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { createModel, deleteModel, readAllModels } from "@/lib/db/crud";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const ModelInput = () => {
  const [newModel, setNewModel] = useState<string>("");
  const dbModels = useLiveQuery(() => readAllModels());

  const getPlaceholder = () => {
    if (dbModels && dbModels.length > 0 && dbModels[0].name) {
      return dbModels[0].name;
    }
    return "Add Model Name";
  };

  const handleSetModel = () => {
    // remove old model
    if (dbModels && dbModels.length > 0) {
      dbModels.forEach((model) => {
        deleteModel(model.id);
      });
    }
    createModel(newModel);
    setNewModel("");
  };

  return (
    <div className="flex flex-col items-start">
      <h4 className="text-sm font-semibold mb-1">Model Name</h4>
      <div className="flex flex-row gap-2">
        <Input
          placeholder={getPlaceholder()}
          value={newModel}
          onChange={(e) => setNewModel(e.target.value)}
          data-cy="model-input"
        />
        <Button onClick={handleSetModel} data-cy="model-set-button">
          Set
        </Button>
      </div>
    </div>
  );
};
