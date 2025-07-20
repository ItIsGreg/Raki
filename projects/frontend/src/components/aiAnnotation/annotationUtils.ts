import { backendURL } from "../../app/constants";
import {
  ProfilePoint,
  Text,
  AnnotatedDataset,
  AnnotatedText,
} from "@/lib/db/db";
import { ReqProfilePoint, ResDataPoint } from "../../app/types";
import {
  readProfilePointsByProfile,
  createAnnotatedDataset,
  createAnnotatedText,
  createDataset,
  createProfile,
  createProfilePoint,
  createText,
  createDataPoint,
  updateDataPoint,
  updateAnnotatedText,
} from "@/lib/db/crud";
import { db } from "@/lib/db/db";

interface LLMConfig {
  provider: string;
  model: string;
  url: string;
  apiKey: string;
  maxTokens: number | undefined;
}

const updateExistingAndCreateNewDataPoints = async (
  data: ResDataPoint[],
  annotatedTextId: string,
  activeProfilePoints: ProfilePoint[],
  aiFaulty: boolean
) => {
  let newDataPoints = aiFaulty
    ? []
    : data.map((dataPoint) => ({
        name: dataPoint.name,
        value: dataPoint.value,
        match: dataPoint.match,
        annotatedTextId: annotatedTextId,
        profilePointId: activeProfilePoints.find(
          (profilePoint) => profilePoint.name === dataPoint.name
        )?.id,
        verified: undefined,
      }));

  // find existing data points
  const existingDataPoints = await db.DataPoints.where({
    annotatedTextId: annotatedTextId,
  }).toArray();

  // update existing data points
  await Promise.all(
    existingDataPoints.map((dataPoint) => {
      const newDataPoint = newDataPoints.find(
        (newDataPoint) => newDataPoint.name === dataPoint.name
      );
      if (newDataPoint) {
        return updateDataPoint({ ...newDataPoint, id: dataPoint.id });
      }
      return dataPoint;
    })
  );

  // for all new data points, that are not in existingDataPoints, create them
  const newDataPointsToCreate = newDataPoints.filter(
    (newDataPoint) =>
      !existingDataPoints.find(
        (existingDataPoint) => existingDataPoint.name === newDataPoint.name
      )
  );
  await Promise.all(
    newDataPointsToCreate.map((dataPoint) => createDataPoint(dataPoint))
  );
};

export const reannotateFaultyText = async (
  annotatedFaultyText: AnnotatedText,
  activeProfilePoints: ProfilePoint[],
  llmProvider: string,
  llmModel: string,
  llmUrl: string,
  apiKey: string,
  maxTokens: number | undefined
) => {
  try {
    const text = await db.Texts.get(annotatedFaultyText.textId);
    if (!text) {
      throw new Error("Text not found");
    }

    const { data, aiFaulty } = await callAnnotationAPI(
      text,
      activeProfilePoints,
      { provider: llmProvider, model: llmModel, url: llmUrl, apiKey: apiKey, maxTokens: maxTokens }
    );

    await updateExistingAndCreateNewDataPoints(
      data,
      annotatedFaultyText.id,
      activeProfilePoints,
      aiFaulty
    );

    await updateAnnotatedText({ ...annotatedFaultyText, aiFaulty: aiFaulty });

    return { success: true, aiFaulty };
  } catch (error) {
    console.error("Error in reannotateFaultyText:", error);
    return { success: false, error };
  }
};

export const annotateText = async (
  text: Text,
  activeAnnotatedDataset: { id: string },
  activeProfilePoints: ProfilePoint[],
  llmProvider: string,
  llmModel: string,
  llmUrl: string,
  apiKey: string,
  maxTokens: number | undefined
) => {
  const { data, aiFaulty } = await callAnnotationAPI(
    text,
    activeProfilePoints,
    { provider: llmProvider, model: llmModel, url: llmUrl, apiKey: apiKey, maxTokens: maxTokens }
  );

  try {
    const annotatedText = await createAnnotatedText({
      annotatedDatasetId: activeAnnotatedDataset.id,
      textId: text.id,
      verified: undefined,
      aiFaulty: aiFaulty,
    });

    await createDataPointsForAnnotatedText(
      data,
      annotatedText.id,
      activeProfilePoints,
      aiFaulty
    );
  } catch (error) {
    console.error("Error creating annotated text or data points:", error);
    throw error;
  }
};

async function callAnnotationAPI(
  text: Text,
  activeProfilePoints: ProfilePoint[],
  config: LLMConfig
) {
  try {
    // Get the profile to access its example
    const profileId = activeProfilePoints[0]?.profileId;
    const profile = await db.Profiles.get(profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const body = {
      llm_provider: config.provider,
      model: config.model,
      llm_url: config.url,
      api_key: config.apiKey,
      text: text.text,
      datapoints: getReqProfilePoints(activeProfilePoints),
      max_tokens: config.maxTokens || undefined,
      example: profile.example || undefined,
    };

    const request = {
      method: "POST",
      mode: "cors" as const,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };

    const response = await fetch(`${backendURL}/datapoint-extraction/pipeline/pipeline`, request);
    if (!response.ok) {
      return { data: [], aiFaulty: true };
    }
    const data = await response.json();
    return { data, aiFaulty: false };
  } catch (error) {
    return { data: [], aiFaulty: true };
  }
}

async function createDataPointsForAnnotatedText(
  data: ResDataPoint[],
  annotatedTextId: string,
  activeProfilePoints: ProfilePoint[],
  aiFaulty: boolean
) {
  let dataPoints = aiFaulty
    ? []
    : data.map((dataPoint) => ({
        name: dataPoint.name,
        value: dataPoint.value,
        match: dataPoint.match,
        annotatedTextId: annotatedTextId,
        profilePointId: activeProfilePoints.find(
          (profilePoint) => profilePoint.name === dataPoint.name
        )?.id,
        verified: undefined,
      }));

  dataPoints = complementMissingDatapoints(
    dataPoints,
    activeProfilePoints,
    annotatedTextId
  );

  await Promise.all(dataPoints.map(createDataPoint));
}

const getReqProfilePoints = (
  activeProfilePoints: ProfilePoint[]
): ReqProfilePoint[] => {
  return activeProfilePoints
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((profilePoint) => ({
      name: profilePoint.name,
      explanation: profilePoint.explanation,
      synonyms: profilePoint.synonyms,
      datatype: profilePoint.datatype,
      valueset: profilePoint.valueset,
      unit: profilePoint.unit,
    }));
};

const complementMissingDatapoints = (
  dataPoints: any[],
  profilePoints: ProfilePoint[],
  annotatedTextId: string
): any[] => {
  const missingDataPoints = profilePoints
    .filter(
      (profilePoint) =>
        !dataPoints.find((dataPoint) => dataPoint.name === profilePoint.name)
    )
    .map((profilePoint) => ({
      name: profilePoint.name,
      value: "",
      match: undefined,
      annotatedTextId: annotatedTextId,
      profilePointId: profilePoint.id,
      verified: undefined,
    }));
  return dataPoints.concat(missingDataPoints);
};

export const downloadAnnotatedDataset = async (dataset: AnnotatedDataset) => {
  try {
    // Fetch the corresponding profile
    const profile = await db.Profiles.get(dataset.profileId);
    if (!profile) throw new Error("Profile not found");

    // Fetch profile points for the profile
    const profilePoints = await readProfilePointsByProfile(profile.id);

    // Fetch all texts associated with this annotated dataset
    const annotatedTexts = await db.AnnotatedTexts.where({
      annotatedDatasetId: dataset.id,
    }).toArray();
    const textIds = annotatedTexts.map((at) => at.textId);
    const texts = await db.Texts.bulkGet(textIds);

    // Fetch the corresponding dataset
    const originalDataset = await db.Datasets.get(dataset.datasetId);
    if (!originalDataset) throw new Error("Original dataset not found");

    // Fetch all data points for this annotated dataset
    const dataPoints = await db.DataPoints.where("annotatedTextId")
      .anyOf(annotatedTexts.map((at) => at.id))
      .toArray();

    // Get current timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Construct the data to be downloaded with modified names
    const downloadData = {
      annotatedDataset: { ...dataset, name: `${dataset.name}_${timestamp}` },
      originalDataset: {
        ...originalDataset,
        name: `${originalDataset.name}_${timestamp}`,
      },
      profile: { ...profile, name: `${profile.name}_${timestamp}` },
      profilePoints: profilePoints,
      texts: texts,
      annotatedTexts: annotatedTexts,
      dataPoints: dataPoints,
    };

    // Convert to JSON and create a Blob
    const jsonData = JSON.stringify(downloadData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });

    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${dataset.name}_${timestamp}_annotated_dataset.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading annotated dataset:", error);
    // You might want to show an error message to the user here
  }
};

export const handleUploadAnnotatedDataset = async (file: File) => {
  try {
    const fileContent = await file.text();
    const uploadedData = JSON.parse(fileContent);

    // Check which required fields are missing
    const requiredFields = [
      'annotatedDataset',
      'originalDataset', 
      'profile',
      'profilePoints',
      'texts',
      'annotatedTexts',
      'dataPoints'
    ];
    
    const missingFields = requiredFields.filter(field => !uploadedData[field]);
    const presentFields = requiredFields.filter(field => uploadedData[field]);

    // Validate the structure of the uploaded data
    if (missingFields.length > 0) {
      throw new Error(`Invalid file structure. Missing fields: ${missingFields.join(', ')}. Present fields: ${presentFields.join(', ')}. Please ensure the file contains all required data: ${requiredFields.join(', ')}`);
    }

    // Create the new dataset
    const newDataset = await createDataset({
      ...uploadedData.originalDataset,
      id: undefined, // Let the create function generate the ID
    });

    // Create the new profile
    const newProfile = await createProfile({
      ...uploadedData.profile,
      id: undefined, // Let the create function generate the ID
    });

    // Create the new annotated dataset
    const newAnnotatedDataset = await createAnnotatedDataset({
      ...uploadedData.annotatedDataset,
      id: undefined, // Let the create function generate the ID
      datasetId: newDataset.id,
      profileId: newProfile.id,
    });

    // Create new profile points
    const newProfilePoints = await Promise.all(
      uploadedData.profilePoints.map((point: ProfilePoint) =>
        createProfilePoint({
          ...point,
          profileId: newProfile.id,
        })
      )
    );

    // Create new texts and annotated texts
    const textIdMap = new Map();
    const annotatedTextIdMap = new Map();
    for (const text of uploadedData.texts) {
      const newText = await createText({
        ...text,
        id: undefined, // Let the create function generate the ID
        datasetId: newDataset.id,
      });
      textIdMap.set(text.id, newText.id);
    }

    for (const annotatedText of uploadedData.annotatedTexts) {
      const newAnnotatedText = await createAnnotatedText({
        ...annotatedText,
        id: undefined, // Let the create function generate the ID
        textId: textIdMap.get(annotatedText.textId),
        annotatedDatasetId: newAnnotatedDataset.id,
      });
      annotatedTextIdMap.set(annotatedText.id, newAnnotatedText.id);
    }

    // Create new data points
    for (const dataPoint of uploadedData.dataPoints) {
      const newAnnotatedTextId = annotatedTextIdMap.get(
        dataPoint.annotatedTextId
      );
      if (newAnnotatedTextId) {
        const profilePointId = newProfilePoints.find(
          (pp) => pp.name === dataPoint.name
        )?.id;

        await createDataPoint({
          ...dataPoint,
          id: undefined, // Let the create function generate the ID
          annotatedTextId: newAnnotatedTextId,
          profilePointId: profilePointId,
        });
      }
    }

    return newAnnotatedDataset;
  } catch (error) {
    console.error("Error uploading annotated dataset:", error);
    throw error;
  }
};

export const annotateTextBatch = async (
  texts: Text[],
  activeAnnotatedDataset: AnnotatedDataset,
  activeProfilePoints: ProfilePoint[],
  llmProvider: string,
  llmModel: string,
  llmUrl: string,
  apiKey: string,
  maxTokens: number | undefined
) => {
  const annotationPromises = texts.map(async (text) => {
    try {
      const { data, aiFaulty } = await callAnnotationAPI(
        text,
        activeProfilePoints,
        { provider: llmProvider, model: llmModel, url: llmUrl, apiKey: apiKey, maxTokens: maxTokens }
      );

      const annotatedText = await createAnnotatedText({
        annotatedDatasetId: activeAnnotatedDataset.id,
        textId: text.id,
        verified: undefined,
        aiFaulty: aiFaulty,
      });

      await createDataPointsForAnnotatedText(
        data,
        annotatedText.id,
        activeProfilePoints,
        aiFaulty
      );
    } catch (error) {
      console.error(`Error annotating text ${text.id}:`, error);
    }
  });

  await Promise.all(annotationPromises);
};
