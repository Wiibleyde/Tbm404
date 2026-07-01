import { getLineDetail } from "@/lib/line-detail";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const detail = await getLineDetail(decodeURIComponent(code));

  if (!detail) {
    return NextResponse.json({ error: "Line not found" }, { status: 404 });
  }
  return NextResponse.json(detail, { headers: { "Cache-Control": "no-store" } });
}
