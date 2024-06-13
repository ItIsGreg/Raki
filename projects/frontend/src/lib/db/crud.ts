import { v4 as uuidv4, v4 } from "uuid";
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
    if (profile) {
      return db.profilePoints.add({ ...profilePoint, id });
    } else {
      throw new Error("Profile not found");
    }
  } catch (error) {
    throw new Error("Profile not found");
  }
};

export const readProfilePoint = async (id: string) => {
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
  return db.Profiles.add({ ...profile, id });
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
  return db.Datasets.add({ ...dataset, id });
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
  db.AnnotatedTexts.add({ ...annotatedText, id });
  return id;
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
  return db.AnnotatedDatasets.add({ ...annotatedDataset, id });
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
  return db.Texts.add({ ...text, id });
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
  return db.DataPoints.add({ ...dataPoint, id });
};

export const readDataPoint = async (id: string) => {
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
