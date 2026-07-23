import "dotenv/config";

import { randomUUID } from "node:crypto";

import {
  ProductCategory,
  UserRole,
} from "../generated/prisma/client";

import prisma from "../lib/db/prisma";

import {
  addCartItem,
  getCart,
  updateCartItem,
} from "../lib/services/cart.service";

import {
  AdminOrderTransitionError,
  updateAdminOrder,
} from "../lib/services/admin-order.service";
import { createOrder } from "../lib/services/order.service";

function assert(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const runId = randomUUID();
const email =
  `concurrency-${runId}@example.test`;
const sku =
  `CONCURRENCY-${runId}`;
const slug =
  `concurrency-${runId}`;

let userId: string | null = null;
let productId: string | null = null;
let orderId: string | null = null;

try {
  const user = await prisma.user.create({
    data: {
      name: "Concurrency Verification",
      email,
      passwordHash:
        "verification-only-not-authenticatable",
      role: UserRole.ADMIN,
      cart: {
        create: {},
      },
    },
  });

  userId = user.id;

  const product =
    await prisma.product.create({
      data: {
        name:
          "Concurrency Verification Product",
        slug,
        description:
          "Temporary product for safe concurrency verification.",
        price: 25,
        category:
          ProductCategory.ACCESSORIES,
        sku,
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        images: [],
        colors: ["Black"],
        sizes: ["M", "L"],
        inventory: {
          create: {
            quantity: 22,
            reservedQuantity: 0,
          },
        },
      },
    });

  productId = product.id;

  const concurrentCartResults =
    await Promise.allSettled([
      addCartItem(user.id, {
        productId: product.id,
        quantity: 12,
        selectedColor: "Black",
        selectedSize: "M",
      }),
      addCartItem(user.id, {
        productId: product.id,
        quantity: 12,
        selectedColor: "Black",
        selectedSize: "L",
      }),
    ]);

  const cartAfterConcurrency =
    await getCart(user.id);

  const aggregateQuantity =
    cartAfterConcurrency.items.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    );

  assert(
    aggregateQuantity <= 22,
    "Concurrent cart mutations exceeded available stock.",
  );

  assert(
    concurrentCartResults.filter(
      (result) =>
        result.status === "fulfilled",
    ).length === 1,
    "Exactly one overcommitting cart mutation should succeed.",
  );

  await prisma.cartItem.deleteMany({
    where: {
      cart: {
        userId: user.id,
      },
    },
  });

  await addCartItem(user.id, {
    productId: product.id,
    quantity: 5,
    selectedColor: "Black",
    selectedSize: "M",
  });

  await addCartItem(user.id, {
    productId: product.id,
    quantity: 6,
    selectedColor: "Black",
    selectedSize: "L",
  });

  const cartBeforeMerge =
    await getCart(user.id);

  const mediumItem =
    cartBeforeMerge.items.find(
      (item) =>
        item.selectedSize === "M",
    );

  assert(
    mediumItem,
    "Medium cart item was not created.",
  );

  const mergedCart =
    await updateCartItem(
      user.id,
      mediumItem.id,
      {
        selectedSize: "L",
      },
    );

  assert(
    mergedCart.items.length === 1 &&
      mergedCart.items[0]
        ?.selectedSize === "L" &&
      mergedCart.items[0].quantity ===
        11,
    "Variant collision did not merge quantities safely.",
  );

  await prisma.cartItem.deleteMany({
    where: {
      cart: {
        userId: user.id,
      },
    },
  });

  await addCartItem(user.id, {
    productId: product.id,
    quantity: 2,
    selectedColor: "Black",
    selectedSize: "M",
  });

  const idempotencyKey =
    randomUUID();

  const checkoutInput = {
    customerName:
      "Concurrency Verification",
    customerEmail: email,
    shippingCountry: "AZ",
    shippingCity: "Baku",
    shippingAddress:
      "Verification address 1",
    shippingPostalCode: "AZ1000",
    paymentMethod:
      "MOCK_CARD" as const,
  };

  const checkoutResults =
    await Promise.all([
      createOrder(
        user.id,
        idempotencyKey,
        checkoutInput,
      ),
      createOrder(
        user.id,
        idempotencyKey,
        checkoutInput,
      ),
    ]);

  orderId =
    checkoutResults[0].order.id;

  assert(
    checkoutResults[0].order.id ===
      checkoutResults[1].order.id,
    "Idempotent checkout returned different orders.",
  );

  const orderCount =
    await prisma.order.count({
      where: {
        userId: user.id,
        idempotencyKey,
      },
    });

  assert(
    orderCount === 1,
    "Idempotent checkout created more than one order.",
  );

  const inventoryAfterCheckout =
    await prisma.inventory.findUniqueOrThrow(
      {
        where: {
          productId: product.id,
        },
      },
    );

  assert(
    inventoryAfterCheckout.quantity ===
      20,
    "Checkout decremented inventory more than once.",
  );

  await Promise.all([
    updateAdminOrder(
      user.id,
      orderId,
      {
        status: "CANCELLED",
      },
    ),
    updateAdminOrder(
      user.id,
      orderId,
      {
        status: "CANCELLED",
      },
    ),
  ]);

  const [
    cancelledOrder,
    inventoryAfterCancellation,
    cancellationAuditCount,
  ] = await Promise.all([
    prisma.order.findUniqueOrThrow({
      where: {
        id: orderId,
      },
    }),
    prisma.inventory.findUniqueOrThrow(
      {
        where: {
          productId: product.id,
        },
      },
    ),
    prisma.activityLog.count({
      where: {
        entity: "ORDER",
        entityId: orderId,
        action: "UPDATE_ORDER",
      },
    }),
  ]);

  assert(
    cancelledOrder.status ===
      "CANCELLED" &&
      cancelledOrder.paymentStatus ===
        "REFUNDED",
    "Cancellation did not produce a cancelled, refunded order.",
  );

  assert(
    inventoryAfterCancellation.quantity ===
      22,
    "Concurrent cancellation restored inventory more than once.",
  );

  assert(
    cancellationAuditCount === 1,
    "Concurrent cancellation wrote more than one success audit record.",
  );

  let reopeningRejected = false;

  try {
    await updateAdminOrder(
      user.id,
      orderId,
      {
        status: "PROCESSING",
      },
    );
  } catch (error) {
    reopeningRejected =
      error instanceof
      AdminOrderTransitionError;
  }

  assert(
    reopeningRejected,
    "A cancelled order was allowed to reopen.",
  );

  let refundedToPaidRejected =
    false;

  try {
    await updateAdminOrder(
      user.id,
      orderId,
      {
        paymentStatus: "PAID",
      },
    );
  } catch (error) {
    refundedToPaidRejected =
      error instanceof
      AdminOrderTransitionError;
  }

  assert(
    refundedToPaidRejected,
    "A refunded order was allowed to become paid.",
  );

  console.log(
    "Critical concurrency verification passed.",
  );
} finally {
  if (userId) {
    const verificationOrders =
      await prisma.order.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
        },
      });

    const verificationOrderIds =
      verificationOrders.map(
        (order) => order.id,
      );

    await prisma.activityLog.deleteMany({
      where: {
        OR: [
          {
            userId,
          },
          {
            entity: "ORDER",
            entityId: {
              in:
                verificationOrderIds,
            },
          },
        ],
      },
    });

    await prisma.order.deleteMany({
      where: {
        userId,
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: userId,
      },
    });
  }

  if (productId) {
    await prisma.product.deleteMany({
      where: {
        id: productId,
      },
    });
  }

  await prisma.$disconnect();
}
