/**
 * Ligação MySQL para o Prisma.
 *
 * Opção A — DATABASE_URL (senha com @ → %40 na URL).
 *
 * Opção B — componentes + encoding automático:
 *   DATABASE_USE_COMPONENTS=true
 *   DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_HOST, DATABASE_PORT
 *
 * Opção C — se o painel cortar a senha no `@`, usa Base64 da senha exacta:
 *   DATABASE_PASSWORD_BASE64=SGxvcnk=   (echo -n 'Blade1411@20' | base64 no Linux/Mac)
 */

export function effectiveMysqlHost(rawFromEnv: string | undefined): string {
  const trimmed = (rawFromEnv ?? "").trim();
  const host = trimmed || "localhost";
  if (process.env.NODE_ENV !== "production") {
    return trimmed || "localhost";
  }
  /** Em Linux, `localhost` pode usar socket Unix; Prisma/Node em PaaS usa TCP — 127.0.0.1 força TCP. */
  if (host === "localhost" || host === "::1") {
    return "127.0.0.1";
  }
  return host;
}

export function parseUseComponentsFlag(): boolean {
  const v = process.env.DATABASE_USE_COMPONENTS?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** Informação não-secreta para diagnóstico (comprimento da senha, etc.). */
export function databaseConnectionProbe(): {
  useComponents: boolean;
  hostEnv?: string;
  hostEffective: string;
  user?: string;
  database?: string;
  port?: string;
  passwordLength: number;
  passwordHasAt: boolean;
  usingPasswordBase64: boolean;
} {
  const pwB64 = process.env.DATABASE_PASSWORD_BASE64?.trim();
  const pwPlain = process.env.DATABASE_PASSWORD ?? "";
  const effectiveLen = pwB64
    ? Buffer.from(pwB64, "base64").toString("utf8").length
    : pwPlain.trimEnd().length;

  return {
    useComponents: parseUseComponentsFlag(),
    hostEnv: process.env.DATABASE_HOST?.trim() || undefined,
    hostEffective: effectiveMysqlHost(process.env.DATABASE_HOST),
    user: process.env.DATABASE_USER?.trim(),
    database: process.env.DATABASE_NAME?.trim(),
    port: process.env.DATABASE_PORT?.trim(),
    passwordLength: effectiveLen,
    passwordHasAt: pwB64
      ? Buffer.from(pwB64, "base64").toString("utf8").includes("@")
      : pwPlain.includes("@"),
    usingPasswordBase64: Boolean(pwB64),
  };
}

export function resolveDatabaseUrl(): string {
  const useParts = parseUseComponentsFlag();

  if (useParts) {
    const user = process.env.DATABASE_USER?.trim();
    const database = process.env.DATABASE_NAME?.trim();
    const host = effectiveMysqlHost(process.env.DATABASE_HOST);
    const port = process.env.DATABASE_PORT?.trim() || "3306";

    let password = "";
    const b64 = process.env.DATABASE_PASSWORD_BASE64?.trim();
    if (b64) {
      try {
        password = Buffer.from(b64, "base64").toString("utf8");
      } catch {
        throw new Error("DATABASE_PASSWORD_BASE64 inválido (não é Base64 válido).");
      }
    } else {
      password = (process.env.DATABASE_PASSWORD ?? "").replace(/\r$/, "").trim();
    }

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
