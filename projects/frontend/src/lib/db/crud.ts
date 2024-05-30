import { db } from "./db";
import {
  ProfilePoint,
  Profile,
  Dataset,
  AnnotatedText,
  AnnotatedDataset,
  Texts,
  DataPoint,
} from "./db";

// The CRUD operations for the ProfilePoint table
export const createProfilePoint = async (profilePoint: ProfilePoint) => {
  return db.profilePoints.add(profilePoint);
};

export const readProfilePoint = async (id: number) => {
  return db.profilePoints.get(id);
};

export const readAllProfilePoints = async () => {
  return db.profilePoints.toArray();
};

// read all profile points that belong to a specific profile
export const readProfilePointsByProfile = async (profileId: number) => {
  return db.profilePoints.where({ profileId }).toArray();
};

export const updateProfilePoint = async (profilePoint: ProfilePoint) => {
  return db.profilePoints.put(profilePoint);
};

export const deleteProfilePoint = async (id: number) => {
  return db.profilePoints.delete(id);
};

// The CRUD operations for the Profile table
export const createProfile = async (profile: Profile) => {
  return db.Profiles.add(profile);
};

export const readProfile = async (id: number) => {
  return db.Profiles.get(id);
};

export const readAllProfiles = async () => {
  return db.Profiles.toArray();
};

export const updateProfile = async (profile: Profile) => {
  return db.Profiles.put(profile);
};

export const deleteProfile = async (id: number) => {
  return db.Profiles.delete(id);
};

// The CRUD operations for the Dataset table
export const createDataset = async (dataset: Dataset) => {
  return db.Datasets.add(dataset);
};

export const readDataset = async (id: number) => {
  return db.Datasets.get(id);
};

export const readAllDatasets = async () => {
  return db.Datasets.toArray();
};

export const updateDataset = async (dataset: Dataset) => {
  return db.Datasets.put(dataset);
};

export const deleteDataset = async (id: number) => {
  return db.Datasets.delete(id);
};

// The CRUD operations for the AnnotatedText table
export const createAnnotatedText = async (annotatedText: AnnotatedText) => {
  return db.AnnotatedTexts.add(annotatedText);
};

export const readAnnotatedText = async (id: number) => {
  return db.AnnotatedTexts.get(id);
};

export const readAllAnnotatedTexts = async () => {
  return db.AnnotatedTexts.toArray();
};

// read all annotated texts that belong to a specific annotated dataset
export const readAnnotatedTextsByAnnotatedDataset = async (
  annotatedDatasetId: number
) => {
  return db.AnnotatedTexts.where({ annotatedDatasetId }).toArray();
};

// read all annotated texts that belong to a specific text
export const readAnnotatedTextsByText = async (textId: number) => {
  return db.AnnotatedTexts.where({ textId }).toArray();
};

export const updateAnnotatedText = async (annotatedText: AnnotatedText) => {
  return db.AnnotatedTexts.put(annotatedText);
};

export const deleteAnnotatedText = async (id: number) => {
  return db.AnnotatedTexts.delete(id);
};

// The CRUD operations for the AnnotatedDataset table
export const createAnnotatedDataset = async (
  annotatedDataset: AnnotatedDataset
) => {
  return db.AnnotatedDatasets.add(annotatedDataset);
};

export const readAnnotatedDataset = async (id: number) => {
  return db.AnnotatedDatasets.get(id);
};

export const readAllAnnotatedDatasets = async () => {
  return db.AnnotatedDatasets.toArray();
};

// read all annotated datasets that belong to a specific dataset
export const readAnnotatedDatasetsByDataset = async (datasetId: number) => {
  return db.AnnotatedDatasets.where({ datasetId }).toArray();
};

export const updateAnnotatedDataset = async (
  annotatedDataset: AnnotatedDataset
) => {
  return db.AnnotatedDatasets.put(annotatedDataset);
};

export const deleteAnnotatedDataset = async (id: number) => {
  return db.AnnotatedDatasets.delete(id);
};

// The CRUD operations for the Texts table
export const createText = async (text: Texts) => {
  return db.Texts.add(text);
};

export const readText = async (id: number) => {
  return db.Texts.get(id);
};

export const readAllTexts = async () => {
  return db.Texts.toArray();
};

// read all texts that belong to a specific dataset
export const readTextsByDataset = async (datasetId: number) => {
  return db.Texts.where({ datasetId }).toArray();
};

export const updateText = async (text: Texts) => {
  return db.Texts.put(text);
};

export const deleteText = async (id: number) => {
  return db.Texts.delete(id);
};

// The CRUD operations for the DataPoint table
export const createDataPoint = async (dataPoint: DataPoint) => {
  return db.DataPoints.add(dataPoint);
};

export const readDataPoint = async (id: number) => {
  return db.DataPoints.get(id);
};

export const readAllDataPoints = async () => {
  return db.DataPoints.toArray();
};

// read all data points that belong to a specific annotated text
export const readDataPointsByAnnotatedText = async (
  annotatedTextId: number
) => {
  return db.DataPoints.where({ annotatedTextId }).toArray();
};

export const updateDataPoint = async (dataPoint: DataPoint) => {
  return db.DataPoints.put(dataPoint);
};

export const deleteDataPoint = async (id: number) => {
  return db.DataPoints.delete(id);
};
