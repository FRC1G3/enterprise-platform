import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdminApi } from "@/lib/auth/guards";

import {
  ActivityCursorError,
  listActivityLogs,
} from "@/lib/services/activity.service";

import { activityQuerySchema } from "@/schemas/activity.schema";

export async function GET(
  request: NextRequest,
) {
  const authorization =
    await requireAdminApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

  const queryResult =
    activityQuerySchema.safeParse(
      Object.fromEntries(
        request.nextUrl.searchParams.entries(),
      ),
    );

  if (!queryResult.success) {
    return NextResponse.json(
      {
        success: false,

        message:
          "Invalid activity log query.",

        errors:
          queryResult.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const activityPage =
      await listActivityLogs(
        queryResult.data,
      );

    return NextResponse.json(
      {
        success: true,
        data: activityPage,
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store",
        },
      },
    );
  } catch (error) {
    if (
      error instanceof
      ActivityCursorError
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "Admin activity GET error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Activity logs could not be loaded.",
      },
      {
        status: 500,
      },
    );
  }
}