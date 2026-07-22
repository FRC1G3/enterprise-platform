import type {
  ApiResponse,
} from "@/types/api";

const REQUEST_TIMEOUT_MS =
  10_000;

export class ApiRequestError extends Error {
  status: number;
  retryable: boolean;

  constructor(
    message: string,
    status: number,
    retryable = false,
  ) {
    super(message);

    this.name =
      "ApiRequestError";

    this.status = status;
    this.retryable = retryable;
  }
}

function isAbortError(
  error: unknown,
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"
  );
}

export async function apiFetcher<T>(
  url: string,
): Promise<T> {
  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Accept:
          "application/json",
      },

      credentials: "same-origin",

      signal:
        controller.signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new ApiRequestError(
        "The request timed out. Please try again.",
        408,
        true,
      );
    }

    throw new ApiRequestError(
      "The server could not be reached. Check your connection and try again.",
      0,
      true,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  let payload:
    | ApiResponse<T>
    | null = null;

  try {
    payload =
      (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiRequestError(
      "Server returned an invalid response.",
      response.status,

      response.status >= 500,
    );
  }

  if (
    !response.ok ||
    !payload.success ||
    payload.data === undefined
  ) {
    throw new ApiRequestError(
      payload.message ??
        "Request could not be completed.",

      response.status,

      response.status >= 500 ||
        response.status === 408,
    );
  }

  return payload.data;
}