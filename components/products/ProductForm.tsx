"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useState,
} from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

import {
  AuthRequestError,
  authRequest,
} from "@/lib/auth/client";

import { createProductSchema } from "@/schemas/product.schema";

import {
  PRODUCT_CATEGORIES,
  type Product,
} from "@/types/product";

interface ProductFormProps {
  product?: Product;
}

type ProductField =
  | "name"
  | "description"
  | "price"
  | "originalPrice"
  | "category"
  | "stock"
  | "sku"
  | "image"
  | "sizes"
  | "colors";

type ProductFieldErrors = Partial<
  Record<ProductField, string>
>;

const categoryOptions = PRODUCT_CATEGORIES.map(
  (value) => ({
    label: value,
    value,
  }),
);

function splitCommaSeparatedValues(
  value: FormDataEntryValue | null,
): string[] {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getFirstFieldError(
  errors: Record<string, string[] | undefined>,
  field: ProductField,
): string | undefined {
  return errors[field]?.[0];
}

export function ProductForm({
  product,
}: ProductFormProps) {
  const router = useRouter();

  const isEditing = Boolean(product);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] =
    useState<ProductFieldErrors>({});

  const [preview, setPreview] = useState(
    product?.image ?? "",
  );

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const image = String(
      formData.get("image") ?? "",
    ).trim();

    const originalPriceValue = String(
      formData.get("originalPrice") ?? "",
    ).trim();

    const payload = {
      name: String(formData.get("name") ?? ""),
      description: String(
        formData.get("description") ?? "",
      ),

      price: formData.get("price"),
      originalPrice:
        originalPriceValue === ""
          ? null
          : originalPriceValue,

      category: String(
        formData.get("category") ?? "",
      ),

      stock: formData.get("stock"),
      sku: String(formData.get("sku") ?? ""),

      image,

      images: product
        ? Array.from(
            new Set([
              image,
              ...product.images,
            ]),
          ).filter(Boolean)
        : [],

      sizes: splitCommaSeparatedValues(
        formData.get("sizes"),
      ),

      colors: splitCommaSeparatedValues(
        formData.get("colors"),
      ),

      rating: product?.rating ?? 0,
      reviewCount: product?.reviewCount ?? 0,

      isFeatured:
        formData.get("isFeatured") === "on",

      isNew: formData.get("isNew") === "on",

      isActive:
        formData.get("isActive") === "on",
    };

    const validationResult =
      createProductSchema.safeParse(payload);

    if (!validationResult.success) {
      const errors =
        validationResult.error.flatten();

      setFieldErrors({
        name: errors.fieldErrors.name?.[0],
        description:
          errors.fieldErrors.description?.[0],
        price: errors.fieldErrors.price?.[0],
        originalPrice:
          errors.fieldErrors.originalPrice?.[0],
        category:
          errors.fieldErrors.category?.[0],
        stock: errors.fieldErrors.stock?.[0],
        sku: errors.fieldErrors.sku?.[0],
        image: errors.fieldErrors.image?.[0],
        sizes: errors.fieldErrors.sizes?.[0],
        colors: errors.fieldErrors.colors?.[0],
      });

      setFormError(
        errors.formErrors[0] ??
          "Please check the product information.",
      );

      return;
    }

    setLoading(true);
    setFormError("");
    setFieldErrors({});

    try {
      const endpoint = isEditing
        ? `/api/products/${product?.id}`
        : "/api/products";

      await authRequest<Product>(endpoint, {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(
          validationResult.data,
        ),
      });

      router.replace("/admin/products");
      router.refresh();
    } catch (error) {
      if (error instanceof AuthRequestError) {
        setFormError(error.message);

        setFieldErrors({
          name: getFirstFieldError(
            error.fieldErrors,
            "name",
          ),
          description: getFirstFieldError(
            error.fieldErrors,
            "description",
          ),
          price: getFirstFieldError(
            error.fieldErrors,
            "price",
          ),
          originalPrice: getFirstFieldError(
            error.fieldErrors,
            "originalPrice",
          ),
          category: getFirstFieldError(
            error.fieldErrors,
            "category",
          ),
          stock: getFirstFieldError(
            error.fieldErrors,
            "stock",
          ),
          sku: getFirstFieldError(
            error.fieldErrors,
            "sku",
          ),
          image: getFirstFieldError(
            error.fieldErrors,
            "image",
          ),
          sizes: getFirstFieldError(
            error.fieldErrors,
            "sizes",
          ),
          colors: getFirstFieldError(
            error.fieldErrors,
            "colors",
          ),
        });
      } else {
        console.error(
          "Product form error:",
          error,
        );

        setFormError(
          "An unexpected error occurred. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-[18px]"
      noValidate
    >
      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Basic information</h2>

        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          <Input
            label="Product name"
            name="name"
            defaultValue={product?.name ?? ""}
            error={fieldErrors.name}
            disabled={loading}
            required
          />

          <div className="grid gap-[7px]">
            <Select
              label="Category"
              name="category"
              defaultValue={
                product?.category ?? "Men"
              }
              options={categoryOptions}
              disabled={loading}
            />

            {fieldErrors.category && (
              <span className="text-xs text-red-700">
                {fieldErrors.category}
              </span>
            )}
          </div>

          <div className="grid gap-[7px] md:col-span-2">
            <label
              className="text-[0.84rem] font-bold"
              htmlFor="description"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              className="min-h-[120px] w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={
                product?.description ?? ""
              }
              disabled={loading}
              aria-invalid={Boolean(
                fieldErrors.description,
              )}
              required
            />

            {fieldErrors.description && (
              <span className="text-xs text-red-700">
                {fieldErrors.description}
              </span>
            )}
          </div>

          <Input
            label="Price"
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={product?.price ?? ""}
            error={fieldErrors.price}
            disabled={loading}
            required
          />

          <Input
            label="Original price"
            name="originalPrice"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={
              product?.originalPrice ?? ""
            }
            error={fieldErrors.originalPrice}
            disabled={loading}
          />

          <Input
            label="Stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stock ?? 0}
            error={fieldErrors.stock}
            disabled={loading}
            required
          />

          <Input
            label="SKU"
            name="sku"
            defaultValue={product?.sku ?? ""}
            error={fieldErrors.sku}
            disabled={loading}
            placeholder="NS-PR-001"
            required
          />
        </div>
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Media</h2>

        <Input
          label="Image URL"
          name="image"
          value={preview}
          onChange={(event) =>
            setPreview(event.target.value)
          }
          error={fieldErrors.image}
          disabled={loading}
          placeholder="https://images.unsplash.com/..."
          required
        />

        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="mt-3.5 h-[185px] w-[150px] rounded-lg object-cover"
            src={preview}
            alt="Product preview"
          />
        )}

        <p className="leading-7 text-slate-500">
          Enter a public image URL. The first image is
          used as the main product image.
        </p>
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Variants</h2>

        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          <Input
            label="Sizes"
            name="sizes"
            defaultValue={
              product?.sizes.join(", ") ?? ""
            }
            error={fieldErrors.sizes}
            disabled={loading}
            placeholder="S, M, L"
          />

          <Input
            label="Colors"
            name="colors"
            defaultValue={
              product?.colors.join(", ") ?? ""
            }
            error={fieldErrors.colors}
            disabled={loading}
            placeholder="Black, White"
          />
        </div>

        <div className="mt-[18px] flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={
                product?.isFeatured ?? false
              }
              disabled={loading}
            />

            Featured product
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isNew"
              defaultChecked={
                product?.isNew ?? false
              }
              disabled={loading}
            />

            New arrival
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={
                product?.isActive ?? true
              }
              disabled={loading}
            />

            Active status
          </label>
        </div>
      </section>

      {formError && (
        <div
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {formError}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Link
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-[17px] py-2.5 font-bold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50"
          href="/admin/products"
        >
          Cancel
        </Link>

        <Button
          type="submit"
          loading={loading}
        >
          {isEditing
            ? "Save changes"
            : "Create product"}
        </Button>
      </div>
    </form>
  );
}