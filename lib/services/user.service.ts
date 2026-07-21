import {
  ActivityStatus,
  OrderStatus,
  Prisma,
  UserRole,
} from "@/generated/prisma/client";

import prisma from "@/lib/db/prisma";

import type {
  AdminUserQueryInput,
  UpdateAdminUserInput,
} from "@/schemas/admin-user.schema";

import type {
  AdminUser,
  AdminUserListResult,
} from "@/types/admin-user";

const adminUserSelect = {
  id: true,

  name: true,
  email: true,
  role: true,

  phone: true,
  country: true,
  city: true,

  isActive: true,

  createdAt: true,
  updatedAt: true,

  _count: {
    select: {
      orders: true,
    },
  },
} satisfies Prisma.UserSelect;

type AdminUserRecord =
  Prisma.UserGetPayload<{
    select: typeof adminUserSelect;
  }>;

export class AdminUserNotFoundError extends Error {
  constructor() {
    super("User not found.");
    this.name = "AdminUserNotFoundError";
  }
}

export class AdminUserManagementError extends Error {
  constructor(message: string) {
    super(message);
    this.name =
      "AdminUserManagementError";
  }
}

function serializeAdminUser(
  user: AdminUserRecord,
  totalSpent: number,
): AdminUser {
  return {
    id: user.id,

    name: user.name,
    email: user.email,
    role: user.role,

    phone: user.phone,
    country: user.country,
    city: user.city,

    isActive: user.isActive,

    orderCount:
      user._count.orders,

    totalSpent,

    createdAt:
      user.createdAt.toISOString(),

    updatedAt:
      user.updatedAt.toISOString(),
  };
}

async function getUserTotalSpent(
  userId: string,
): Promise<number> {
  const aggregate =
    await prisma.order.aggregate({
      where: {
        userId,

        status: {
          not: OrderStatus.CANCELLED,
        },
      },

      _sum: {
        total: true,
      },
    });

  return Number(
    aggregate._sum.total ?? 0,
  );
}

export async function listAdminUsers(
  input: AdminUserQueryInput,
): Promise<AdminUserListResult> {
  const where: Prisma.UserWhereInput =
    {};

  if (input.search) {
    where.OR = [
      {
        name: {
          contains: input.search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: input.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (input.role) {
    where.role =
      input.role === "ADMIN"
        ? UserRole.ADMIN
        : UserRole.USER;
  }

  if (input.status) {
    where.isActive =
      input.status === "ACTIVE";
  }

  const skip =
    (input.page - 1) * input.limit;

  const [users, total] =
    await prisma.$transaction([
      prisma.user.findMany({
        where,

        select: adminUserSelect,

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take: input.limit,
      }),

      prisma.user.count({
        where,
      }),
    ]);

  const userIds = users.map(
    (user) => user.id,
  );

  const spendingGroups =
    userIds.length > 0
      ? await prisma.order.groupBy({
          by: ["userId"],

          where: {
            userId: {
              in: userIds,
            },

            status: {
              not:
                OrderStatus.CANCELLED,
            },
          },

          _sum: {
            total: true,
          },
        })
      : [];

  const spendingByUser = new Map(
    spendingGroups
      .filter(
        (
          group,
        ): group is typeof group & {
          userId: string;
        } => Boolean(group.userId),
      )
      .map((group) => [
        group.userId,
        Number(group._sum.total ?? 0),
      ]),
  );

  return {
    users: users.map((user) =>
      serializeAdminUser(
        user,
        spendingByUser.get(user.id) ??
          0,
      ),
    ),

    pagination: {
      page: input.page,
      limit: input.limit,
      total,

      totalPages: Math.max(
        1,
        Math.ceil(total / input.limit),
      ),
    },
  };
}

export async function getAdminUser(
  userId: string,
): Promise<AdminUser> {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: adminUserSelect,
    });

  if (!user) {
    throw new AdminUserNotFoundError();
  }

  const totalSpent =
    await getUserTotalSpent(user.id);

  return serializeAdminUser(
    user,
    totalSpent,
  );
}

export async function updateAdminUser(
  adminUserId: string,
  targetUserId: string,
  input: UpdateAdminUserInput,
): Promise<AdminUser> {
  await prisma.$transaction(
    async (transaction) => {
      const targetUser =
        await transaction.user.findUnique({
          where: {
            id: targetUserId,
          },

          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        });

      if (!targetUser) {
        throw new AdminUserNotFoundError();
      }

      const nextRole =
        input.role === undefined
          ? targetUser.role
          : input.role === "ADMIN"
            ? UserRole.ADMIN
            : UserRole.USER;

      const nextIsActive =
        input.isActive ??
        targetUser.isActive;

      const removesAdminAccess =
        targetUser.role ===
          UserRole.ADMIN &&
        (nextRole !== UserRole.ADMIN ||
          !nextIsActive);

      if (
        targetUser.id === adminUserId &&
        removesAdminAccess
      ) {
        throw new AdminUserManagementError(
          "You cannot remove your own administrator access.",
        );
      }

      if (removesAdminAccess) {
        const activeAdminCount =
          await transaction.user.count({
            where: {
              role: UserRole.ADMIN,
              isActive: true,
            },
          });

        if (activeAdminCount <= 1) {
          throw new AdminUserManagementError(
            "The platform must have at least one active administrator.",
          );
        }
      }

      const updatedUser =
        await transaction.user.update({
          where: {
            id: targetUser.id,
          },

          data: {
            role: nextRole,
            isActive: nextIsActive,
          },
        });

      await transaction.activityLog.create({
        data: {
          userId: adminUserId,

          action: "UPDATE_USER",

          entity: "USER",

          entityId:
            updatedUser.id,

          description:
            `User ${updatedUser.email} was updated.`,

          status:
            ActivityStatus.SUCCESS,

          metadata: {
            previousRole:
              targetUser.role,

            newRole:
              updatedUser.role,

            previousIsActive:
              targetUser.isActive,

            newIsActive:
              updatedUser.isActive,
          },
        },
      });
    },
  );

  return getAdminUser(targetUserId);
}