import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdminApi } from "@/lib/auth/guards";

import { getAdminAnalyticsData } from "@/lib/services/analytics.service";

import { analyticsQuerySchema } from "@/schemas/analytics.schema";

export async function GET(
  request: NextRequest,
) {
  const authorization =
    await requireAdminApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

  const queryResult =
    analyticsQuerySchema.safeParse(
      Object.fromEntries(
        request.nextUrl.searchParams.entries(),
      ),
    );

  if (!queryResult.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid analytics query.",

        errors:
          queryResult.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const analytics =
      await getAdminAnalyticsData(
        queryResult.data.days,
      );

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error(
      "Admin analytics GET error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Analytics could not be loaded.",
      },
      {
        status: 500,
      },
    );
  }
}