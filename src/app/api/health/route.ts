import { NextResponse } from "next/server";

import { databaseConnectionProbe } from "@/lib/database-url";
import { prisma } from "@/lib/prisma";

/** Testa Prisma/MySQL. Inclui `connection` só com dados não sensíveis (p.ex. tamanho da senha). */
export async function GET() {
  const probe = databaseConnectionProbe();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const users = await prisma.user.count();
    return NextResponse.json(
      { ok: true, database: true, userCount: users, connection: probe },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        database: false,
        error: message,
        connection: probe,
        hints: [
          "Confirme no hPanel → MySQL que o utilizador e a palavra-passe são exactamente estes (redefina a senha se precisar).",
          "Experimente DATABASE_HOST=127.0.0.1 em vez de localhost.",
          "Se o painel cortar caracteres na senha, use DATABASE_PASSWORD_BASE64 (README / .env.example) com a senha em Base64.",
          "Senha só com letras e números evita problemas nos formulários do painel.",
        ],
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
