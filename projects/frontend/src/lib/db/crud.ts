import { v4 as v4 } from "uuid";
import {
  AnnotatedDatasetCreate,
  AnnotatedTextCreate,
  DataPointCreate,
  DatasetCreate,
  ProfileCreate,
  ProfilePointCreate,
  TextCreate,
  db,
} from "./db";
import {
  ProfilePoint,
  Profile,
  Dataset,
  AnnotatedText,
  AnnotatedDataset,
  Text,
  DataPoint,
} from "./db";

// The CRUD operations for the ProfilePoint table
export const createProfilePoint = async (profilePoint: ProfilePointCreate) => {
  const id = v4();
  try {
    const profile = await db.Profiles.get(profilePoint.profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }
    const newProfilePoint = { ...profilePoint, id };
    await db.profilePoints.add(newProfilePoint);
    return newProfilePoint;
  } catch (error) {
    throw new Error(
      "Failed to create profile point: " + (error as Error).message
    );
  }
};

export const readProfilePoint = async (id: string | undefined) => {
  if (!id) {
    return undefined;
  }
  return db.profilePoints.get(id);
};

export const readAllProfilePoints = async () => {
  return db.profilePoints.toArray();
};

// read all profile points that belong to a specific profile
export const readProfilePointsByProfile = async (
  profileId: string | undefined
) => {
  if (!profileId) {
    return [];
  }
  return db.profilePoints.where("profileId").equals(profileId).toArray();
};

export const updateProfilePoint = async (profilePoint: ProfilePoint) => {
  return db.profilePoints.put(profilePoint);
};

export const deleteProfilePoint = async (id: string) => {
  return db.profilePoints.delete(id);
};

// The CRUD operations for the Profile table
export const createProfile = async (profile: ProfileCreate) => {
  const id = v4();
  const newProfile = { ...profile, id };
  await db.Profiles.add(newProfile);
  return newProfile;
};

export const readProfile = async (id: string | undefined) => {
  if (!id) {
    return undefined;
  }
  return db.Profiles.get(id);
};

export const readAllProfiles = async () => {
  return db.Profiles.toArray();
};

export const updateProfile = async (profile: Profile) => {
  return db.Profiles.put(profile);
};

export const deleteProfile = async (id: string) => {
  // delete all profile points that belong to the profile
  const profilePoints = await readProfilePointsByProfile(id);
  profilePoints.forEach((profilePoint) => {
    deleteProfilePoint(profilePoint.id);
  });
  return db.Profiles.delete(id);
};

// The CRUD operations for the Dataset table
export const createDataset = async (dataset: DatasetCreate) => {
  const id = v4();
  const newDataset = { ...dataset, id };
  await db.Datasets.add(newDataset);
  return newDataset;
};

export const readDataset = async (id: string) => {
  return db.Datasets.get(id);
};

export const readAllDatasets = async () => {
  return db.Datasets.toArray();
};

export const updateDataset = async (dataset: Dataset) => {
  return db.Datasets.put(dataset);
};

export const deleteDataset = async (id: string) => {
  // delete all annotated datasets that belong to the dataset
  const annotatedDatasets = await readAnnotatedDatasetsByDataset(id);
  annotatedDatasets.forEach((annotatedDataset) => {
    deleteAnnotatedDataset(annotatedDataset.id);
  });
  // delete all texts that belong to the dataset
  const texts = await readTextsByDataset(id);
  texts.forEach((text) => {
    deleteText(text.id);
  });
  return db.Datasets.delete(id);
};

// The CRUD operations for the AnnotatedText table
export const createAnnotatedText = async (
  annotatedText: AnnotatedTextCreate
) => {
  const id = v4();
  const newAnnotatedText = { ...annotatedText, id };
  await db.AnnotatedTexts.add(newAnnotatedText);
  return newAnnotatedText;
};

export const readAnnotatedText = async (id: string) => {
  return db.AnnotatedTexts.get(id);
};

export const readAllAnnotatedTexts = async () => {
  return db.AnnotatedTexts.toArray();
};

// read all annotated texts that belong to a specific annotated dataset
export const readAnnotatedTextsByAnnotatedDataset = async (
  annotatedDatasetId: string | undefined
) => {
  if (!annotatedDatasetId) {
    return [];
  }
  return db.AnnotatedTexts.where({ annotatedDatasetId }).toArray();
};

// read all annotated texts that belong to a specific text
export const readAnnotatedTextsByText = async (textId: string) => {
  return db.AnnotatedTexts.where({ textId }).toArray();
};

export const updateAnnotatedText = async (annotatedText: AnnotatedText) => {
  return db.AnnotatedTexts.put(annotatedText);
};

export const deleteAnnotatedText = async (id: string) => {
  // delete all data points that belong to the annotated text
  const dataPoints = await readDataPointsByAnnotatedText(id);
  dataPoints.forEach((dataPoint) => {
    deleteDataPoint(dataPoint.id);
  });
  return db.AnnotatedTexts.delete(id);
};

// The CRUD operations for the AnnotatedDataset table
export const createAnnotatedDataset = async (
  annotatedDataset: AnnotatedDatasetCreate
) => {
  const id = v4();
  const newAnnotatedDataset = { ...annotatedDataset, id };
  await db.AnnotatedDatasets.add(newAnnotatedDataset);
  return newAnnotatedDataset;
};

export const readAnnotatedDataset = async (id: string) => {
  return db.AnnotatedDatasets.get(id);
};

export const readAllAnnotatedDatasets = async () => {
  return db.AnnotatedDatasets.toArray();
};

// read all annotated datasets that belong to a specific dataset
export const readAnnotatedDatasetsByDataset = async (datasetId: string) => {
  return db.AnnotatedDatasets.where({ datasetId }).toArray();
};

export const updateAnnotatedDataset = async (
  annotatedDataset: AnnotatedDataset
) => {
  return db.AnnotatedDatasets.put(annotatedDataset);
};

export const deleteAnnotatedDataset = async (id: string) => {
  // delete all annotated texts that belong to the annotated dataset
  const annotatedTexts = await readAnnotatedTextsByAnnotatedDataset(id);
  annotatedTexts.forEach((annotatedText) => {
    deleteAnnotatedText(annotatedText.id);
  });
  return db.AnnotatedDatasets.delete(id);
};

// The CRUD operations for the Texts table
export const createText = async (text: TextCreate) => {
  const id = v4();
  const newText = { ...text, id };
  await db.Texts.add(newText);
  return newText;
};

export const readText = async (id: string) => {
  return db.Texts.get(id);
};

export const readAllTexts = async () => {
  return db.Texts.toArray();
};

// read texts by id
export const readTextsByIds = async (ids: string[]) => {
  return db.Texts.where("id").anyOf(ids).toArray();
};

// read all texts that belong to a specific dataset
export const readTextsByDataset = async (datasetId: string | undefined) => {
  if (!datasetId) {
    return [];
  }
  return db.Texts.where({ datasetId }).toArray();
};

export const updateText = async (text: Text) => {
  return db.Texts.put(text);
};

export const deleteText = async (id: string) => {
  // delete all annotated texts that belong to the text
  const annotatedTexts = await readAnnotatedTextsByText(id);
  annotatedTexts.forEach((annotatedText) => {
    deleteAnnotatedText(annotatedText.id);
  });
  return db.Texts.delete(id);
};

// The CRUD operations for the DataPoint table
export const createDataPoint = async (dataPoint: DataPointCreate) => {
  const id = v4();
  const newDataPoint = { ...dataPoint, id };
  await db.DataPoints.add(newDataPoint);
  return newDataPoint;
};

export const readDataPoint = async (id: string | undefined) => {
  if (!id) {
    return undefined;
  }
  return db.DataPoints.get(id);
};

export const readAllDataPoints = async () => {
  return db.DataPoints.toArray();
};

// read all data points that belong to a specific annotated text
export const readDataPointsByAnnotatedText = async (
  annotatedTextId: string | undefined
) => {
  if (!annotatedTextId) {
    return [];
  }
  return db.DataPoints.where({ annotatedTextId }).toArray();
};

export const updateDataPoint = async (dataPoint: DataPoint) => {
  return db.DataPoints.put(dataPoint);
};

export const deleteDataPoint = async (id: string) => {
  return db.DataPoints.delete(id);
};

// crud operations for api key table

export const createApiKey = async (key: string) => {
  const id = v4();
  return db.ApiKeys.add({ id, key });
};

export const readApiKey = async (id: string) => {
  return db.ApiKeys.get(id);
};

export const readAllApiKeys = async () => {
  return db.ApiKeys.toArray();
};

export const updateApiKey = async (id: string, key: string) => {
  return db.ApiKeys.put({ id, key });
};

export const deleteApiKey = async (id: string) => {
  return db.ApiKeys.delete(id);
};

export const createModel = async (name: string) => {
  const id = v4();
  return await db.models.add({ id, name });
};

export const readAllModels = async () => {
  return await db.models.toArray();
};

export const deleteModel = async (id: string) => {
  return await db.models.delete(id);
};

export const createLLMProvider = async (provider: string) => {
  const id = v4();
  return await db.llmProviders.add({ id, provider });
};

export const readAllLLMProviders = async () => {
  return await db.llmProviders.toArray();
};

export const deleteLLMProvider = async (id: string) => {
  return await db.llmProviders.delete(id);
};
