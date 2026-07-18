import { NextResponse } from "next/server";

function notImplemented() {
  return NextResponse.json({ success: false, message: "Not implemented yet" }, { status: 501 });
}

export async function GET() {
  return notImplemented();
}
export async function PATCH() {
  return notImplemented();
}
export async function DELETE() {
  return notImplemented();
}
