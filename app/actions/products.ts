"use server";

import { revalidatePath } from "next/cache";

import {
  AdminRequiredError,
  AuthenticationRequiredError,
  requireAdminUser,
} from "@/lib/auth/guards";

import {
  consumeRateLimit,
  RATE_LIMIT_POLICIES,
} from "@/lib/security/rate-limit";

import { createAuditLogSafely } from "@/lib/services/audit.service";

import {
  createProduct,
  ProductConflictError,
  ProductNotFoundError,
  updateProduct,
} from "@/lib/services/product.service";

import { createProductSchema } from "@/schemas/product.schema";

import type { ProductActionState } from "@/types/product-action";

function getText(
  formData: FormData,
  fieldName: string,
): string {
  const value = formData.get(fieldName);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function getOptionalText(
  formData: FormData,
  fieldName: string,
): string | undefined {
  const value = getText(
    formData,
    fieldName,
  );

  return value || undefined;
}

function getStringList(
  formData: FormData,
  fieldName: string,
): string[] {
  const value = getText(
    formData,
    fieldName,
  );

  if (!value) {
    return [];
  }

  return [
    ...new Set(
      value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function getCheckboxValue(
  formData: FormData,
  fieldName: string,
): boolean {
  const value = formData.get(fieldName);

  return (
    value === "on" ||
    value === "true" ||
    value === "1"
  );
}

function buildProductInput(
  formData: FormData,
) {
  const originalPrice =
    getText(
      formData,
      "originalPrice",
    );

  return {
    name: getText(formData, "name"),

    slug: getOptionalText(
      formData,
      "slug",
    ),

    description: getText(
      formData,
      "description",
    ),

    price: getText(
      formData,
      "price",
    ),

    originalPrice:
      originalPrice === ""
        ? null
        : originalPrice,

    category: getText(
      formData,
      "category",
    ),

    sku: getText(formData, "sku"),

    image: getText(
      formData,
      "image",
    ),

    images: getStringList(
      formData,
      "images",
    ),

    colors: getStringList(
      formData,
      "colors",
    ),

    sizes: getStringList(
      formData,
      "sizes",
    ),

    stock: getText(
      formData,
      "stock",
    ),

    rating:
      getText(
        formData,
        "rating",
      ) || "0",

    reviewCount:
      getText(
        formData,
        "reviewCount",
      ) || "0",

    isFeatured: getCheckboxValue(
      formData,
      "isFeatured",
    ),

    isNew: getCheckboxValue(
      formData,
      "isNew",
    ),

    isActive: getCheckboxValue(
      formData,
      "isActive",
    ),
  };
}

function errorState(
  message: string,
  options?: {
    fieldErrors?: Record<
      string,
      string[] | undefined
    >;

    retryable?: boolean;
  },
): ProductActionState {
  return {
    status: "error",
    message,

    fieldErrors:
      options?.fieldErrors ?? {},

    retryable:
      options?.retryable ?? false,
  };
}

async function processProductAction(
  mode: "create" | "update",
  productId: string | null,
  formData: FormData,
): Promise<ProductActionState> {
  let adminUser;

  try {
    adminUser =
      await requireAdminUser();
  } catch (error) {
    if (
      error instanceof
      AuthenticationRequiredError
    ) {
      return errorState(
        "You must be logged in to manage products.",
      );
    }

    if (
      error instanceof
      AdminRequiredError
    ) {
      return errorState(
        "Administrator access is required.",
      );
    }

    throw error;
  }

  const rateLimit =
    await consumeRateLimit({
      policy:
        RATE_LIMIT_POLICIES.adminMutation,

      identifier:
        `product-action:${adminUser.id}`,
    });

  if (!rateLimit.allowed) {
    return errorState(
      `Too many product updates. Try again in ${rateLimit.retryAfterSeconds} seconds.`,

      {
        retryable: true,
      },
    );
  }

  const validationResult =
    createProductSchema.safeParse(
      buildProductInput(formData),
    );

  if (!validationResult.success) {
    const validationErrors =
      validationResult.error.flatten();

    return errorState(
      validationErrors.formErrors[0] ??
        "Please correct the highlighted product fields.",

      {
        fieldErrors:
          validationErrors.fieldErrors,
      },
    );
  }

  try {
    const product =
      mode === "create"
        ? await createProduct(
            validationResult.data,
          )
        : await updateProduct(
            productId ?? "",
            validationResult.data,
          );

    await createAuditLogSafely({
      userId: adminUser.id,

      action:
        mode === "create"
          ? "CREATE_PRODUCT_SERVER_ACTION"
          : "UPDATE_PRODUCT_SERVER_ACTION",

      entity: "PRODUCT",

      entityId: product.id,

      description:
        mode === "create"
          ? `Product ${product.name} was created using a Server Action.`
          : `Product ${product.name} was updated using a Server Action.`,

      metadata: {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        source: "SERVER_ACTION",
      },
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath(
      "/admin/products",
    );

    revalidatePath(
      `/products/${product.slug}`,
    );

    return {
      status: "success",

      message:
        mode === "create"
          ? "Product created successfully."
          : "Product updated successfully.",

      fieldErrors: {},

      redirectTo:
        "/admin/products",
    };
  } catch (error) {
    if (
      error instanceof
      ProductConflictError
    ) {
      return errorState(
        error.message,
      );
    }

    if (
      error instanceof
      ProductNotFoundError
    ) {
      return errorState(
        error.message,
      );
    }

    console.error(
      "Product Server Action error:",
      error,
    );

    await createAuditLogSafely({
      userId: adminUser.id,

      action:
        mode === "create"
          ? "CREATE_PRODUCT_SERVER_ACTION_FAILED"
          : "UPDATE_PRODUCT_SERVER_ACTION_FAILED",

      entity: "PRODUCT",

      entityId: productId,

      description:
        mode === "create"
          ? "Product creation using a Server Action failed."
          : "Product update using a Server Action failed.",

      status: "FAILED",

      metadata: {
        source: "SERVER_ACTION",
      },
    });

    return errorState(
      "The product could not be saved because of an unexpected server error.",

      {
        retryable: true,
      },
    );
  }
}

export async function createProductAction(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  return processProductAction(
    "create",
    null,
    formData,
  );
}

export async function updateProductAction(
  productId: string,
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  return processProductAction(
    "update",
    productId,
    formData,
  );
}