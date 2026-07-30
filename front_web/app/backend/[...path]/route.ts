import type { NextRequest } from "next/server";
import { serverEnv } from "@/shared/config/server-env";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const BODYLESS_METHODS = new Set(["GET", "HEAD"]);
const EXCLUDED_RESPONSE_HEADERS = new Set([
  "access-control-allow-credentials",
  "access-control-allow-origin",
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "set-cookie",
  "transfer-encoding",
  "x-powered-by",
]);

async function forwardRequest(request: NextRequest, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
  const targetUrl = new URL(`/${path.join("/")}`, serverEnv.backendUrl);
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("host");
  headers.delete("authorization");
  headers.set("accept", "application/json");
  headers.set("origin", serverEnv.appUrl);
  headers.set("x-forwarded-host", request.nextUrl.host);
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: BODYLESS_METHODS.has(request.method) ? undefined : request.body,
      cache: "no-store",
      redirect: "manual",
      duplex: "half",
      signal: AbortSignal.timeout(10_000),
    } as RequestInit & { duplex: "half" });

    const response = new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
    });

    upstreamResponse.headers.forEach((value, key) => {
      if (!EXCLUDED_RESPONSE_HEADERS.has(key.toLowerCase())) {
        response.headers.set(key, value);
      }
    });

    const responseHeaders = upstreamResponse.headers as Headers & {
      getSetCookie?: () => string[];
    };
    const setCookies = responseHeaders.getSetCookie?.() ?? [];

    for (const cookie of setCookies) {
      response.headers.append("set-cookie", cookie);
    }

    return response;
  } catch (error) {
    console.error("Backend proxy request failed.", {
      method: request.method,
      path: targetUrl.pathname,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return Response.json({
      success: false,
      code: "BACKEND_UNAVAILABLE",
      message: "El servicio de autenticación no está disponible.",
    }, { status: 502 });
  }
}

export const GET = forwardRequest;
export const POST = forwardRequest;
export const PUT = forwardRequest;
export const PATCH = forwardRequest;
export const DELETE = forwardRequest;
