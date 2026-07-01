import { getNetworkStatus } from "@/lib/status";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getNetworkStatus();
  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store" },
  });
}
