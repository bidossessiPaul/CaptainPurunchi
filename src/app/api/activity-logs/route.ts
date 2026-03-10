import { NextResponse } from "next/server";
import { readActivityLogs } from "@/lib/activity-log-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || undefined;
  const action = searchParams.get("action") || undefined;
  const target = searchParams.get("target") || undefined;
  const limit = Number(searchParams.get("limit")) || 50;
  const offset = Number(searchParams.get("offset")) || 0;

  const result = await readActivityLogs({ userId, action, target, limit, offset });
  return NextResponse.json(result);
}
