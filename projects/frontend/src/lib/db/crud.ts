import { v4 as v4 } from "uuid";
import {
  AnnotatedDatasetCreate,
  AnnotatedTextCreate,
  DataPointCreate,
  DatasetCreate,
  ProfileCreate,
  ProfilePointCreate,
  SegmentationProfilePointCreate,
  SegmentDataPointCreate,
  TextCreate,
  Profile,
  Dataset,
  AnnotatedText,
  AnnotatedDataset,
  Text,
  DataPoint,
  SegmentationProfilePoint,
  SegmentDataPoint,
  UserSettings,
  ProfilePoint,
} from "./db";
import { TaskMode } from "@/app/constants";
import { getNextOrderNumber } from "./ordering";
import { getCurrentDatabase } from "./databaseManager";

// The CRUD operations for the ProfilePoint table
export const createProfilePoint = async (profilePoint: ProfilePointCreate) => {
  const id = v4();
  try {
    const profile = await getCurrentDatabase().Profiles.get(profilePoint.profileId);
    if (!profile) {
      console.error('Profile not found for point creation:', profilePoint.profileId);
      throw new Error("Profile not found");
    }
    
    // Get the next order number
    const order = await getNextOrderNumber(profilePoint.profileId, false);
    
    const newProfilePoint = { 
      ...profilePoint, 
      id,
      order,
      previousPointId: null,
      nextPointId: null
    };
    
    await getCurrentDatabase().profilePoints.add(newProfilePoint);
    return newProfilePoint;
  } catch (error) {
    console.error('Failed to create profile point:', error);
    throw new Error(
      "Failed to create profile point: " + (error as Error).message
    );
  }
};

export const readProfilePoint = async (id: string | undefined) => {
  if (!id) {
    return undefined;
  }
  return getCurrentDatabase().profilePoints.get(id);
};

export const readAllProfilePoints = async () => {
  return getCurrentDatabase().profilePoints.toArray();
};

// read all profile points that belong to a specific profile
export const readProfilePointsByProfile = async (
  profileId: string | undefined
) => {
  if (!profileId) {
    return [];
  }
  return getCurrentDatabase().profilePoints.where("profileId").equals(profileId).toArray();
};

export const updateProfilePoint = async (profilePoint: ProfilePoint) => {
  return getCurrentDatabase().profilePoints.put(profilePoint);
};

export const deleteProfilePoint = async (id: string) => {
  const point = await getCurrentDatabase().profilePoints.get(id);
  if (!point) return;

  // Update the previous point's nextPointId
  if (point.previousPointId) {
    const prevPoint = await getCurrentDatabase().profilePoints.get(point.previousPointId);
    if (prevPoint) {
      await getCurrentDatabase().profilePoints.update(prevPoint.id, {
        nextPointId: point.nextPointId,
      });
    }
  }

  // Update the next point's previousPointId
  if (point.nextPointId) {
    const nextPoint = await getCurrentDatabase().profilePoints.get(point.nextPointId);
    if (nextPoint) {
      await getCurrentDatabase().profilePoints.update(nextPoint.id, {
        previousPointId: point.previousPointId,
      });
    }
  }

  return getCurrentDatabase().profilePoints.delete(id);
};

// The CRUD operations for the Profile table
export const createProfile = async (profile: ProfileCreate) => {
  const id = v4();
  const newProfile = { ...profile, id };
  await getCurrentDatabase().Profiles.add(newProfile);
  return newProfile;
};

export const readProfile = async (id: string | undefined) => {
  if (!id) {
    return undefined;
  }
  return getCurrentDatabase().Profiles.get(id);
};

export const readAllProfiles = async () => {
  return getCurrentDatabase().Profiles.toArray();
};

export const updateProfile = async (profile: Profile) => {
  return getCurrentDatabase().Profiles.put(profile);
};

export const deleteProfile = async (id: string) => {
  // delete all profile points that belong to the profile
  const profilePoints = await readProfilePointsByProfile(id);
  profilePoints.forEach((profilePoint) => {
    deleteProfilePoint(profilePoint.id);
  });
  return getCurrentDatabase().Profiles.delete(id);
};

// The CRUD operations for the Dataset table
export const createDataset = async (dataset: DatasetCreate) => {
  const id = v4();
  const newDataset = { ...dataset, id };
  await getCurrentDatabase().Datasets.add(newDataset);
  return newDataset;
};

export const readDataset = async (id: string) => {
  return getCurrentDatabase().Datasets.get(id);
};

export const readAllDatasets = async () => {
  return getCurrentDatabase().Datasets.toArray();
};

export const updateDataset = async (dataset: Dataset) => {
  return getCurrentDatabase().Datasets.put(dataset);
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
  return getCurrentDatabase().Datasets.delete(id);
};

// Read datasets by mode
export const readDatasetsByMode = async (mode: TaskMode): Promise<Dataset[]> => {
  return getCurrentDatabase().Datasets.where("mode").equals(mode).toArray();
};

// Read profiles by mode
export const readProfilesByMode = async (mode: TaskMode): Promise<Profile[]> => {
  return getCurrentDatabase().Profiles.where("mode").equals(mode).toArray();
};

// The CRUD operations for the AnnotatedText table
export const createAnnotatedText = async (
  annotatedText: AnnotatedTextCreate
) => {
  const id = v4();
  const newAnnotatedText = { ...annotatedText, id };
  await getCurrentDatabase().AnnotatedTexts.add(newAnnotatedText);
  return newAnnotatedText;
};

export const readAnnotatedText = async (id: string) => {
  return getCurrentDatabase().AnnotatedTexts.get(id);
};

export const readAllAnnotatedTexts = async () => {
  return getCurrentDatabase().AnnotatedTexts.toArray();
};

// read all annotated texts that belong to a specific annotated dataset
export const readAnnotatedTextsByAnnotatedDataset = async (
  annotatedDatasetId: string | undefined
) => {
  if (!annotatedDatasetId) {
    return [];
  }
  return getCurrentDatabase().AnnotatedTexts.where({ annotatedDatasetId }).toArray();
};

// read all annotated texts that belong to a specific text
export const readAnnotatedTextsByText = async (textId: string) => {
  return getCurrentDatabase().AnnotatedTexts.where({ textId }).toArray();
};

export const updateAnnotatedText = async (annotatedText: AnnotatedText) => {
  return getCurrentDatabase().AnnotatedTexts.put(annotatedText);
};

export const deleteAnnotatedText = async (id: string) => {
  // delete all data points that belong to the annotated text
  const dataPoints = await readDataPointsByAnnotatedText(id);
  dataPoints.forEach((dataPoint) => {
    deleteDataPoint(dataPoint.id);
  });
  return getCurrentDatabase().AnnotatedTexts.delete(id);
};

// The CRUD operations for the AnnotatedDataset table
export const createAnnotatedDataset = async (
  annotatedDataset: AnnotatedDatasetCreate
) => {
  const id = v4();
  const newAnnotatedDataset = { ...annotatedDataset, id };
  await getCurrentDatabase().AnnotatedDatasets.add(newAnnotatedDataset);
  return newAnnotatedDataset;
};

export const readAnnotatedDataset = async (id: string) => {
  return getCurrentDatabase().AnnotatedDatasets.get(id);
};

export const readAllAnnotatedDatasets = async () => {
  return getCurrentDatabase().AnnotatedDatasets.toArray();
};

// read all annotated datasets that belong to a specific dataset
export const readAnnotatedDatasetsByDataset = async (datasetId: string) => {
  return getCurrentDatabase().AnnotatedDatasets.where({ datasetId }).toArray();
};

// Read annotated datasets by mode
export const readAnnotatedDatasetsByMode = async (mode: "text_segmentation" | "datapoint_extraction") => {
  return getCurrentDatabase().AnnotatedDatasets.where("mode").equals(mode).toArray();
};

export const updateAnnotatedDataset = async (
  annotatedDataset: AnnotatedDataset
) => {
  return getCurrentDatabase().AnnotatedDatasets.put(annotatedDataset);
};

export const deleteAnnotatedDataset = async (id: string) => {
  // delete all annotated texts that belong to the annotated dataset
  const annotatedTexts = await readAnnotatedTextsByAnnotatedDataset(id);
  annotatedTexts.forEach((annotatedText) => {
    deleteAnnotatedText(annotatedText.id);
  });
  return getCurrentDatabase().AnnotatedDatasets.delete(id);
};

// The CRUD operations for the Texts table
export const createText = async (text: TextCreate) => {
  const id = v4();
  const newText = { ...text, id };
  await getCurrentDatabase().Texts.add(newText);
  return newText;
};

export const readText = async (id: string) => {
  return getCurrentDatabase().Texts.get(id);
};

export const readAllTexts = async () => {
  return getCurrentDatabase().Texts.toArray();
};

// read texts by id
export const readTextsByIds = async (ids: string[]) => {
  return getCurrentDatabase().Texts.where("id").anyOf(ids).toArray();
};

// read all texts that belong to a specific dataset
export const readTextsByDataset = async (datasetId: string | undefined) => {
  if (!datasetId) {
    return [];
  }
  return getCurrentDatabase().Texts.where({ datasetId }).toArray();
};

export const updateText = async (text: Text) => {
  return getCurrentDatabase().Texts.put(text);
};

export const deleteText = async (id: string) => {
  // delete all annotated texts that belong to the text
  const annotatedTexts = await readAnnotatedTextsByText(id);
  await Promise.all(annotatedTexts.map((annotatedText) => 
    deleteAnnotatedText(annotatedText.id)
  ));
  return getCurrentDatabase().Texts.delete(id);
};

// The CRUD operations for the DataPoint table
export const createDataPoint = async (dataPoint: DataPointCreate) => {
  const id = v4();
  const newDataPoint = { ...dataPoint, id };
  await getCurrentDatabase().DataPoints.add(newDataPoint);
  return newDataPoint;
};

export const readDataPoint = async (id: string | undefined) => {
  if (!id) {
    return undefined;
  }
  return getCurrentDatabase().DataPoints.get(id);
};

export const readAllDataPoints = async () => {
  return getCurrentDatabase().DataPoints.toArray();
};

// read all data points that belong to a specific annotated text
export const readDataPointsByAnnotatedText = async (
  annotatedTextId: string | undefined
) => {
  if (!annotatedTextId) {
    return [];
  }
  return getCurrentDatabase().DataPoints.where({ annotatedTextId }).toArray();
};

export const updateDataPoint = async (dataPoint: DataPoint) => {
  return getCurrentDatabase().DataPoints.put(dataPoint);
};

export const deleteDataPoint = async (id: string) => {
  return getCurrentDatabase().DataPoints.delete(id);
};

// crud operations for api key table

export const createApiKey = async (key: string) => {
  const id = v4();
  return getCurrentDatabase().ApiKeys.add({ id, key });
};

export const readApiKey = async (id: string) => {
  return getCurrentDatabase().ApiKeys.get(id);
};

export const readAllApiKeys = async () => {
  return getCurrentDatabase().ApiKeys.toArray();
};

export const updateApiKey = async (id: string, key: string) => {
  return getCurrentDatabase().ApiKeys.put({ id, key });
};

export const deleteApiKey = async (id: string) => {
  return getCurrentDatabase().ApiKeys.delete(id);
};

export const createModel = async (name: string) => {
  const id = v4();
  return await getCurrentDatabase().models.add({ id, name });
};

export const readAllModels = async () => {
  return await getCurrentDatabase().models.toArray();
};

export const deleteModel = async (id: string) => {
  return await getCurrentDatabase().models.delete(id);
};

export const createLLMProvider = async (provider: string) => {
  const id = v4();
  return await getCurrentDatabase().llmProviders.add({ id, provider });
};

export const readAllLLMProviders = async () => {
  return await getCurrentDatabase().llmProviders.toArray();
};

export const deleteLLMProvider = async (id: string) => {
  return await getCurrentDatabase().llmProviders.delete(id);
};

// LLM URL CRUD operations
export const createLLMUrl = async (url: string) => {
  const id = v4();
  return await getCurrentDatabase().llmUrls.add({ id, url });
};

export const readLLMUrl = async (id: string) => {
  return await getCurrentDatabase().llmUrls.get(id);
};

export const readAllLLMUrls = async () => {
  return await getCurrentDatabase().llmUrls.toArray();
};

export const updateLLMUrl = async (id: string, url: string) => {
  return await getCurrentDatabase().llmUrls.put({ id, url });
};

export const deleteLLMUrl = async (id: string) => {
  return await getCurrentDatabase().llmUrls.delete(id);
};

export interface BatchSize {
  id?: number;
  value: number;
}

// CRUD operations
export const createBatchSize = async (value: number) => {
  const id = v4();
  return await getCurrentDatabase().batchSizes.add({ id, value });
};

export const readAllBatchSizes = async () => {
  return await getCurrentDatabase().batchSizes.toArray();
};

export const deleteAllBatchSizes = async (id: string) => {
  return await getCurrentDatabase().batchSizes.delete(id);
};

// Max Tokens CRUD operations
export const createMaxTokens = async (value: number | undefined) => {
  const id = v4();
  return await getCurrentDatabase().maxTokens.add({ id, value });
};

export const readMaxTokens = async (id: string) => {
  return getCurrentDatabase().maxTokens.get(id);
};

export const readAllMaxTokens = async () => {
  return getCurrentDatabase().maxTokens.toArray();
};

export const updateMaxTokens = async (id: string, value: number | undefined) => {
  return await getCurrentDatabase().maxTokens.put({ id, value });
};

export const deleteMaxTokens = async (id: string) => {
  return await getCurrentDatabase().maxTokens.delete(id);
};

// The CRUD operations for the SegmentationProfilePoint table
export const createSegmentationProfilePoint = async (profilePoint: SegmentationProfilePointCreate) => {
  const id = v4();
  try {
    const profile = await getCurrentDatabase().Profiles.get(profilePoint.profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    // Get the next order number
    const order = await getNextOrderNumber(profilePoint.profileId, true);
    
    const newProfilePoint = { 
      ...profilePoint, 
      id,
      order,
      previousPointId: null,
      nextPointId: null
    };
    
    await getCurrentDatabase().segmentationProfilePoints.add(newProfilePoint);
    return newProfilePoint;
  } catch (error) {
    throw new Error(
      "Failed to create segmentation profile point: " + (error as Error).message
    );
  }
};

export const readSegmentationProfilePoint = async (id: string | undefined) => {
  if (!id) {
    return undefined;
  }
  return getCurrentDatabase().segmentationProfilePoints.get(id);
};

export const readAllSegmentationProfilePoints = async () => {
  return getCurrentDatabase().segmentationProfilePoints.toArray();
};

// read all segmentation profile points that belong to a specific profile
export const readSegmentationProfilePointsByProfile = async (
  profileId: string | undefined
) => {
  if (!profileId) {
    return [];
  }
  return getCurrentDatabase().segmentationProfilePoints.where("profileId").equals(profileId).toArray();
};

export const updateSegmentationProfilePoint = async (profilePoint: SegmentationProfilePoint) => {
  return getCurrentDatabase().segmentationProfilePoints.put(profilePoint);
};

export const deleteSegmentationProfilePoint = async (id: string) => {
  const point = await getCurrentDatabase().segmentationProfilePoints.get(id);
  if (!point) return;

  // Update the previous point's nextPointId
  if (point.previousPointId) {
    const prevPoint = await getCurrentDatabase().segmentationProfilePoints.get(point.previousPointId);
    if (prevPoint) {
      await getCurrentDatabase().segmentationProfilePoints.update(prevPoint.id, {
        nextPointId: point.nextPointId,
      });
    }
  }

  // Update the next point's previousPointId
  if (point.nextPointId) {
    const nextPoint = await getCurrentDatabase().segmentationProfilePoints.get(point.nextPointId);
    if (nextPoint) {
      await getCurrentDatabase().segmentationProfilePoints.update(nextPoint.id, {
        previousPointId: point.previousPointId,
      });
    }
  }

  return getCurrentDatabase().segmentationProfilePoints.delete(id);
};

// The CRUD operations for the SegmentDataPoint table
export const createSegmentDataPoint = async (segmentDataPoint: SegmentDataPointCreate) => {
  const id = v4();
  const newSegmentDataPoint = { ...segmentDataPoint, id };
  await getCurrentDatabase().SegmentDataPoints.add(newSegmentDataPoint);
  return newSegmentDataPoint;
};

export const readSegmentDataPoint = async (id: string | undefined) => {
  if (!id) {
    return undefined;
  }
  return getCurrentDatabase().SegmentDataPoints.get(id);
};

export const readAllSegmentDataPoints = async () => {
  return getCurrentDatabase().SegmentDataPoints.toArray();
};

// read all segment data points that belong to a specific annotated text
export const readSegmentDataPointsByAnnotatedText = async (
  annotatedTextId: string | undefined
) => {
  if (!annotatedTextId) {
    return [];
  }
  return getCurrentDatabase().SegmentDataPoints.where({ annotatedTextId }).toArray();
};

export const updateSegmentDataPoint = async (segmentDataPoint: SegmentDataPoint) => {
  return getCurrentDatabase().SegmentDataPoints.put(segmentDataPoint);
};

export const deleteSegmentDataPoint = async (id: string) => {
  return getCurrentDatabase().SegmentDataPoints.delete(id);
};

// User Settings CRUD operations
export const getUserSettings = async () => {
  const settings = await getCurrentDatabase().userSettings.toArray();
  return settings[0] || null;
};

export const createUserSettings = async (settings: Partial<UserSettings>) => {
  const id = v4();
  const newSettings = { id, tutorialCompleted: false, ...settings };
  await getCurrentDatabase().userSettings.add(newSettings);
  return newSettings;
};

export const updateUserSettings = async (settings: Partial<UserSettings>) => {
  const existingSettings = await getUserSettings();
  if (!existingSettings) {
    return createUserSettings(settings);
  }
  await getCurrentDatabase().userSettings.update(existingSettings.id, settings);
  return { ...existingSettings, ...settings };
};
