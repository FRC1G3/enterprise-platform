import { NextResponse } from "next/server";

function notImplemented() {
  // TODO: Add validation, authorization, and service logic.
  return NextResponse.json({ success: false, message: "Not implemented yet" }, { status: 501 });
}

export async function GET() {
  return notImplemented();
}
export async function PATCH() {
  return notImplemented();
}
