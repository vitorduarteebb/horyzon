import { NextResponse } from "next/server";

/** Sem BD — útil para ver se o Node responde (504 em /api/ping ⇒ deploy/nginx, não só MySQL). */
export async function GET() {
  return NextResponse.json(
    { ok: true, t: Date.now() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
