import "server-only";

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

export const serverEnv = {
  backendUrl: withoutTrailingSlash(process.env.BACKEND_URL ?? "http://127.0.0.1:8000"),
  appUrl: withoutTrailingSlash(process.env.APP_URL ?? "http://localhost:3000"),
};
