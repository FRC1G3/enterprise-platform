"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  type FormEvent,
  useActionState,
  useEffect,
  useState,
} from "react";

import {
  createProductAction,
  updateProductAction,
} from "@/app/actions/products";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

import type { Product } from "@/types/product";

import type { ProductActionState } from "@/types/product-action";

const categoryOptions = [
  {
    label: "Men",
    value: "Men",
  },
  {
    label: "Women",
    value: "Women",
  },
  {
    label: "Shoes",
    value: "Shoes",
  },
  {
    label: "Accessories",
    value: "Accessories",
  },
];

const INITIAL_ACTION_STATE:
  ProductActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  retryable: false,
};

interface ProductFormProps {
  product?: Product;
}

function getFieldError(
  state: ProductActionState,
  fieldName: string,
): string | undefined {
  return state.fieldErrors[
    fieldName
  ]?.[0];
}

export function ProductForm({
  product,
}: ProductFormProps) {
  const router = useRouter();

  const [preview, setPreview] =
    useState(product?.image ?? "");

  const [
    clientValidationError,
    setClientValidationError,
  ] = useState("");

  const productAction = product
    ? updateProductAction.bind(
        null,
        product.id,
      )
    : createProductAction;

  const permalink = product
    ? `/admin/products/${product.id}/edit`
    : "/admin/products/create";

  const [
    actionState,
    formAction,
    isPending,
  ] = useActionState(
    productAction,
    INITIAL_ACTION_STATE,
    permalink,
  );

  useEffect(() => {
    if (
      actionState.status ===
        "success" &&
      actionState.redirectTo
    ) {
      router.replace(
        actionState.redirectTo,
      );

      router.refresh();
    }
  }, [
    actionState,
    router,
  ]);

  function validateBeforeSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    setClientValidationError("");

    const formData = new FormData(
      event.currentTarget,
    );

    const price = Number(
      formData.get("price"),
    );

    const originalPriceValue =
      String(
        formData.get(
          "originalPrice",
        ) ?? "",
      ).trim();

    if (!originalPriceValue) {
      return;
    }

    const originalPrice = Number(
      originalPriceValue,
    );

    if (
      Number.isFinite(price) &&
      Number.isFinite(
        originalPrice,
      ) &&
      originalPrice < price
    ) {
      event.preventDefault();

      setClientValidationError(
        "Original price cannot be lower than the current price.",
      );
    }
  }

  return (
    <form
      action={formAction}
      className="grid gap-[18px]"
      onSubmit={validateBeforeSubmit}
    >
      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Basic information</h2>

        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          <Input
            label="Product name"
            name="name"
            defaultValue={
              product?.name ?? ""
            }
            minLength={2}
            maxLength={120}
            error={getFieldError(
              actionState,
              "name",
            )}
            disabled={isPending}
            required
          />

          <Input
            label="Slug"
            name="slug"
            defaultValue={
              product?.slug ?? ""
            }
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            placeholder="classic-steel-watch"
            error={getFieldError(
              actionState,
              "slug",
            )}
            disabled={isPending}
          />

          <div className="grid gap-[7px]">
            <Select
              label="Category"
              name="category"
              defaultValue={
                product?.category ??
                "Men"
              }
              options={
                categoryOptions
              }
              disabled={isPending}
              required
            />

            {getFieldError(
              actionState,
              "category",
            ) && (
              <span className="text-xs text-red-700">
                {getFieldError(
                  actionState,
                  "category",
                )}
              </span>
            )}
          </div>

          <Input
            label="SKU"
            name="sku"
            defaultValue={
              product?.sku ?? ""
            }
            minLength={2}
            maxLength={80}
            pattern="[A-Za-z0-9_-]+"
            error={getFieldError(
              actionState,
              "sku",
            )}
            disabled={isPending}
            required
          />

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
              className="min-h-[130px] w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={
                product?.description ??
                ""
              }
              minLength={10}
              maxLength={2000}
              disabled={isPending}
              required
            />

            {getFieldError(
              actionState,
              "description",
            ) && (
              <span className="text-xs text-red-700">
                {getFieldError(
                  actionState,
                  "description",
                )}
              </span>
            )}
          </div>

          <Input
            label="Price"
            name="price"
            type="number"
            min="0.01"
            max="99999999"
            step="0.01"
            defaultValue={
              product?.price ?? ""
            }
            error={getFieldError(
              actionState,
              "price",
            )}
            disabled={isPending}
            required
          />

          <Input
            label="Original price"
            name="originalPrice"
            type="number"
            min="0.01"
            max="99999999"
            step="0.01"
            defaultValue={
              product?.originalPrice ??
              ""
            }
            error={getFieldError(
              actionState,
              "originalPrice",
            )}
            disabled={isPending}
          />

          <Input
            label="Stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={
              product?.stock ?? 0
            }
            error={getFieldError(
              actionState,
              "stock",
            )}
            disabled={isPending}
            required
          />

          <Input
            label="Rating"
            name="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            defaultValue={
              product?.rating ?? 0
            }
            error={getFieldError(
              actionState,
              "rating",
            )}
            disabled={isPending}
          />

          <Input
            label="Review count"
            name="reviewCount"
            type="number"
            min="0"
            step="1"
            defaultValue={
              product?.reviewCount ??
              0
            }
            error={getFieldError(
              actionState,
              "reviewCount",
            )}
            disabled={isPending}
          />
        </div>
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Media</h2>

        <Input
          label="Main image URL"
          name="image"
          type="url"
          value={preview}
          onChange={(event) =>
            setPreview(
              event.target.value,
            )
          }
          placeholder="https://images.unsplash.com/..."
          error={getFieldError(
            actionState,
            "image",
          )}
          disabled={isPending}
          required
        />

        {preview && (
          <Image
            className="mt-4 h-[220px] w-[175px] rounded-lg object-cover"
            src={preview}
            alt="Product preview"
            width={175}
            height={220}
          />
        )}

        <div className="mt-5 grid gap-[7px]">
          <label
            className="text-[0.84rem] font-bold"
            htmlFor="images"
          >
            Additional image URLs
          </label>

          <textarea
            id="images"
            name="images"
            className="min-h-[110px] w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue={
              product?.images.join(
                "\n",
              ) ?? ""
            }
            placeholder={
              "One URL per line or comma-separated"
            }
            disabled={isPending}
          />

          {getFieldError(
            actionState,
            "images",
          ) && (
            <span className="text-xs text-red-700">
              {getFieldError(
                actionState,
                "images",
              )}
            </span>
          )}
        </div>
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Variants and visibility</h2>

        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          <Input
            label="Sizes"
            name="sizes"
            defaultValue={
              product?.sizes.join(
                ", ",
              ) ?? ""
            }
            placeholder="S, M, L"
            error={getFieldError(
              actionState,
              "sizes",
            )}
            disabled={isPending}
          />

          <Input
            label="Colors"
            name="colors"
            defaultValue={
              product?.colors.join(
                ", ",
              ) ?? ""
            }
            placeholder="Black, Silver"
            error={getFieldError(
              actionState,
              "colors",
            )}
            disabled={isPending}
          />
        </div>

        <div className="mt-[18px] flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={
                product?.isFeatured ??
                false
              }
              disabled={isPending}
            />

            Featured product
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isNew"
              defaultChecked={
                product?.isNew ??
                false
              }
              disabled={isPending}
            />

            New arrival
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={
                product
                  ? product.isActive
                  : true
              }
              disabled={isPending}
            />

            Active product
          </label>
        </div>
      </section>

      {clientValidationError && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          role="alert"
        >
          {clientValidationError}
        </div>
      )}

      {actionState.status ===
        "error" && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          role="alert"
          aria-live="polite"
        >
          <strong className="block">
            Product was not saved
          </strong>

          <p className="mt-1">
            {actionState.message}
          </p>

          {actionState.retryable && (
            <p className="mt-2 text-sm">
              Your form values are still
              available. Submit the form
              again to retry.
            </p>
          )}
        </div>
      )}

      {actionState.status ===
        "success" && (
        <div
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700"
          role="status"
          aria-live="polite"
        >
          {actionState.message}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-[17px] py-2.5 font-bold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50"
          href="/admin/products"
          aria-disabled={isPending}
        >
          Cancel
        </Link>

        <Button
          type="submit"
          loading={isPending}
          disabled={isPending}
        >
          {actionState.retryable
            ? "Try again"
            : product
              ? "Update product"
              : "Create product"}
        </Button>
      </div>
    </form>
  );
}