import { getLinesIndex } from "@/lib/line-detail";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const lines = await getLinesIndex();
  return NextResponse.json(lines, { headers: { "Cache-Control": "no-store" } });
}
