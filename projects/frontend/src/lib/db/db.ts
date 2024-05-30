// db.ts
import Dexie, { Table } from "dexie";

export interface ProfilePoint {
  id: number;
  name: string;
  explanation: string;
  synonyms: string[];
  valueset: string[] | undefined;
  dimension: string;
  unit: string | undefined;
  profileId: number;
}

export interface Profile {
  id: number;
  name: string;
}

export interface Dataset {
  id: number;
  name: string | undefined;
}

export interface AnnotatedText {
  id: number;
  textId: number;
  annotatedDatasetId: number;
}

export interface AnnotatedDataset {
  id: number;
  datasetId: number;
}

export interface Texts {
  id: number;
  datasetId: number;
  filename: string | undefined;
  text: string;
}

export interface DataPoint {
  id: number;
  annotatedTextId: number;
  name: string;
}

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  profilePoints!: Table<ProfilePoint>;
  Profiles!: Table<Profile>;
  Datasets!: Table<Dataset>;
  AnnotatedTexts!: Table<AnnotatedText>;
  AnnotatedDatasets!: Table<AnnotatedDataset>;
  Texts!: Table<Texts>;
  DataPoints!: Table<DataPoint>;

  constructor() {
    super("myDatabase");
    this.version(1).stores({
      // friends: "++id, name, age", // Primary key and indexed props
      profilePoints: "++id, name, profileId",
      Profiles: "++id, name",
      Datasets: "++id, name",
      AnnotatedTexts: "++id, textId, annotatedDatasetId",
      AnnotatedDatasets: "++id, datasetId",
      Texts: "++id, datasetId, filename",
      DataPoints: "++id, annotatedTextId, name",
    });
  }
}

export const db = new MySubClassedDexie();
