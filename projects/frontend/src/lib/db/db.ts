// db.ts
import Dexie, { Table } from "dexie";

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
}

export interface Profile extends ProfileCreate {
  id: string;
}

export interface DatasetCreate {
  name: string;
  description: string;
}

export interface Dataset extends DatasetCreate {
  id: string;
}

export interface AnnotatedTextCreate {
  textId: string;
  annotatedDatasetId: string;
}

export interface AnnotatedText extends AnnotatedTextCreate {
  id: string;
}

export interface AnnotatedDatasetCreate {
  name: string;
  description: string;
  datasetId: string;
  profileId: string;
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
}

export interface DataPoint extends DataPointCreate {
  id: string;
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

  constructor() {
    super("myDatabase");
    this.version(1).stores({
      // friends: "++id, name, age", // Primary key and indexed props
      profilePoints: "++id, name, profileId",
      Profiles: "++id, name",
      Datasets: "++id, name",
      AnnotatedTexts: "++id, textId, annotatedDatasetId",
      AnnotatedDatasets: "++id, datasetId, profileId, name",
      Texts: "++id, datasetId, filename",
      DataPoints: "++id, annotatedTextId, name",
    });
  }
}

export const db = new MySubClassedDexie();
