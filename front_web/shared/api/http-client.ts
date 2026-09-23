const API_PREFIX = "/backend";

function getLocaleHeader(): string | undefined {
  if (typeof document === "undefined") return undefined;

  const prefix = "hipocratiq-locale=";
  const cookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : undefined;
}

function apiHeaders(contentType?: boolean): HeadersInit {
  const locale = getLocaleHeader();

  return {
    Accept: "application/json",
    ...(contentType ? { "Content-Type": "application/json" } : {}),
    ...(locale ? { "Accept-Language": locale } : {}),
  };
}

type ValidationErrors = Record<string, string[]>;

type ApiErrorPayload = {
  message?: string;
  errors?: ValidationErrors;
};

type MutationMethod = "POST" | "PATCH" | "DELETE";

async function readJson<T>(response: Response): Promise<T | null> {
  return response.json().catch(() => null) as Promise<T | null>;
}

const STATUS_MESSAGES: Partial<Record<number, string>> = {
  400: "La solicitud no es válida.",
  401: "Tu sesión expiró. Vuelve a iniciar sesión.",
  403: "No tienes permisos para realizar esta acción.",
  404: "No encontramos el recurso solicitado.",
  419: "La sesión de seguridad expiró. Inténtalo nuevamente.",
  422: "Revisa los datos ingresados e inténtalo nuevamente.",
  500: "Ocurrió un error inesperado. Inténtalo nuevamente.",
  502: "El servicio no está disponible en este momento.",
  503: "El servicio no está disponible en este momento.",
};

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hora" : "horas"}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? "minuto" : "minutos"}`);
  }

  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds} ${seconds === 1 ? "segundo" : "segundos"}`);
  }

  return parts.length > 1
    ? `${parts.slice(0, -1).join(", ")} y ${parts.at(-1)}`
    : parts[0];
}

function localizedErrorMessage(
  status: number,
  serverMessage: string | null,
  retryAfter: string | null,
): string {
  if (status === 429) {
    const seconds = Number.parseInt(retryAfter ?? "", 10);

    return Number.isFinite(seconds) && seconds > 0
      ? `Demasiados intentos. Inténtalo nuevamente en ${formatDuration(seconds)}.`
      : "Demasiados intentos. Espera un momento y vuelve a intentarlo.";
  }

  const isFrameworkMessageInEnglish = serverMessage
    ? /^(The |Too Many|Unauthenticated|Forbidden|Not Found|Method Not Allowed|Server Error|This action)/i.test(serverMessage)
    : false;

  if (serverMessage && !isFrameworkMessageInEnglish) {
    return serverMessage;
  }

  return STATUS_MESSAGES[status] ?? "No pudimos completar la solicitud. Inténtalo nuevamente.";
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: ValidationErrors,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getCookie(name: string): string | null {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

let csrfToken: string | null = null;
let csrfRequest: Promise<string> | null = null;

function invalidateCsrfToken(): void {
  csrfToken = null;
}

async function refreshCsrfToken(): Promise<string> {
  const response = await fetch(`${API_PREFIX}/sanctum/csrf-cookie`, {
    credentials: "include",
    headers: apiHeaders(),
  });

  if (!response.ok) {
    throw new ApiError(
      localizedErrorMessage(response.status, null, response.headers.get("retry-after")),
      response.status,
    );
  }

  const token = getCookie("XSRF-TOKEN");

  if (!token) {
    throw new ApiError("No pudimos validar la sesión del navegador.", 419);
  }

  csrfToken = token;
  return token;
}

async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (csrfRequest) {
    return csrfRequest;
  }

  const cookieToken = getCookie("XSRF-TOKEN");

  if (!forceRefresh && csrfToken && csrfToken === cookieToken) {
    return csrfToken;
  }

  if (!forceRefresh && cookieToken) {
    csrfToken = cookieToken;
    return csrfToken;
  }

  csrfRequest = refreshCsrfToken().finally(() => {
    csrfRequest = null;
  });

  return csrfRequest;
}

async function sendMutation(
  method: MutationMethod,
  path: string,
  payload?: Record<string, unknown>,
): Promise<Response> {
  const sendRequest = async (token: string): Promise<Response> => fetch(`${API_PREFIX}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...apiHeaders(true),
      "X-XSRF-TOKEN": token,
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  let response = await sendRequest(await getCsrfToken());

  if (response.status === 419) {
    invalidateCsrfToken();
    response = await sendRequest(await getCsrfToken(true));
  }

  return response;
}

async function requestMutation<T>(
  method: MutationMethod,
  path: string,
  payload?: Record<string, unknown>,
): Promise<T> {
  const response = await sendMutation(method, path, payload);

  if (!response.ok) {
    const errorData = await readJson<ApiErrorPayload>(response);
    const firstValidationError = errorData?.errors
      ? Object.values(errorData.errors).flat()[0]
      : null;

    throw new ApiError(
      localizedErrorMessage(
        response.status,
        firstValidationError ?? errorData?.message ?? null,
        response.headers.get("retry-after"),
      ),
      response.status,
      errorData?.errors,
    );
  }

  return (await readJson<T>(response)) as T;
}

export async function postToApi<T>(
  path: string,
  payload?: Record<string, unknown>,
): Promise<T> {
  return requestMutation("POST", path, payload);
}

export async function patchToApi<T>(
  path: string,
  payload?: Record<string, unknown>,
): Promise<T> {
  return requestMutation("PATCH", path, payload);
}

export async function deleteFromApi(path: string): Promise<void> {
  await requestMutation<unknown>("DELETE", path);
}

export type ApiFileResponse = {
  blob: Blob;
  filename: string | null;
};

export async function getFileFromApi(
  path: string,
  options: { signal?: AbortSignal } = {},
): Promise<ApiFileResponse> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    credentials: "include",
    headers: apiHeaders(),
    cache: "no-store",
    signal: options.signal,
  });

  if (!response.ok) {
    const errorData = await readJson<ApiErrorPayload>(response);

    throw new ApiError(
      localizedErrorMessage(
        response.status,
        errorData?.message ?? null,
        response.headers.get("retry-after"),
      ),
      response.status,
      errorData?.errors,
    );
  }

  const disposition = response.headers.get("content-disposition");
  const filenameMatch = disposition?.match(/filename="?([^";]+)"?/i);

  return {
    blob: await response.blob(),
    filename: filenameMatch?.[1] ?? null,
  };
}

export async function getFromApi<T>(
  path: string,
  options: { signal?: AbortSignal } = {},
): Promise<T> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    credentials: "include",
    headers: apiHeaders(),
    cache: "no-store",
    signal: options.signal,
  });
  if (!response.ok) {
    const errorData = await readJson<ApiErrorPayload>(response);

    throw new ApiError(
      localizedErrorMessage(
        response.status,
        errorData?.message ?? null,
        response.headers.get("retry-after"),
      ),
      response.status,
      errorData?.errors,
    );
  }

  return (await readJson<T>(response)) as T;
}
