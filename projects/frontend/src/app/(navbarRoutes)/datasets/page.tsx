"use client";

import { useState } from "react";
import DatasetList from "./DatasetList";
import TextDisplay from "./TextDisplay";
import TextList from "./TextList";
import { Dataset, Text } from "@/lib/db/db";

const Datasets = () => {
  const [activeDataset, setActiveDataset] = useState<Dataset | undefined>(
    undefined
  );
  const [activeText, setActiveText] = useState<Text | undefined>(undefined);

  return (
    <div className="grid grid-cols-3 gap-4">
      <DatasetList
        activeDataset={activeDataset}
        setActiveDataset={setActiveDataset}
      />
      <TextList
        activeText={activeText}
        activeDataset={activeDataset}
        setActiveText={setActiveText}
      />
      <TextDisplay activeText={activeText} />
    </div>
  );
};

export default Datasets;
