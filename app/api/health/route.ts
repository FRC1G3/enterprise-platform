import { NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

function healthResponse(
  status: "healthy" | "unhealthy",
  responseStatus: 200 | 503,
) {
  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
    },
    {
      status: responseStatus,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return healthResponse("healthy", 200);
  } catch {
    return healthResponse("unhealthy", 503);
  }
}
