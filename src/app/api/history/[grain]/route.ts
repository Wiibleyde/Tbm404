import { getHistory, isHistoryGrain } from "@/lib/history";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ grain: string }> }) {
  const { grain } = await params;
  if (!isHistoryGrain(grain)) {
    return NextResponse.json({ error: "Invalid grain (day|month|year)" }, { status: 400 });
  }

  const history = await getHistory(grain);
  return NextResponse.json(history, { headers: { "Cache-Control": "no-store" } });
}
