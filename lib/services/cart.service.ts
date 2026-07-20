import { Prisma } from "@/generated/prisma/client";

import prisma from "@/lib/db/prisma";

import type {
  AddCartItemInput,
  UpdateCartItemInput,
} from "@/schemas/cart.schema";

import type {
  Cart,
  CartItem,
} from "@/types/cart";

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          inventory: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
} satisfies Prisma.CartInclude;

type CartRecord = Prisma.CartGetPayload<{
  include: typeof cartInclude;
}>;

type CartItemRecord =
  CartRecord["items"][number];

export class CartProductNotFoundError extends Error {
  constructor() {
    super(
      "Product is unavailable or no longer exists.",
    );

    this.name =
      "CartProductNotFoundError";
  }
}

export class CartItemNotFoundError extends Error {
  constructor() {
    super("Cart item not found.");
    this.name = "CartItemNotFoundError";
  }
}

export class CartValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartValidationError";
  }
}

export class CartStockError extends Error {
  availableStock: number;

  constructor(availableStock: number) {
    super(
      availableStock > 0
        ? `Only ${availableStock} ${
            availableStock === 1
              ? "item is"
              : "items are"
          } currently available.`
        : "This product is currently out of stock.",
    );

    this.name = "CartStockError";
    this.availableStock = availableStock;
  }
}

function getAvailableStock(
  item: CartItemRecord,
): number {
  return Math.max(
    0,
    (item.product.inventory?.quantity ?? 0) -
      (item.product.inventory
        ?.reservedQuantity ?? 0),
  );
}

function serializeCartItem(
  item: CartItemRecord,
): CartItem {
  const price = Number(item.product.price);
  const stock = getAvailableStock(item);

  return {
    id: item.id,
    quantity: item.quantity,

    selectedColor: item.selectedColor,
    selectedSize: item.selectedSize,

    lineTotal: Number(
      (price * item.quantity).toFixed(2),
    ),

    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price,
      image: item.product.image,

      stock,
      colors: item.product.colors,
      sizes: item.product.sizes,

      isActive: item.product.isActive,
    },

    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function serializeCart(
  cart: CartRecord,
): Cart {
  const items =
    cart.items.map(serializeCartItem);

  const itemCount = items.reduce(
    (total, item) =>
      total + item.quantity,
    0,
  );

  const subtotal = Number(
    items
      .reduce(
        (total, item) =>
          total + item.lineTotal,
        0,
      )
      .toFixed(2),
  );

  const shipping =
    subtotal === 0 || subtotal >= 100
      ? 0
      : 12;

  const discount = 0;

  const total = Number(
    (
      subtotal +
      shipping -
      discount
    ).toFixed(2),
  );

  return {
    id: cart.id,
    userId: cart.userId,

    items,

    totals: {
      itemCount,
      subtotal,
      shipping,
      discount,
      total,
    },

    createdAt:
      cart.createdAt.toISOString(),

    updatedAt:
      cart.updatedAt.toISOString(),
  };
}

function resolveProductSelection(
  value: string | null | undefined,
  options: string[],
  label: "color" | "size",
): string | null {
  if (options.length === 0) {
    return null;
  }

  if (!value) {
    throw new CartValidationError(
      `Please select a ${label}.`,
    );
  }

  const matchingOption = options.find(
    (option) => option === value,
  );

  if (!matchingOption) {
    throw new CartValidationError(
      `The selected ${label} is not available for this product.`,
    );
  }

  return matchingOption;
}

async function loadCart(
  userId: string,
): Promise<CartRecord> {
  return prisma.cart.upsert({
    where: {
      userId,
    },

    update: {},

    create: {
      userId,
    },

    include: cartInclude,
  });
}

export async function getCart(
  userId: string,
): Promise<Cart> {
  const cart = await loadCart(userId);

  return serializeCart(cart);
}

export async function addCartItem(
  userId: string,
  input: AddCartItemInput,
): Promise<Cart> {
  const cart = await prisma.$transaction(
    async (transaction) => {
      const product =
        await transaction.product.findUnique({
          where: {
            id: input.productId,
          },

          include: {
            inventory: true,
          },
        });

      if (!product || !product.isActive) {
        throw new CartProductNotFoundError();
      }

      const availableStock = Math.max(
        0,
        (product.inventory?.quantity ?? 0) -
          (product.inventory
            ?.reservedQuantity ?? 0),
      );

      const selectedColor =
        resolveProductSelection(
          input.selectedColor,
          product.colors,
          "color",
        );

      const selectedSize =
        resolveProductSelection(
          input.selectedSize,
          product.sizes,
          "size",
        );

      const userCart =
        await transaction.cart.upsert({
          where: {
            userId,
          },

          update: {},

          create: {
            userId,
          },

          select: {
            id: true,
          },
        });

      const existingItem =
        await transaction.cartItem.findFirst({
          where: {
            cartId: userCart.id,
            productId: product.id,
            selectedColor,
            selectedSize,
          },
        });

      const nextQuantity =
        (existingItem?.quantity ?? 0) +
        input.quantity;

      if (
        availableStock === 0 ||
        nextQuantity > availableStock
      ) {
        throw new CartStockError(
          availableStock,
        );
      }

      if (existingItem) {
        await transaction.cartItem.update({
          where: {
            id: existingItem.id,
          },

          data: {
            quantity: nextQuantity,
          },
        });
      } else {
        await transaction.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: product.id,
            quantity: input.quantity,
            selectedColor,
            selectedSize,
          },
        });
      }

      const updatedCart =
        await transaction.cart.findUnique({
          where: {
            id: userCart.id,
          },

          include: cartInclude,
        });

      if (!updatedCart) {
        throw new Error(
          "Cart could not be loaded after adding the item.",
        );
      }

      return updatedCart;
    },
  );

  return serializeCart(cart);
}

export async function updateCartItem(
  userId: string,
  itemId: string,
  input: UpdateCartItemInput,
): Promise<Cart> {
  const cart = await prisma.$transaction(
    async (transaction) => {
      const existingItem =
        await transaction.cartItem.findFirst({
          where: {
            id: itemId,

            cart: {
              userId,
            },
          },

          include: {
            product: {
              include: {
                inventory: true,
              },
            },

            cart: {
              select: {
                id: true,
              },
            },
          },
        });

      if (!existingItem) {
        throw new CartItemNotFoundError();
      }

      if (
        !existingItem.product.isActive
      ) {
        throw new CartProductNotFoundError();
      }

      const availableStock = Math.max(
        0,
        (existingItem.product.inventory
          ?.quantity ?? 0) -
          (existingItem.product.inventory
            ?.reservedQuantity ?? 0),
      );

      const nextQuantity =
        input.quantity ??
        existingItem.quantity;

      if (
        availableStock === 0 ||
        nextQuantity > availableStock
      ) {
        throw new CartStockError(
          availableStock,
        );
      }

      const selectedColor =
        Object.prototype.hasOwnProperty.call(
          input,
          "selectedColor",
        )
          ? resolveProductSelection(
              input.selectedColor,
              existingItem.product.colors,
              "color",
            )
          : existingItem.selectedColor;

      const selectedSize =
        Object.prototype.hasOwnProperty.call(
          input,
          "selectedSize",
        )
          ? resolveProductSelection(
              input.selectedSize,
              existingItem.product.sizes,
              "size",
            )
          : existingItem.selectedSize;

      await transaction.cartItem.update({
        where: {
          id: existingItem.id,
        },

        data: {
          quantity: nextQuantity,
          selectedColor,
          selectedSize,
        },
      });

      const updatedCart =
        await transaction.cart.findUnique({
          where: {
            id: existingItem.cart.id,
          },

          include: cartInclude,
        });

      if (!updatedCart) {
        throw new Error(
          "Cart could not be loaded after updating the item.",
        );
      }

      return updatedCart;
    },
  );

  return serializeCart(cart);
}

export async function removeCartItem(
  userId: string,
  itemId: string,
): Promise<Cart> {
  const cart = await prisma.$transaction(
    async (transaction) => {
      const existingItem =
        await transaction.cartItem.findFirst({
          where: {
            id: itemId,

            cart: {
              userId,
            },
          },

          include: {
            cart: {
              select: {
                id: true,
              },
            },
          },
        });

      if (!existingItem) {
        throw new CartItemNotFoundError();
      }

      await transaction.cartItem.delete({
        where: {
          id: existingItem.id,
        },
      });

      const updatedCart =
        await transaction.cart.findUnique({
          where: {
            id: existingItem.cart.id,
          },

          include: cartInclude,
        });

      if (!updatedCart) {
        throw new Error(
          "Cart could not be loaded after removing the item.",
        );
      }

      return updatedCart;
    },
  );

  return serializeCart(cart);
}