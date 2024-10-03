export const isProd = () => {
  return process.env.NEXT_PUBLIC_ENV === "prod";
};

export const backendURL = isProd()
  ? process.env.NEXT_PUBLIC_BACKEND_URL
  : "http://localhost:8000";

export const llmModel = process.env.NEXT_PUBLIC_MODEL || "gpt-4o";
export const llmProvider = process.env.NEXT_PUBLIC_LLM_PROVIDER || "openai";
