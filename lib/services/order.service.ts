import { randomUUID } from "node:crypto";

import {
  ActivityStatus,
  PaymentMethod as DatabasePaymentMethod,
  PaymentStatus as DatabasePaymentStatus,
  Prisma,
} from "@/generated/prisma/client";

import prisma from "@/lib/db/prisma";

import type { CreateOrderInput } from "@/schemas/order.schema";

import type {
  Order,
  PaymentMethod,
} from "@/types/order";

const orderInclude = {
  items: {
    orderBy: {
      createdAt: "asc",
    },
  },
} satisfies Prisma.OrderInclude;

type OrderRecord = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

const paymentMethodToDatabase: Record<
  PaymentMethod,
  DatabasePaymentMethod
> = {
  CASH_ON_DELIVERY:
    DatabasePaymentMethod.CASH_ON_DELIVERY,

  MOCK_CARD:
    DatabasePaymentMethod.MOCK_CARD,
};

export class EmptyCartError extends Error {
  constructor() {
    super(
      "Your cart is empty. Add a product before placing an order.",
    );

    this.name = "EmptyCartError";
  }
}

export class OrderNotFoundError extends Error {
  constructor() {
    super("Order not found.");
    this.name = "OrderNotFoundError";
  }
}

export class OrderStockError extends Error {
  productName: string;
  availableStock: number;

  constructor(
    productName: string,
    availableStock: number,
  ) {
    super(
      availableStock > 0
        ? `Only ${availableStock} unit(s) of "${productName}" are currently available.`
        : `"${productName}" is currently out of stock.`,
    );

    this.name = "OrderStockError";
    this.productName = productName;
    this.availableStock = availableStock;
  }
}

function generateOrderNumber(): string {
  const datePart = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  const randomPart = randomUUID()
    .slice(0, 8)
    .toUpperCase();

  return `NOVA-${datePart}-${randomPart}`;
}

function serializeOrder(
  order: OrderRecord,
): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,

    userId: order.userId,

    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,

    shippingCountry:
      order.shippingCountry,

    shippingCity: order.shippingCity,
    shippingAddress:
      order.shippingAddress,

    shippingPostalCode:
      order.shippingPostalCode,

    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,

    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    discount: Number(order.discount),
    total: Number(order.total),

    notes: order.notes,

    items: order.items.map((item) => ({
      id: item.id,

      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,

      selectedColor:
        item.selectedColor,

      selectedSize:
        item.selectedSize,

      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(
        item.totalPrice,
      ),

      createdAt:
        item.createdAt.toISOString(),
    })),

    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export async function createOrder(
  userId: string,
  input: CreateOrderInput,
): Promise<Order> {
  const order =
    await prisma.$transaction(
      async (transaction) => {
        const cart =
          await transaction.cart.findUnique({
            where: {
              userId,
            },

            include: {
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
            },
          });

        if (
          !cart ||
          cart.items.length === 0
        ) {
          throw new EmptyCartError();
        }

        for (const item of cart.items) {
          const inventory =
            item.product.inventory;

          const availableStock =
            inventory
              ? Math.max(
                  0,
                  inventory.quantity -
                    inventory.reservedQuantity,
                )
              : 0;

          if (
            !item.product.isActive ||
            item.quantity > availableStock
          ) {
            throw new OrderStockError(
              item.product.name,
              availableStock,
            );
          }
        }

        const subtotal = Number(
          cart.items
            .reduce(
              (total, item) =>
                total +
                Number(item.product.price) *
                  item.quantity,
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

        for (const item of cart.items) {
          const inventory =
            item.product.inventory;

          if (!inventory) {
            throw new OrderStockError(
              item.product.name,
              0,
            );
          }

          const minimumQuantity =
            item.quantity +
            inventory.reservedQuantity;

          const inventoryUpdate =
            await transaction.inventory.updateMany(
              {
                where: {
                  id: inventory.id,

                  quantity: {
                    gte: minimumQuantity,
                  },
                },

                data: {
                  quantity: {
                    decrement: item.quantity,
                  },
                },
              },
            );

          if (
            inventoryUpdate.count !== 1
          ) {
            const currentInventory =
              await transaction.inventory.findUnique(
                {
                  where: {
                    id: inventory.id,
                  },

                  select: {
                    quantity: true,
                    reservedQuantity: true,
                  },
                },
              );

            const availableStock =
              currentInventory
                ? Math.max(
                    0,
                    currentInventory.quantity -
                      currentInventory.reservedQuantity,
                  )
                : 0;

            throw new OrderStockError(
              item.product.name,
              availableStock,
            );
          }
        }

        const paymentMethod =
          paymentMethodToDatabase[
            input.paymentMethod
          ];

        const paymentStatus =
          paymentMethod ===
          DatabasePaymentMethod.MOCK_CARD
            ? DatabasePaymentStatus.PAID
            : DatabasePaymentStatus.PENDING;

        const createdOrder =
          await transaction.order.create({
            data: {
              orderNumber:
                generateOrderNumber(),

              userId,

              customerName:
                input.customerName,

              customerEmail:
                input.customerEmail,

              customerPhone:
                input.customerPhone ?? null,

              shippingCountry:
                input.shippingCountry,

              shippingCity:
                input.shippingCity,

              shippingAddress:
                input.shippingAddress,

              shippingPostalCode:
                input.shippingPostalCode,

              paymentMethod,
              paymentStatus,

              subtotal,
              shipping,
              discount,
              total,

              notes: input.notes ?? null,

              items: {
                create: cart.items.map(
                  (item) => {
                    const unitPrice = Number(
                      item.product.price,
                    );

                    return {
                      productId:
                        item.product.id,

                      productName:
                        item.product.name,

                      productImage:
                        item.product.image,

                      selectedColor:
                        item.selectedColor,

                      selectedSize:
                        item.selectedSize,

                      quantity:
                        item.quantity,

                      unitPrice,

                      totalPrice: Number(
                        (
                          unitPrice *
                          item.quantity
                        ).toFixed(2),
                      ),
                    };
                  },
                ),
              },
            },

            include: orderInclude,
          });

        await transaction.cartItem.deleteMany(
          {
            where: {
              cartId: cart.id,
            },
          },
        );

        await transaction.user.update({
          where: {
            id: userId,
          },

          data: {
            name: input.customerName,
            phone:
              input.customerPhone ?? null,

            country:
              input.shippingCountry,

            city: input.shippingCity,

            address:
              input.shippingAddress,

            postalCode:
              input.shippingPostalCode,
          },
        });

        await transaction.activityLog.create({
          data: {
            userId,

            action: "CREATE_ORDER",
            entity: "ORDER",
            entityId: createdOrder.id,

            description: `Order ${createdOrder.orderNumber} was placed.`,

            status:
              ActivityStatus.SUCCESS,

            metadata: {
              orderNumber:
                createdOrder.orderNumber,

              itemCount: cart.items.reduce(
                (count, item) =>
                  count + item.quantity,
                0,
              ),

              total,
            },
          },
        });

        return createdOrder;
      },
    );

  return serializeOrder(order);
}

export async function listOrdersForUser(
  userId: string,
): Promise<Order[]> {
  const orders =
    await prisma.order.findMany({
      where: {
        userId,
      },

      include: orderInclude,

      orderBy: {
        createdAt: "desc",
      },
    });

  return orders.map(serializeOrder);
}

export async function getOrderForUser(
  userId: string,
  idOrOrderNumber: string,
): Promise<Order> {
  const order =
    await prisma.order.findFirst({
      where: {
        userId,

        OR: [
          {
            id: idOrOrderNumber,
          },
          {
            orderNumber:
              idOrOrderNumber,
          },
        ],
      },

      include: orderInclude,
    });

  if (!order) {
    throw new OrderNotFoundError();
  }

  return serializeOrder(order);
}