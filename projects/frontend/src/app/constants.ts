export const isProd = () => {
  return process.env.NEXT_PUBLIC_ENV === "prod";
};

export const backendURL = isProd()
  ? process.env.NEXT_PUBLIC_BACKEND_URL
  : "http://localhost:8000";
