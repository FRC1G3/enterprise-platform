import type { ApiResponse } from "@/types/api";

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export async function apiFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiRequestError(
      "Server returned an invalid response.",
      response.status,
    );
  }

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new ApiRequestError(
      payload.message ?? "Request could not be completed.",
      response.status,
    );
  }

  return payload.data;
}