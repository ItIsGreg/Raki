import { backendURL } from "../../app/constants";
import {
  SegmentationProfilePoint,
  Text,
  AnnotatedDataset,
  AnnotatedText,
} from "@/lib/db/db";
import { db } from "@/lib/db/db";
import {
  createAnnotatedText,
  createSegmentDataPoint,
  updateAnnotatedText,
  readSegmentDataPointsByAnnotatedText,
  updateSegmentDataPoint,
} from "@/lib/db/crud";

interface LLMConfig {
  provider: string;
  model: string;
  url: string;
  apiKey: string;
  maxTokens: number | undefined;
}

interface SegmentationResult {
  name: string;
  begin_match: number[] | undefined;
  end_match: number[] | undefined;
}

const updateExistingAndCreateNewSegmentDataPoints = async (
  data: SegmentationResult[],
  annotatedTextId: string,
  activeProfilePoints: SegmentationProfilePoint[],
  aiFaulty: boolean
) => {
  let newSegmentDataPoints = aiFaulty
    ? []
    : data.map((segment) => ({
        name: segment.name,
        begin: "",
        end: "",
        beginMatch: segment.begin_match,
        endMatch: segment.end_match,
        annotatedTextId: annotatedTextId,
        profilePointId: activeProfilePoints.find(
          (profilePoint) => profilePoint.name === segment.name
        )?.id,
        verified: undefined,
      }));

  // Find existing segment data points
  const existingSegmentDataPoints = await readSegmentDataPointsByAnnotatedText(
    annotatedTextId
  );

  // Update existing segment data points
  await Promise.all(
    existingSegmentDataPoints.map((segmentDataPoint) => {
      const newSegmentDataPoint = newSegmentDataPoints.find(
        (newPoint) => newPoint.name === segmentDataPoint.name
      );
      if (newSegmentDataPoint) {
        return updateSegmentDataPoint({
          ...newSegmentDataPoint,
          id: segmentDataPoint.id,
        });
      }
      return segmentDataPoint;
    })
  );

  // Create new segment data points that don't exist yet
  const newSegmentDataPointsToCreate = newSegmentDataPoints.filter(
    (newPoint) =>
      !existingSegmentDataPoints.find(
        (existingPoint) => existingPoint.name === newPoint.name
      )
  );

  await Promise.all(
    newSegmentDataPointsToCreate.map((point) => createSegmentDataPoint(point))
  );
};

export const reannotateFaultySegmentationText = async (
  annotatedFaultyText: AnnotatedText,
  activeProfilePoints: SegmentationProfilePoint[],
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

    const { data, aiFaulty } = await callSegmentationAPI(
      text,
      activeProfilePoints,
      {
        provider: llmProvider,
        model: llmModel,
        url: llmUrl,
        apiKey: apiKey,
        maxTokens: maxTokens,
      }
    );

    await updateExistingAndCreateNewSegmentDataPoints(
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

export const annotateSegmentationText = async (
  text: Text,
  activeAnnotatedDataset: AnnotatedDataset,
  activeProfilePoints: SegmentationProfilePoint[],
  llmProvider: string,
  llmModel: string,
  llmUrl: string,
  apiKey: string,
  maxTokens: number | undefined
) => {
  const { data, aiFaulty } = await callSegmentationAPI(
    text,
    activeProfilePoints,
    {
      provider: llmProvider,
      model: llmModel,
      url: llmUrl,
      apiKey: apiKey,
      maxTokens: maxTokens,
    }
  );

  try {
    const annotatedText = await createAnnotatedText({
      annotatedDatasetId: activeAnnotatedDataset.id,
      textId: text.id,
      verified: undefined,
      aiFaulty: aiFaulty,
    });

    await createSegmentDataPointsForAnnotatedText(
      data,
      annotatedText.id,
      activeProfilePoints,
      aiFaulty
    );
  } catch (error) {
    console.error("Error creating annotated text or segment data points:", error);
    throw error;
  }
};

async function callSegmentationAPI(
  text: Text,
  activeProfilePoints: SegmentationProfilePoint[],
  config: LLMConfig
) {
  try {
    const body = {
      llm_provider: config.provider,
      model: config.model,
      llm_url: config.url,
      api_key: config.apiKey,
      text: text.text,
      profile_points: activeProfilePoints
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((point) => ({
          name: point.name,
          explanation: point.explanation,
          synonyms: point.synonyms,
        })),
      max_tokens: config.maxTokens || undefined,
    };

    const response = await fetch(`${backendURL}/text-segmentation/segments`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("Network response was not ok. Status:", response.status);
      return { data: [], aiFaulty: true };
    }

    const data = await response.json();
    return { data, aiFaulty: false };
  } catch (error) {
    console.error("Error in callSegmentationAPI:", error);
    return { data: [], aiFaulty: true };
  }
}

async function createSegmentDataPointsForAnnotatedText(
  data: SegmentationResult[],
  annotatedTextId: string,
  activeProfilePoints: SegmentationProfilePoint[],
  aiFaulty: boolean
) {
  let segmentDataPoints = aiFaulty
    ? []
    : data.map((segment) => ({
        name: segment.name,
        begin: "",
        end: "",
        beginMatch: segment.begin_match,
        endMatch: segment.end_match,
        annotatedTextId: annotatedTextId,
        profilePointId: activeProfilePoints.find(
          (profilePoint) => profilePoint.name === segment.name
        )?.id,
        verified: undefined,
      }));

  segmentDataPoints = complementMissingSegmentDatapoints(
    segmentDataPoints,
    activeProfilePoints,
    annotatedTextId
  );

  await Promise.all(segmentDataPoints.map(createSegmentDataPoint));
}

const complementMissingSegmentDatapoints = (
  segmentDataPoints: any[],
  profilePoints: SegmentationProfilePoint[],
  annotatedTextId: string
): any[] => {
  const missingSegmentDataPoints = profilePoints
    .filter(
      (profilePoint) =>
        !segmentDataPoints.find(
          (segmentDataPoint) => segmentDataPoint.name === profilePoint.name
        )
    )
    .map((profilePoint) => ({
      name: profilePoint.name,
      begin: "",
      end: "",
      beginMatch: undefined,
      endMatch: undefined,
      annotatedTextId: annotatedTextId,
      profilePointId: profilePoint.id,
      verified: undefined,
    }));
  return segmentDataPoints.concat(missingSegmentDataPoints);
};

export const annotateSegmentationTextBatch = async (
  texts: Text[],
  activeAnnotatedDataset: AnnotatedDataset,
  activeProfilePoints: SegmentationProfilePoint[],
  llmProvider: string,
  llmModel: string,
  llmUrl: string,
  apiKey: string,
  maxTokens: number | undefined
) => {
  const annotationPromises = texts.map(async (text) => {
    try {
      const { data, aiFaulty } = await callSegmentationAPI(
        text,
        activeProfilePoints,
        {
          provider: llmProvider,
          model: llmModel,
          url: llmUrl,
          apiKey: apiKey,
          maxTokens: maxTokens,
        }
      );

      const annotatedText = await createAnnotatedText({
        annotatedDatasetId: activeAnnotatedDataset.id,
        textId: text.id,
        verified: undefined,
        aiFaulty: aiFaulty,
      });

      await createSegmentDataPointsForAnnotatedText(
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
