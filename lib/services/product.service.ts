import {
  Prisma,
  ProductCategory as DatabaseProductCategory,
} from "@/generated/prisma/client";

import prisma from "@/lib/db/prisma";

import type {
  CreateProductInput,
  ProductQueryInput,
  UpdateProductInput,
} from "@/schemas/product.schema";

import type {
  Product,
  ProductCategory,
  ProductListResult,
} from "@/types/product";

type ProductWithInventory = Prisma.ProductGetPayload<{
  include: {
    inventory: true;
  };
}>;

const categoryToDatabase: Record<
  ProductCategory,
  DatabaseProductCategory
> = {
  Men: DatabaseProductCategory.MEN,
  Women: DatabaseProductCategory.WOMEN,
  Shoes: DatabaseProductCategory.SHOES,
  Accessories: DatabaseProductCategory.ACCESSORIES,
};

const categoryFromDatabase: Record<
  DatabaseProductCategory,
  ProductCategory
> = {
  MEN: "Men",
  WOMEN: "Women",
  SHOES: "Shoes",
  ACCESSORIES: "Accessories",
};

export class ProductNotFoundError extends Error {
  constructor() {
    super("Product not found.");
    this.name = "ProductNotFoundError";
  }
}

export class ProductConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductConflictError";
  }
}

function normalizeSlug(value: string): string {
  const translatedValue = value
    .replaceAll("ə", "e")
    .replaceAll("Ə", "E")
    .replaceAll("ı", "i")
    .replaceAll("İ", "I")
    .replaceAll("ö", "o")
    .replaceAll("Ö", "O")
    .replaceAll("ü", "u")
    .replaceAll("Ü", "U")
    .replaceAll("ş", "s")
    .replaceAll("Ş", "S")
    .replaceAll("ç", "c")
    .replaceAll("Ç", "C")
    .replaceAll("ğ", "g")
    .replaceAll("Ğ", "G");

  return translatedValue
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function serializeProduct(product: ProductWithInventory): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,

    price: Number(product.price),
    originalPrice:
      product.originalPrice === null
        ? undefined
        : Number(product.originalPrice),

    category: categoryFromDatabase[product.category],
    sku: product.sku,

    image: product.image,
    images: product.images,
    colors: product.colors,
    sizes: product.sizes,

    rating: Number(product.rating),
    reviewCount: product.reviewCount,

    stock: product.inventory?.quantity ?? 0,
    reservedStock: product.inventory?.reservedQuantity ?? 0,

    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isActive: product.isActive,

    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

function getOrderBy(
  sort: ProductQueryInput["sort"],
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-low":
      return [{ price: "asc" }, { createdAt: "desc" }];

    case "price-high":
      return [{ price: "desc" }, { createdAt: "desc" }];

    case "rating":
      return [{ rating: "desc" }, { reviewCount: "desc" }];

    case "newest":
      return [{ createdAt: "desc" }];

    case "featured":
    default:
      return [{ isFeatured: "desc" }, { createdAt: "desc" }];
  }
}

async function ensureProductUnique(
  slug: string,
  sku: string,
  excludedProductId?: string,
): Promise<void> {
  const product = await prisma.product.findFirst({
    where: {
      id: excludedProductId
        ? {
            not: excludedProductId,
          }
        : undefined,
      OR: [{ slug }, { sku }],
    },
    select: {
      slug: true,
      sku: true,
    },
  });

  if (!product) {
    return;
  }

  if (product.slug === slug) {
    throw new ProductConflictError(
      "A product with this slug already exists.",
    );
  }

  throw new ProductConflictError("A product with this SKU already exists.");
}

export async function listProducts(
  query: ProductQueryInput,
): Promise<ProductListResult> {
  const skip = (query.page - 1) * query.limit;

  const where: Prisma.ProductWhereInput = {
    isActive: true,

    category: query.category
      ? categoryToDatabase[query.category]
      : undefined,

    price:
      query.min !== undefined || query.max !== undefined
        ? {
            gte: query.min,
            lte: query.max,
          }
        : undefined,

    inventory: query.inStock
      ? {
          is: {
            quantity: {
              gt: 0,
            },
          },
        }
      : undefined,

    OR: query.search
      ? [
          {
            name: {
              contains: query.search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query.search,
              mode: "insensitive",
            },
          },
          {
            sku: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        ]
      : undefined,
  };

  const [total, products] = await prisma.$transaction([
    prisma.product.count({
      where,
    }),
    prisma.product.findMany({
      where,
      include: {
        inventory: true,
      },
      orderBy: getOrderBy(query.sort),
      skip,
      take: query.limit,
    }),
  ]);

  return {
    products: products.map(serializeProduct),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

function normalizeProductLimit(limit: number): number {
  return Math.min(Math.max(limit, 1), 20);
}

export async function getFeaturedProducts(
  limit = 4,
): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    include: {
      inventory: true,
    },
    orderBy: [
      {
        rating: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    take: normalizeProductLimit(limit),
  });

  return products.map(serializeProduct);
}

export async function getNewArrivalProducts(
  limit = 4,
): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      isNew: true,
    },
    include: {
      inventory: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: normalizeProductLimit(limit),
  });

  return products.map(serializeProduct);
}
export async function getProductByIdOrSlug(
  idOrSlug: string,
): Promise<Product> {
  const product = await prisma.product.findFirst({
    where: {
      isActive: true,
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      inventory: true,
    },
  });

  if (!product) {
    throw new ProductNotFoundError();
  }

  return serializeProduct(product);
}

export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  const generatedSlug =
    normalizeSlug(input.slug ?? input.name) || `product-${Date.now()}`;

  const normalizedSku = input.sku.trim().toUpperCase();

  await ensureProductUnique(generatedSlug, normalizedSku);

  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug: generatedSlug,
      description: input.description,

      price: input.price,
      originalPrice: input.originalPrice ?? null,

      category: categoryToDatabase[input.category],
      sku: normalizedSku,

      image: input.image,
      images:
        input.images.length > 0
          ? uniqueStrings(input.images)
          : [input.image],

      colors: uniqueStrings(input.colors),
      sizes: uniqueStrings(input.sizes),

      rating: input.rating,
      reviewCount: input.reviewCount,

      isFeatured: input.isFeatured,
      isNew: input.isNew,
      isActive: input.isActive,

      inventory: {
        create: {
          quantity: input.stock,
          reservedQuantity: 0,
        },
      },
    },
    include: {
      inventory: true,
    },
  });

  return serializeProduct(product);
}

export async function updateProduct(
  idOrSlug: string,
  input: UpdateProductInput,
): Promise<Product> {
  const existingProduct = await prisma.product.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      inventory: true,
    },
  });

  if (!existingProduct) {
    throw new ProductNotFoundError();
  }

  const nextSlug = input.slug
    ? normalizeSlug(input.slug)
    : existingProduct.slug;

  const nextSku = input.sku
    ? input.sku.trim().toUpperCase()
    : existingProduct.sku;

  await ensureProductUnique(nextSlug, nextSku, existingProduct.id);

  const data: Prisma.ProductUpdateInput = {
    name: input.name,
    slug: nextSlug,
    description: input.description,

    price: input.price,
    category: input.category
      ? categoryToDatabase[input.category]
      : undefined,
    sku: nextSku,

    image: input.image,
    images: input.images
      ? uniqueStrings(input.images)
      : undefined,

    colors: input.colors
      ? uniqueStrings(input.colors)
      : undefined,

    sizes: input.sizes
      ? uniqueStrings(input.sizes)
      : undefined,

    rating: input.rating,
    reviewCount: input.reviewCount,

    isFeatured: input.isFeatured,
    isNew: input.isNew,
    isActive: input.isActive,

    inventory:
      input.stock !== undefined
        ? {
            upsert: {
              create: {
                quantity: input.stock,
                reservedQuantity: 0,
              },
              update: {
                quantity: input.stock,
              },
            },
          }
        : undefined,
  };

  if (Object.prototype.hasOwnProperty.call(input, "originalPrice")) {
    data.originalPrice = input.originalPrice ?? null;
  }

  const product = await prisma.product.update({
    where: {
      id: existingProduct.id,
    },
    data,
    include: {
      inventory: true,
    },
  });

  return serializeProduct(product);
}

export async function deleteProduct(
  idOrSlug: string,
): Promise<{ id: string }> {
  const existingProduct = await prisma.product.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    select: {
      id: true,
    },
  });

  if (!existingProduct) {
    throw new ProductNotFoundError();
  }

  await prisma.product.delete({
    where: {
      id: existingProduct.id,
    },
  });

  return {
    id: existingProduct.id,
  };
}