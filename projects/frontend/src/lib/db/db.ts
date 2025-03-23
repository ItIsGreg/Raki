// db.ts
import { TaskMode } from "@/app/constants";
import Dexie, { Table } from "dexie";
import { v4 } from "uuid";

export interface ProfilePointCreate {
  name: string;
  explanation: string;
  synonyms: string[];
  datatype: string;
  valueset: string[] | undefined;
  unit: string | undefined;
  profileId: string;
}

export interface ProfilePoint extends ProfilePointCreate {
  id: string;
}
export interface ProfileCreate {
  name: string;
  description: string;
  mode: TaskMode;
}

export interface Profile extends ProfileCreate {
  id: string;
}

export interface DatasetCreate {
  name: string;
  description: string;
  mode: TaskMode;
}

export interface Dataset extends DatasetCreate {
  id: string;
}

export interface AnnotatedTextCreate {
  textId: string;
  annotatedDatasetId: string;
  verified: boolean | undefined;
  aiFaulty: boolean | undefined; // New field
}

export interface AnnotatedText extends AnnotatedTextCreate {
  id: string;
}

export interface AnnotatedDatasetCreate {
  name: string;
  description: string;
  datasetId: string;
  profileId: string;
  mode: TaskMode;
}

export interface AnnotatedDataset extends AnnotatedDatasetCreate {
  id: string;
}

export interface TextCreate {
  datasetId: string;
  filename: string;
  text: string;
}

export interface Text extends TextCreate {
  id: string;
}

export interface DataPointCreate {
  annotatedTextId: string;
  name: string;
  value: string | number | undefined;
  match: number[] | undefined;
  profilePointId: string | undefined;
  verified: boolean | undefined;
}

export interface DataPoint extends DataPointCreate {
  id: string;
}

export interface ApiKey {
  id: string;
  key: string;
}

export interface Model {
  id: string;
  name: string;
}

export interface LLMProvider {
  id: string;
  provider: string;
}

export interface LLMUrl {
  id: string;
  url: string;
}

export interface BatchSize {
  id: string;
  value: number;
}

export interface MaxTokens {
  id: string;
  value: number | undefined;
}

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  profilePoints!: Table<ProfilePoint>;
  Profiles!: Table<Profile>;
  Datasets!: Table<Dataset>;
  AnnotatedTexts!: Table<AnnotatedText>;
  AnnotatedDatasets!: Table<AnnotatedDataset>;
  Texts!: Table<Text>;
  DataPoints!: Table<DataPoint>;
  ApiKeys!: Table<ApiKey>;
  models!: Table<Model>;
  llmProviders!: Table<LLMProvider>;
  llmUrls!: Table<LLMUrl>;
  batchSizes!: Table<BatchSize>;
  maxTokens!: Table<MaxTokens>;

  constructor() {
    super("myDatabase");
    this.version(8).stores({
      // friends: "++id, name, age", // Primary key and indexed props
      profilePoints: "++id, name, profileId",
      Profiles: "++id, name",
      Datasets: "++id, name",
      AnnotatedTexts: "++id, textId, annotatedDatasetId, aiFaulty",
      AnnotatedDatasets: "++id, datasetId, profileId, name",
      Texts: "++id, datasetId, filename",
      DataPoints: "++id, annotatedTextId, name",
      ApiKeys: "++id, key",
      models: "++id, name",
      llmProviders: "++id, provider",
      llmUrls: "++id, url",
      batchSizes: "++id, value",
      maxTokens: "++id, value",
    });
    
    this.version(9).stores({
      Datasets: "++id, name, mode",
      profilePoints: "++id, name, profileId",
      Profiles: "++id, name, mode",
      AnnotatedTexts: "++id, textId, annotatedDatasetId, aiFaulty",
      AnnotatedDatasets: "++id, datasetId, profileId, name, mode",
      Texts: "++id, datasetId, filename",
      DataPoints: "++id, annotatedTextId, name",
      ApiKeys: "++id, key",
      models: "++id, name",
      llmProviders: "++id, provider",
      llmUrls: "++id, url",
      batchSizes: "++id, value",
      maxTokens: "++id, value",
    }).upgrade(tx => {
      return tx.table("Datasets").toCollection().modify(dataset => {
        if (!dataset.mode) {
          dataset.mode = "datapoint_extraction";
        }
      });
    });

    // Add version 10 to upgrade existing Profiles and AnnotatedDatasets
    this.version(10).stores({
      Profiles: "++id, name, mode",
      AnnotatedDatasets: "++id, datasetId, profileId, name, mode",
    }).upgrade(tx => {
      // Set default mode for existing Profiles
      tx.table("Profiles").toCollection().modify(profile => {
        if (!profile.mode) {
          profile.mode = "datapoint_extraction";
        }
      });
      
      // Set default mode for existing AnnotatedDatasets
      tx.table("AnnotatedDatasets").toCollection().modify(annotatedDataset => {
        if (!annotatedDataset.mode) {
          annotatedDataset.mode = "datapoint_extraction";
        }
      });
    });

    // Add hooks to populate default values
    this.on("populate", async () => {
      // Default batch size
      await this.batchSizes.add({
        id: v4(),
        value: 10,
      });

      // Default API Key
      await this.ApiKeys.add({
        id: v4(),
        key: "default-key",
      });

      // Default LLM URL
      await this.llmUrls.add({
        id: v4(),
        url: "https://default.com",
      });

      // Default max tokens
      await this.maxTokens.add({
        id: v4(),
        value: undefined,
      });
    });
  }
}

export const db = new MySubClassedDexie();
