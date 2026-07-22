export type ProductActionStatus =
  | "idle"
  | "success"
  | "error";

export interface ProductActionState {
  status: ProductActionStatus;

  message: string;

  fieldErrors: Record<
    string,
    string[] | undefined
  >;

  redirectTo?: string;

  retryable?: boolean;
}