/**
 * Ligação MySQL para o Prisma.
 *
 * Opção A — uma linha (atenção a `@` na senha → `%40` na URL):
 *   DATABASE_URL="mysql://user:pass@host:3306/db"
 *
 * Opção B — variáveis separadas (senha em texto puro, encoding automático).
 * Na Hostinger costuma evitar erros ao montar o URL à mão:
 *   DATABASE_USE_COMPONENTS=true
 *   DATABASE_USER=u494944867_vitorduarteebb
 *   DATABASE_PASSWORD=Blade1411@20
 *   DATABASE_NAME=u494944867_horyzonn
 *   DATABASE_HOST=localhost
 *   DATABASE_PORT=3306
 */

export function resolveDatabaseUrl(): string {
  const useParts =
    process.env.DATABASE_USE_COMPONENTS === "1" ||
    process.env.DATABASE_USE_COMPONENTS === "true";

  if (useParts) {
    const user = process.env.DATABASE_USER?.trim();
    const password = process.env.DATABASE_PASSWORD ?? "";
    const database = process.env.DATABASE_NAME?.trim();
    const host = process.env.DATABASE_HOST?.trim() || "localhost";
    const port = process.env.DATABASE_PORT?.trim() || "3306";

    if (!user || !database) {
      throw new Error(
        "DATABASE_USE_COMPONENTS está ativo mas faltam DATABASE_USER ou DATABASE_NAME."
      );
    }

    return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }

  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "Defina DATABASE_URL ou DATABASE_USE_COMPONENTS=true com DATABASE_USER, DATABASE_PASSWORD e DATABASE_NAME."
    );
  }
  return url;
}
