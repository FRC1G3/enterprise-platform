import {
  OrderStatus as DatabaseOrderStatus,
  ProductCategory,
  UserRole,
} from "@/generated/prisma/client";

import prisma from "@/lib/db/prisma";

import type {
  AdminAnalyticsData,
  AdminDashboardData,
  AnalyticsMetric,
  CategorySalesItem,
  CustomerGrowthPoint,
  OrderStatusDistributionItem,
  SalesTrendPoint,
  TopProductItem,
} from "@/types/analytics";

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  );
}

function addUtcDays(
  date: Date,
  amount: number,
): Date {
  const nextDate = new Date(date);

  nextDate.setUTCDate(
    nextDate.getUTCDate() + amount,
  );

  return nextDate;
}

function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(
  date: Date,
  periodDays: number,
): string {
  if (periodDays <= 7) {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        weekday: "short",
        timeZone: "UTC",
      },
    ).format(date);
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    },
  ).format(date);
}

function roundCurrency(
  value: number,
): number {
  return Number(value.toFixed(2));
}

function calculateChangePercentage(
  currentValue: number,
  previousValue: number,
): number | null {
  if (previousValue === 0) {
    return currentValue === 0
      ? 0
      : null;
  }

  return Number(
    (
      ((currentValue - previousValue) /
        previousValue) *
      100
    ).toFixed(1),
  );
}

function createMetric(
  value: number,
  previousValue: number,
): AnalyticsMetric {
  return {
    value,
    previousValue,

    changePercentage:
      calculateChangePercentage(
        value,
        previousValue,
      ),
  };
}

function formatCategory(
  category: ProductCategory | null,
): string {
  if (
    category ===
    ProductCategory.ACCESSORIES
  ) {
    return "Accessories";
  }

  if (
    category === ProductCategory.MEN
  ) {
    return "Men";
  }

  if (
    category === ProductCategory.WOMEN
  ) {
    return "Women";
  }

  if (
    category === ProductCategory.SHOES
  ) {
    return "Shoes";
  }

  return "Uncategorized";
}

function createDateRange(
  periodDays: number,
) {
  const endDate = new Date();

  const startDate = startOfUtcDay(
    addUtcDays(
      endDate,
      -(periodDays - 1),
    ),
  );

  const previousStartDate =
    startOfUtcDay(
      addUtcDays(
        startDate,
        -periodDays,
      ),
    );

  return {
    endDate,
    startDate,
    previousStartDate,
  };
}

function createSalesTrend(
  periodDays: number,
  startDate: Date,
  orders: Array<{
    createdAt: Date;
    total: unknown;
    status: DatabaseOrderStatus;
  }>,
): SalesTrendPoint[] {
  const buckets = new Map<
    string,
    SalesTrendPoint
  >();

  for (
    let dayIndex = 0;
    dayIndex < periodDays;
    dayIndex += 1
  ) {
    const date = addUtcDays(
      startDate,
      dayIndex,
    );

    const key = getDateKey(date);

    buckets.set(key, {
      date: key,
      label: formatDateLabel(
        date,
        periodDays,
      ),
      revenue: 0,
      orders: 0,
    });
  }

  for (const order of orders) {
    const key = getDateKey(
      order.createdAt,
    );

    const bucket = buckets.get(key);

    if (!bucket) {
      continue;
    }

    bucket.orders += 1;

    if (
      order.status !==
      DatabaseOrderStatus.CANCELLED
    ) {
      bucket.revenue = roundCurrency(
        bucket.revenue +
          Number(order.total),
      );
    }
  }

  return Array.from(buckets.values());
}

function createCustomerGrowth(
  periodDays: number,
  startDate: Date,
  users: Array<{
    createdAt: Date;
  }>,
): CustomerGrowthPoint[] {
  const buckets = new Map<
    string,
    CustomerGrowthPoint
  >();

  for (
    let dayIndex = 0;
    dayIndex < periodDays;
    dayIndex += 1
  ) {
    const date = addUtcDays(
      startDate,
      dayIndex,
    );

    const key = getDateKey(date);

    buckets.set(key, {
      date: key,
      label: formatDateLabel(
        date,
        periodDays,
      ),
      customers: 0,
    });
  }

  for (const user of users) {
    const key = getDateKey(
      user.createdAt,
    );

    const bucket = buckets.get(key);

    if (bucket) {
      bucket.customers += 1;
    }
  }

  return Array.from(buckets.values());
}

export async function getAdminAnalyticsData(
  periodDays: number,
): Promise<AdminAnalyticsData> {
  const {
    endDate,
    startDate,
    previousStartDate,
  } = createDateRange(periodDays);

  const [
    currentOrders,
    previousOrders,
    currentCustomers,
    previousCustomers,
    currentOrderItems,
  ] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },

      select: {
        createdAt: true,
        total: true,
        status: true,
      },
    }),

    prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },

      select: {
        createdAt: true,
        total: true,
        status: true,
      },
    }),

    prisma.user.findMany({
      where: {
        role: UserRole.USER,

        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },

      select: {
        createdAt: true,
      },
    }),

    prisma.user.findMany({
      where: {
        role: UserRole.USER,

        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },

      select: {
        createdAt: true,
      },
    }),

    prisma.orderItem.findMany({
      where: {
        order: {
          is: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },

            status: {
              not:
                DatabaseOrderStatus.CANCELLED,
            },
          },
        },
      },

      select: {
        productId: true,
        productName: true,
        quantity: true,
        totalPrice: true,

        product: {
          select: {
            category: true,
          },
        },
      },
    }),
  ]);

  const currentRevenue =
    currentOrders.reduce(
      (total, order) =>
        order.status ===
        DatabaseOrderStatus.CANCELLED
          ? total
          : total + Number(order.total),
      0,
    );

  const previousRevenue =
    previousOrders.reduce(
      (total, order) =>
        order.status ===
        DatabaseOrderStatus.CANCELLED
          ? total
          : total + Number(order.total),
      0,
    );

  const currentValidOrderCount =
    currentOrders.filter(
      (order) =>
        order.status !==
        DatabaseOrderStatus.CANCELLED,
    ).length;

  const previousValidOrderCount =
    previousOrders.filter(
      (order) =>
        order.status !==
        DatabaseOrderStatus.CANCELLED,
    ).length;

  const currentAverageOrderValue =
    currentValidOrderCount > 0
      ? currentRevenue /
        currentValidOrderCount
      : 0;

  const previousAverageOrderValue =
    previousValidOrderCount > 0
      ? previousRevenue /
        previousValidOrderCount
      : 0;

  const categoryMap = new Map<
    string,
    {
      revenue: number;
      quantity: number;
    }
  >();

  const topProductMap = new Map<
    string,
    TopProductItem
  >();

  for (const item of currentOrderItems) {
    const category = formatCategory(
      item.product?.category ?? null,
    );

    const categoryEntry =
      categoryMap.get(category) ?? {
        revenue: 0,
        quantity: 0,
      };

    categoryEntry.revenue =
      roundCurrency(
        categoryEntry.revenue +
          Number(item.totalPrice),
      );

    categoryEntry.quantity +=
      item.quantity;

    categoryMap.set(
      category,
      categoryEntry,
    );

    const productKey =
      item.productId ??
      item.productName;

    const productEntry =
      topProductMap.get(productKey) ?? {
        productId: item.productId,
        productName:
          item.productName,
        quantity: 0,
        revenue: 0,
      };

    productEntry.quantity +=
      item.quantity;

    productEntry.revenue =
      roundCurrency(
        productEntry.revenue +
          Number(item.totalPrice),
      );

    topProductMap.set(
      productKey,
      productEntry,
    );
  }

  const categoryRevenueTotal =
    Array.from(
      categoryMap.values(),
    ).reduce(
      (total, item) =>
        total + item.revenue,
      0,
    );

  const salesByCategory:
    CategorySalesItem[] =
    Array.from(
      categoryMap.entries(),
    )
      .map(
        ([category, item]) => ({
          category,
          revenue: item.revenue,
          quantity: item.quantity,

          percentage:
            categoryRevenueTotal > 0
              ? Number(
                  (
                    (item.revenue /
                      categoryRevenueTotal) *
                    100
                  ).toFixed(1),
                )
              : 0,
        }),
      )
      .sort(
        (first, second) =>
          second.revenue -
          first.revenue,
      );

  const topProducts =
    Array.from(
      topProductMap.values(),
    )
      .sort(
        (first, second) =>
          second.quantity -
          first.quantity,
      )
      .slice(0, 5);

  const statusCountMap = new Map<
    DatabaseOrderStatus,
    number
  >();

  for (const status of Object.values(
    DatabaseOrderStatus,
  )) {
    statusCountMap.set(status, 0);
  }

  for (const order of currentOrders) {
    statusCountMap.set(
      order.status,
      (statusCountMap.get(
        order.status,
      ) ?? 0) + 1,
    );
  }

  const orderStatusDistribution:
    OrderStatusDistributionItem[] =
    Array.from(
      statusCountMap.entries(),
    ).map(([status, count]) => ({
      status,
      count,

      percentage:
        currentOrders.length > 0
          ? Number(
              (
                (count /
                  currentOrders.length) *
                100
              ).toFixed(1),
            )
          : 0,
    }));

  return {
    periodDays,

    startDate:
      startDate.toISOString(),

    endDate:
      endDate.toISOString(),

    summary: {
      revenue: createMetric(
        roundCurrency(
          currentRevenue,
        ),
        roundCurrency(
          previousRevenue,
        ),
      ),

      orders: createMetric(
        currentOrders.length,
        previousOrders.length,
      ),

      customers: createMetric(
        currentCustomers.length,
        previousCustomers.length,
      ),

      averageOrderValue:
        createMetric(
          roundCurrency(
            currentAverageOrderValue,
          ),

          roundCurrency(
            previousAverageOrderValue,
          ),
        ),
    },

    salesTrend: createSalesTrend(
      periodDays,
      startDate,
      currentOrders,
    ),

    customerGrowth:
      createCustomerGrowth(
        periodDays,
        startDate,
        currentCustomers,
      ),

    salesByCategory,
    topProducts,
    orderStatusDistribution,
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const periodDays = 30;

  const analytics =
    await getAdminAnalyticsData(
      periodDays,
    );

  const startDate = new Date(
    analytics.startDate,
  );

  const [
    totalProducts,
    previousProductTotal,
    totalCustomers,
    previousCustomerTotal,
    recentOrders,
    inventoryRecords,
    activityRecords,
  ] = await Promise.all([
    prisma.product.count({
      where: {
        isActive: true,
      },
    }),

    prisma.product.count({
      where: {
        isActive: true,

        createdAt: {
          lt: startDate,
        },
      },
    }),

    prisma.user.count({
      where: {
        role: UserRole.USER,
      },
    }),

    prisma.user.count({
      where: {
        role: UserRole.USER,

        createdAt: {
          lt: startDate,
        },
      },
    }),

    prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 5,

      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,

        items: {
          select: {
            quantity: true,
          },
        },
      },
    }),

    prisma.inventory.findMany({
      where: {
        product: {
          is: {
            isActive: true,
          },
        },
      },

      include: {
        product: {
          select: {
            name: true,
            sku: true,
            image: true,
          },
        },
      },
    }),

    prisma.activityLog.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 6,

      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const lowStock =
    inventoryRecords
      .map((inventory) => ({
        id: inventory.id,
        productId:
          inventory.productId,

        name:
          inventory.product.name,

        sku:
          inventory.product.sku,

        image:
          inventory.product.image,

        quantity:
          inventory.quantity,

        reservedQuantity:
          inventory.reservedQuantity,

        availableQuantity:
          Math.max(
            0,
            inventory.quantity -
              inventory.reservedQuantity,
          ),
      }))
      .filter(
        (inventory) =>
          inventory.availableQuantity <=
          10,
      )
      .sort(
        (first, second) =>
          first.availableQuantity -
          second.availableQuantity,
      )
      .slice(0, 5);

  return {
    periodDays,

    stats: {
      revenue:
        analytics.summary.revenue,

      orders:
        analytics.summary.orders,

      products: createMetric(
        totalProducts,
        previousProductTotal,
      ),

      customers: createMetric(
        totalCustomers,
        previousCustomerTotal,
      ),
    },

    salesTrend:
      analytics.salesTrend,

    orderStatusDistribution:
      analytics.orderStatusDistribution,

    recentOrders:
      recentOrders.map((order) => ({
        id: order.id,
        orderNumber:
          order.orderNumber,

        customerName:
          order.customerName,

        total:
          Number(order.total),

        status:
          order.status,

        paymentStatus:
          order.paymentStatus,

        itemCount:
          order.items.reduce(
            (total, item) =>
              total + item.quantity,
            0,
          ),

        createdAt:
          order.createdAt.toISOString(),
      })),

    lowStock,

    recentActivity:
      activityRecords.map(
        (activity) => ({
          id: activity.id,

          userName:
            activity.user?.name ??
            activity.user?.email ??
            "System",

          action: activity.action,
          entity: activity.entity,

          description:
            activity.description,

          status: activity.status,

          ipAddress:
            activity.ipAddress,

          createdAt:
            activity.createdAt.toISOString(),
        }),
      ),
  };
}