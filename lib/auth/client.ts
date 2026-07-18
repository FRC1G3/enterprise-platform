import type {
  ApiResponse,
  ApiValidationErrors,
} from "@/types/api";

export class AuthRequestError extends Error {
  status: number;
  fieldErrors: ApiValidationErrors["fieldErrors"];
  formErrors: string[];

  constructor(
    message: string,
    status: number,
    errors?: ApiValidationErrors,
  ) {
    super(message);

    this.name = "AuthRequestError";
    this.status = status;
    this.fieldErrors = errors?.fieldErrors ?? {};
    this.formErrors = errors?.formErrors ?? [];
  }
}

export async function authRequest<T>(
  url: string,
  init: RequestInit,
): Promise<ApiResponse<T>> {
  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");

  if (init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "same-origin",
  });

  let payload: ApiResponse<T>;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new AuthRequestError(
      "Server returned an invalid response.",
      response.status,
    );
  }

  if (!response.ok || !payload.success) {
    throw new AuthRequestError(
      payload.message ?? "Request could not be completed.",
      response.status,
      payload.errors,
    );
  }

  return payload;
}