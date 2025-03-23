"use client";

import { useState } from "react";
import DatasetList from "@/components/datasets/DatasetList";
import TextDisplay from "@/components/datasets/TextDisplay";
import TextList from "@/components/datasets/TextList";
import { Dataset, Text } from "@/lib/db/db";
import { TASK_MODE } from "@/app/constants";

const Datasets = () => {
  const [activeDataset, setActiveDataset] = useState<Dataset | undefined>(
    undefined
  );
  const [activeText, setActiveText] = useState<Text | undefined>(undefined);

  return (
    <div className="grid grid-cols-3 gap-4 h-full" data-cy="datasets-page">
      <DatasetList
        activeDataset={activeDataset}
        setActiveDataset={setActiveDataset}
        data-cy="dataset-list"
        mode={TASK_MODE.DATAPOINT_EXTRACTION}
      />
      <TextList
        activeText={activeText}
        activeDataset={activeDataset}
        setActiveText={setActiveText}
        data-cy="text-list"
      />
      <TextDisplay activeText={activeText} data-cy="text-display" />
    </div>
  );
};

export default Datasets;
