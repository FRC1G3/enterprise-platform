export interface ApiValidationErrors {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiValidationErrors;
}