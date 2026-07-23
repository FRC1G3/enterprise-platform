import {
  ActivityStatus,
  OrderStatus as DatabaseOrderStatus,
  PaymentStatus as DatabasePaymentStatus,
  Prisma,
} from "@/generated/prisma/client";

import prisma from "@/lib/db/prisma";
import { runSerializableTransaction } from "@/lib/db/serializable-transaction";

import type {
  AdminOrderQueryInput,
  UpdateAdminOrderInput,
} from "@/schemas/admin-order.schema";

import type {
  AdminOrderListItem,
  AdminOrderListResult,
} from "@/types/admin-order";

import type {
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/types/order";

const orderInclude = {
  items: {
    orderBy: {
      createdAt: "asc",
    },
  },
} satisfies Prisma.OrderInclude;

const orderListSelect = {
  id: true,
  orderNumber: true,

  customerName: true,
  customerEmail: true,

  status: true,
  paymentStatus: true,
  paymentMethod: true,

  total: true,

  createdAt: true,
  updatedAt: true,

  _count: {
    select: {
      items: true,
    },
  },
} satisfies Prisma.OrderSelect;

type OrderRecord =
  Prisma.OrderGetPayload<{
    include: typeof orderInclude;
  }>;

type OrderListRecord =
  Prisma.OrderGetPayload<{
    select: typeof orderListSelect;
  }>;

const orderStatusToDatabase: Record<
  OrderStatus,
  DatabaseOrderStatus
> = {
  PENDING:
    DatabaseOrderStatus.PENDING,

  CONFIRMED:
    DatabaseOrderStatus.CONFIRMED,

  PROCESSING:
    DatabaseOrderStatus.PROCESSING,

  SHIPPED:
    DatabaseOrderStatus.SHIPPED,

  DELIVERED:
    DatabaseOrderStatus.DELIVERED,

  CANCELLED:
    DatabaseOrderStatus.CANCELLED,
};

const paymentStatusToDatabase: Record<
  PaymentStatus,
  DatabasePaymentStatus
> = {
  PENDING:
    DatabasePaymentStatus.PENDING,

  PAID:
    DatabasePaymentStatus.PAID,

  FAILED:
    DatabasePaymentStatus.FAILED,

  REFUNDED:
    DatabasePaymentStatus.REFUNDED,
};

const allowedOrderTransitions: Record<
  DatabaseOrderStatus,
  readonly DatabaseOrderStatus[]
> = {
  PENDING: [
    DatabaseOrderStatus.CONFIRMED,
    DatabaseOrderStatus.PROCESSING,
    DatabaseOrderStatus.CANCELLED,
  ],
  CONFIRMED: [
    DatabaseOrderStatus.PROCESSING,
    DatabaseOrderStatus.CANCELLED,
  ],
  PROCESSING: [
    DatabaseOrderStatus.SHIPPED,
    DatabaseOrderStatus.CANCELLED,
  ],
  SHIPPED: [
    DatabaseOrderStatus.DELIVERED,
  ],
  DELIVERED: [],
  CANCELLED: [],
};

const allowedPaymentTransitions: Record<
  DatabasePaymentStatus,
  readonly DatabasePaymentStatus[]
> = {
  PENDING: [
    DatabasePaymentStatus.PAID,
    DatabasePaymentStatus.FAILED,
  ],
  PAID: [
    DatabasePaymentStatus.REFUNDED,
  ],
  FAILED: [
    DatabasePaymentStatus.PENDING,
  ],
  REFUNDED: [],
};

export class AdminOrderNotFoundError extends Error {
  constructor() {
    super("Order not found.");
    this.name =
      "AdminOrderNotFoundError";
  }
}

export class AdminOrderTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name =
      "AdminOrderTransitionError";
  }
}

function serializeOrder(
  order: OrderRecord,
): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,

    userId: order.userId,

    customerName:
      order.customerName,

    customerEmail:
      order.customerEmail,

    customerPhone:
      order.customerPhone,

    shippingCountry:
      order.shippingCountry,

    shippingCity:
      order.shippingCity,

    shippingAddress:
      order.shippingAddress,

    shippingPostalCode:
      order.shippingPostalCode,

    status: order.status,
    paymentStatus:
      order.paymentStatus,

    paymentMethod:
      order.paymentMethod,

    subtotal:
      Number(order.subtotal),

    shipping:
      Number(order.shipping),

    discount:
      Number(order.discount),

    total:
      Number(order.total),

    notes: order.notes,

    items: order.items.map(
      (item) => ({
        id: item.id,

        productId:
          item.productId,

        productName:
          item.productName,

        productImage:
          item.productImage,

        selectedColor:
          item.selectedColor,

        selectedSize:
          item.selectedSize,

        quantity:
          item.quantity,

        unitPrice:
          Number(item.unitPrice),

        totalPrice:
          Number(item.totalPrice),

        createdAt:
          item.createdAt.toISOString(),
      }),
    ),

    createdAt:
      order.createdAt.toISOString(),

    updatedAt:
      order.updatedAt.toISOString(),
  };
}

function serializeOrderListItem(
  order: OrderListRecord,
): AdminOrderListItem {
  return {
    id: order.id,
    orderNumber:
      order.orderNumber,

    customerName:
      order.customerName,

    customerEmail:
      order.customerEmail,

    status: order.status,
    paymentStatus:
      order.paymentStatus,

    paymentMethod:
      order.paymentMethod,

    itemCount:
      order._count.items,

    total:
      Number(order.total),

    createdAt:
      order.createdAt.toISOString(),

    updatedAt:
      order.updatedAt.toISOString(),
  };
}

function buildOrderWhere(
  input: AdminOrderQueryInput,
): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput =
    {};

  if (input.search) {
    where.OR = [
      {
        orderNumber: {
          contains: input.search,
          mode: "insensitive",
        },
      },
      {
        customerName: {
          contains: input.search,
          mode: "insensitive",
        },
      },
      {
        customerEmail: {
          contains: input.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (input.status) {
    where.status =
      orderStatusToDatabase[
        input.status
      ];
  }

  if (input.paymentStatus) {
    where.paymentStatus =
      paymentStatusToDatabase[
        input.paymentStatus
      ];
  }

  if (input.date) {
    const startDate = new Date(
      `${input.date}T00:00:00.000Z`,
    );

    const endDate = new Date(
      `${input.date}T23:59:59.999Z`,
    );

    where.createdAt = {
      gte: startDate,
      lte: endDate,
    };
  }

  return where;
}

export async function listAdminOrders(
  input: AdminOrderQueryInput,
): Promise<AdminOrderListResult> {
  const where =
    buildOrderWhere(input);

  const skip =
    (input.page - 1) * input.limit;

  const [orders, total] =
    await prisma.$transaction([
      prisma.order.findMany({
        where,

        select: orderListSelect,

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take: input.limit,
      }),

      prisma.order.count({
        where,
      }),
    ]);

  return {
    orders:
      orders.map(
        serializeOrderListItem,
      ),

    pagination: {
      page: input.page,
      limit: input.limit,
      total,

      totalPages: Math.max(
        1,
        Math.ceil(
          total / input.limit,
        ),
      ),
    },
  };
}

export async function getAdminOrder(
  idOrOrderNumber: string,
): Promise<Order> {
  const order =
    await prisma.order.findFirst({
      where: {
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
    throw new AdminOrderNotFoundError();
  }

  return serializeOrder(order);
}

export async function updateAdminOrder(
  adminUserId: string,
  idOrOrderNumber: string,
  input: UpdateAdminOrderInput,
): Promise<Order> {
  const updatedOrder =
    await runSerializableTransaction(
      async (transaction) => {
        const order =
          await transaction.order.findFirst({
            where: {
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
          throw new AdminOrderNotFoundError();
        }

        const nextStatus =
          input.status
            ? orderStatusToDatabase[
                input.status
              ]
            : order.status;

        let nextPaymentStatus =
          input.paymentStatus
            ? paymentStatusToDatabase[
                input.paymentStatus
              ]
            : order.paymentStatus;

        const statusChanged =
          nextStatus !== order.status;

        if (
          statusChanged &&
          !allowedOrderTransitions[
            order.status
          ].includes(nextStatus)
        ) {
          throw new AdminOrderTransitionError(
            `Order status cannot move from ${order.status} to ${nextStatus}.`,
          );
        }

        const isBeingCancelled =
          nextStatus ===
            DatabaseOrderStatus.CANCELLED &&
          statusChanged;

        if (isBeingCancelled) {
          if (
            order.paymentStatus ===
              DatabasePaymentStatus.PAID
          ) {
            if (
              input.paymentStatus !==
                undefined &&
              paymentStatusToDatabase[
                input.paymentStatus
              ] !==
                DatabasePaymentStatus.REFUNDED
            ) {
              throw new AdminOrderTransitionError(
                "A paid order must be refunded when it is cancelled.",
              );
            }

            nextPaymentStatus =
              DatabasePaymentStatus.REFUNDED;
          }
        }

        if (
          order.status ===
            DatabaseOrderStatus.CANCELLED &&
          nextPaymentStatus !==
            order.paymentStatus
        ) {
          throw new AdminOrderTransitionError(
            "Payment status cannot change after an order is cancelled.",
          );
        }

        const paymentStatusChanged =
          nextPaymentStatus !==
          order.paymentStatus;

        if (
          paymentStatusChanged &&
          !allowedPaymentTransitions[
            order.paymentStatus
          ].includes(
            nextPaymentStatus,
          )
        ) {
          throw new AdminOrderTransitionError(
            `Payment status cannot move from ${order.paymentStatus} to ${nextPaymentStatus}.`,
          );
        }

        if (
          !statusChanged &&
          !paymentStatusChanged
        ) {
          return order;
        }

        const transition =
          await transaction.order.updateMany({
            where: {
              id: order.id,
              status: order.status,
              paymentStatus:
                order.paymentStatus,
            },

            data: {
              status: nextStatus,
              paymentStatus:
                nextPaymentStatus,
            },
          });

        if (transition.count !== 1) {
          throw new AdminOrderTransitionError(
            "Order changed while the update was being processed. Refresh and try again.",
          );
        }

        if (isBeingCancelled) {
          for (const item of order.items) {
            if (!item.productId) {
              continue;
            }

            await transaction.inventory.updateMany(
              {
                where: {
                  productId:
                    item.productId,
                },

                data: {
                  quantity: {
                    increment:
                      item.quantity,
                  },
                },
              },
            );
          }
        }

        const savedOrder =
          await transaction.order.findUnique({
            where: {
              id: order.id,
            },

            include: orderInclude,
          });

        if (!savedOrder) {
          throw new AdminOrderNotFoundError();
        }

        await transaction.activityLog.create({
          data: {
            userId: adminUserId,

            action:
              "UPDATE_ORDER",

            entity: "ORDER",

            entityId:
              savedOrder.id,

            description:
              `Order ${savedOrder.orderNumber} was updated.`,

            status:
              ActivityStatus.SUCCESS,

            metadata: {
              previousStatus:
                order.status,

              newStatus:
                savedOrder.status,

              previousPaymentStatus:
                order.paymentStatus,

              newPaymentStatus:
                savedOrder.paymentStatus,

              internalNote:
                input.internalNote ??
                null,
            },
          },
        });

        return savedOrder;
      },
    );

  return serializeOrder(
    updatedOrder,
  );
}
