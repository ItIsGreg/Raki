export const isProd = () => {
  return process.env.NEXT_PUBLIC_ENV === "prod";
};

export const backendURL = isProd()
  ? process.env.NEXT_PUBLIC_BACKEND_URL
  : "http://localhost:8000";

export const TASK_MODE = {
  TEXT_SEGMENTATION: "text_segmentation",
  DATAPOINT_EXTRACTION: "datapoint_extraction",
} as const;

export type TaskMode = (typeof TASK_MODE)[keyof typeof TASK_MODE];

export const DATABASE_NAME = "myDatabase";