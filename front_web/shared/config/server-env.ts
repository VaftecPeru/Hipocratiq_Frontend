import "server-only";

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function serverUrl(name: "BACKEND_URL" | "APP_URL", localDefault: string): string {
  const value = process.env[name];

  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`${name} is required in production.`);
  }

  const candidate = value ?? localDefault;

  if (!URL.canParse(candidate)) {
    throw new Error(`${name} must be a valid URL.`);
  }

  const url = new URL(candidate);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${name} must use http or https.`);
  }

  return withoutTrailingSlash(url.toString());
}

export const serverEnv = {
  backendUrl: serverUrl("BACKEND_URL", "http://127.0.0.1:8000"),
  appUrl: serverUrl("APP_URL", "http://localhost:3000"),
};
