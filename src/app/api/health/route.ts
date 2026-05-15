import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/** Público: testa ligação Prisma/MySQL no servidor (útil na Hostinger). */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const users = await prisma.user.count();
    return NextResponse.json(
      { ok: true, database: true, userCount: users },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, database: false, error: message },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
