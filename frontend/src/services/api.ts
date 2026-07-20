import type { ApiErrorBody } from "@/types/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  accessToken?: string | null;
  skipAuthRefresh?: boolean;
};

let accessTokenMemory: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessTokenMemory = token;
}

export function getAccessToken() {
  return accessTokenMemory;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        accessTokenMemory = null;
        return null;
      }

      const data = (await res.json()) as { accessToken: string };
      accessTokenMemory = data.accessToken;
      return data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, accessToken, skipAuthRefresh, headers, ...rest } = options;

  const makeRequest = (token: string | null) =>
    fetch(`${API_URL}${path}`, {
      ...rest,
      credentials: "include",
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let token = accessToken ?? accessTokenMemory;
  let response = await makeRequest(token);

  if (response.status === 401 && !skipAuthRefresh && !path.startsWith("/auth/login")) {
    token = await refreshAccessToken();
    if (token) {
      response = await makeRequest(token);
    }
  }

  if (!response.ok) {
    let message = "Request failed";
    let code: string | undefined;
    try {
      const data = (await response.json()) as ApiErrorBody;
      message = data.error?.message ?? message;
      code = data.error?.code;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, code, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
