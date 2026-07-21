import {
  ActivityStatus as DatabaseActivityStatus,
  Prisma,
} from "@/generated/prisma/client";

import prisma from "@/lib/db/prisma";

import type {
  ActivityQueryInput,
} from "@/schemas/activity.schema";

import type {
  ActivityFilterOptions,
  ActivityLogItem,
  ActivityLogPage,
} from "@/types/activity";

const activityInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.ActivityLogInclude;

type ActivityRecord =
  Prisma.ActivityLogGetPayload<{
    include: typeof activityInclude;
  }>;

export class ActivityCursorError extends Error {
  constructor() {
    super(
      "The activity pagination cursor is invalid.",
    );

    this.name =
      "ActivityCursorError";
  }
}

function serializeActivity(
  activity: ActivityRecord,
): ActivityLogItem {
  return {
    id: activity.id,

    userId: activity.userId,

    user: activity.user
      ? {
          id: activity.user.id,
          name: activity.user.name,
          email: activity.user.email,
        }
      : null,

    action: activity.action,
    entity: activity.entity,
    entityId: activity.entityId,

    description:
      activity.description,

    ipAddress: activity.ipAddress,

    status: activity.status,

    metadata:
      activity.metadata ?? null,

    createdAt:
      activity.createdAt.toISOString(),
  };
}

function buildActivityWhere(
  input: ActivityQueryInput,
): Prisma.ActivityLogWhereInput {
  const where: Prisma.ActivityLogWhereInput =
    {};

  if (input.search) {
    where.OR = [
      {
        description: {
          contains: input.search,
          mode: "insensitive",
        },
      },
      {
        action: {
          contains: input.search,
          mode: "insensitive",
        },
      },
      {
        entity: {
          contains: input.search,
          mode: "insensitive",
        },
      },
      {
        entityId: {
          contains: input.search,
          mode: "insensitive",
        },
      },
      {
        ipAddress: {
          contains: input.search,
          mode: "insensitive",
        },
      },
      {
        user: {
          is: {
            OR: [
              {
                name: {
                  contains:
                    input.search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains:
                    input.search,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      },
    ];
  }

  if (input.action) {
    where.action = input.action;
  }

  if (input.entity) {
    where.entity = input.entity;
  }

  if (input.userId) {
    where.userId = input.userId;
  }

  if (input.status) {
    where.status =
      input.status === "SUCCESS"
        ? DatabaseActivityStatus.SUCCESS
        : DatabaseActivityStatus.FAILED;
  }

  if (input.date) {
    const startDate = new Date(
      `${input.date}T00:00:00.000Z`,
    );

    const endDate = new Date(
      startDate,
    );

    endDate.setUTCDate(
      endDate.getUTCDate() + 1,
    );

    where.createdAt = {
      gte: startDate,
      lt: endDate,
    };
  }

  return where;
}

async function getActivityFilterOptions(): Promise<ActivityFilterOptions> {
  const [
    actionRecords,
    entityRecords,
    users,
  ] = await Promise.all([
    prisma.activityLog.findMany({
      distinct: ["action"],

      select: {
        action: true,
      },
    }),

    prisma.activityLog.findMany({
      distinct: ["entity"],

      select: {
        entity: true,
      },
    }),

    prisma.user.findMany({
      where: {
        activityLogs: {
          some: {},
        },
      },

      select: {
        id: true,
        name: true,
        email: true,
      },

      orderBy: [
        {
          name: "asc",
        },
        {
          email: "asc",
        },
      ],
    }),
  ]);

  return {
    actions: actionRecords
      .map(
        (record) => record.action,
      )
      .sort((first, second) =>
        first.localeCompare(second),
      ),

    entities: entityRecords
      .map(
        (record) => record.entity,
      )
      .sort((first, second) =>
        first.localeCompare(second),
      ),

    users,
  };
}

export async function listActivityLogs(
  input: ActivityQueryInput,
): Promise<ActivityLogPage> {
  if (input.cursor) {
    const cursorRecord =
      await prisma.activityLog.findUnique({
        where: {
          id: input.cursor,
        },

        select: {
          id: true,
        },
      });

    if (!cursorRecord) {
      throw new ActivityCursorError();
    }
  }

  const where =
    buildActivityWhere(input);

  const baseQuery = {
    where,

    include: activityInclude,

    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],

    take: input.limit + 1,
  } satisfies Prisma.ActivityLogFindManyArgs;

  const recordsPromise = input.cursor
    ? prisma.activityLog.findMany({
        ...baseQuery,

        cursor: {
          id: input.cursor,
        },

        skip: 1,
      })
    : prisma.activityLog.findMany(
        baseQuery,
      );

  const [
    records,
    total,
    filters,
  ] = await Promise.all([
    recordsPromise,

    prisma.activityLog.count({
      where,
    }),

    getActivityFilterOptions(),
  ]);

  const hasMore =
    records.length > input.limit;

  const visibleRecords = hasMore
    ? records.slice(0, input.limit)
    : records;

  const lastVisibleRecord =
    visibleRecords.at(-1);

  return {
    items:
      visibleRecords.map(
        serializeActivity,
      ),

    total,

    nextCursor:
      hasMore && lastVisibleRecord
        ? lastVisibleRecord.id
        : null,

    hasMore,

    filters,
  };
}