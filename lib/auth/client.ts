import type {
  ApiResponse,
  ApiValidationErrors,
} from "@/types/api";

const MUTATION_TIMEOUT_MS =
  15_000;

export class AuthRequestError extends Error {
  status: number;

  fieldErrors:
    ApiValidationErrors["fieldErrors"];

  formErrors: string[];

  constructor(
    message: string,
    status: number,
    errors?: ApiValidationErrors,
  ) {
    super(message);

    this.name =
      "AuthRequestError";

    this.status = status;

    this.fieldErrors =
      errors?.fieldErrors ?? {};

    this.formErrors =
      errors?.formErrors ?? [];
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

export async function authRequest<T>(
  url: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(() => {
      controller.abort();
    }, MUTATION_TIMEOUT_MS);

  const headers =
    new Headers(init.headers);

  headers.set(
    "Accept",
    "application/json",
  );

  if (init.body) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,

      headers,

      credentials:
        "same-origin",

      signal:
        controller.signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new AuthRequestError(
        "The request timed out. Your changes may not have been saved.",
        408,
      );
    }

    throw new AuthRequestError(
      "The server could not be reached. Check your connection and try again.",
      0,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  let payload:
    ApiResponse<T>;

  try {
    payload =
      (await response.json()) as ApiResponse<T>;
  } catch {
    throw new AuthRequestError(
      "Server returned an invalid response.",
      response.status,
    );
  }

  if (
    !response.ok ||
    !payload.success
  ) {
    throw new AuthRequestError(
      payload.message ??
        "Request could not be completed.",

      response.status,
      payload.errors,
    );
  }

  return payload;
}