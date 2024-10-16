import { backendURL, llmModel, llmProvider } from "../../constants";
import { ProfilePoint, Text } from "@/lib/db/db";
import { ReqProfilePoint, ResDataPoint } from "../../types";
import { createAnnotatedText, createDataPoint } from "@/lib/db/crud";

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
