import { backendURL, llmModel, llmProvider } from "../../constants";
import { ProfilePoint, Text, AnnotatedDataset } from "@/lib/db/db";
import { ReqProfilePoint, ResDataPoint } from "../../types";
import {
  readProfilePointsByProfile,
  createAnnotatedDataset,
  createAnnotatedText,
  createDataset,
  createProfile,
  createProfilePoint,
  createText,
  createDataPoint,
} from "@/lib/db/crud";
import { db } from "@/lib/db/db";

export const annotateText = async (
  text: Text,
  activeAnnotatedDataset: { id: string },
  activeProfilePoints: ProfilePoint[],
  dbApiKeys: { key: string }[] | undefined
) => {
  if (!dbApiKeys || dbApiKeys.length === 0) {
    throw new Error("No API key found");
  }
  try {
    const body = {
      llm_provider: llmProvider,
      model: llmModel,
      api_key: dbApiKeys[0].key,
      text: text.text,
      datapoints: getReqProfilePoints(activeProfilePoints),
    };
    const response = await fetch(`${backendURL}/pipeline/pipeline/`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data: ResDataPoint[] = await response.json();
    const annotatedText = await createAnnotatedText({
      annotatedDatasetId: activeAnnotatedDataset.id,
      textId: text.id,
      verified: undefined,
    });
    const annotatedTextID = annotatedText.id;
    let dataPoints = data.map((dataPoint) => ({
      name: dataPoint.name,
      value: dataPoint.value,
      match: dataPoint.match,
      annotatedTextId: annotatedTextID,
      profilePointId: activeProfilePoints.find(
        (profilePoint) => profilePoint.name === dataPoint.name
      )?.id,
      verified: undefined,
    }));

    dataPoints = complementMissingDatapoints(
      dataPoints,
      activeProfilePoints,
      annotatedTextID
    );

    await Promise.all(dataPoints.map(createDataPoint));
  } catch (error) {
    console.error("Error:", error);
  }
};

const getReqProfilePoints = (
  activeProfilePoints: ProfilePoint[]
): ReqProfilePoint[] => {
  return activeProfilePoints.map((profilePoint) => ({
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

    // Validate the structure of the uploaded data
    if (
      !uploadedData.annotatedDataset ||
      !uploadedData.originalDataset ||
      !uploadedData.profile ||
      !uploadedData.profilePoints ||
      !uploadedData.texts ||
      !uploadedData.annotatedTexts ||
      !uploadedData.dataPoints
    ) {
      throw new Error("Invalid file structure");
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
