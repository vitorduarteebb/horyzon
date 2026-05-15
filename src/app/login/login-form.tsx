"use client";

import { useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { loginSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const loginInputClass =
  "flex h-12 w-full min-w-0 rounded-xl border border-input bg-transparent px-3 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 md:text-sm dark:bg-input/30";

function signInMessage(res: Awaited<ReturnType<typeof signIn>>) {
  if (!res) return "Sem resposta do servidor. Tenta de novo.";
  if (res.ok) return null;
  const code = res.error;
  if (code === "Configuration")
    return "Configuração do NextAuth: confirma na Hostinger NEXTAUTH_URL (ou AUTH_URL) e NEXTAUTH_SECRET (ou AUTH_SECRET) — o URL tem de ser exatamente o do site, em https, sem barra no fim.";
  if (code === "AccessDenied") return "Acesso recusado.";
  if (code === "CredentialsSignin")
    return "Credenciais da base incorretas ou e-mail/senha errados. Na Hostinger: em Variáveis de ambiente, a DATABASE_URL tem de usar o MESMO utilizador e palavra-passe que em «Databases → MySQL» (senha com @ → %40 na URL). Redefine a senha MySQL no painel e cola de novo na DATABASE_URL. Teste: /api/health.";
  return `Não foi possível entrar${code ? ` (${code})` : ""}.`;
}

/** Destino seguro para evitar open redirect (`//evil`). */
function safePostLoginRedirect(callbackUrl: string | null): string {
  const raw = callbackUrl?.trim();
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

/** Cliente — deve ficar dentro de `<Suspense>` (useSearchParams). */
export function LoginForm() {
  const params = useSearchParams();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  async function handleEntrar() {
    setErrors({});
    setError(null);

    const rawEmail = emailRef.current?.value ?? "";
    const rawPassword = passwordRef.current?.value ?? "";

    const parsed = loginSchema.safeParse({
      email: rawEmail.trim(),
      password: rawPassword,
    });

    if (!parsed.success) {
      const flat = parsed.error.flatten();
      setErrors({
        email: flat.fieldErrors.email?.[0],
        password: flat.fieldErrors.password?.[0],
      });
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      const msg = signInMessage(res);
      if (msg) {
        setError(msg);
        return;
      }

      /**
       * Hard navigation: evita corrida onde `router.refresh()` reexecuta `/login` antes do
       * cookie de sessão ser enviado ao RSC de `/dashboard` (voltava sempre ao login como “refresh”).
       */
      const dest = safePostLoginRedirect(params.get("callbackUrl"));
      window.location.assign(dest);
    } catch {
      setError("Erro ao contactar o servidor de sessões. Actualiza a página e tenta de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--hz-app-bg)] px-4 py-10">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-black">
            HZ
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Horyzonn OS</h1>
          <p className="text-sm text-muted-foreground">Entre com o e-mail corporativo</p>
        </div>

        <Card className="rounded-3xl border-2 shadow-lg">
          <CardHeader className="pb-0" />
          <CardContent>
            <form
              noValidate
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                void handleEntrar();
              }}
            >
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-sm font-medium leading-none">
                  E-mail
                </label>
                <input
                  id="login-email"
                  ref={emailRef}
                  name="email"
                  type="text"
                  inputMode="email"
                  autoComplete="username email"
                  aria-invalid={errors.email ? true : undefined}
                  className={cn(loginInputClass, errors.email && "border-destructive")}
                />
                {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
              </div>
              <div className="space-y-2">
                <label htmlFor="login-password" className="text-sm font-medium leading-none">
                  Senha
                </label>
                <input
                  id="login-password"
                  ref={passwordRef}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={errors.password ? true : undefined}
                  className={cn(loginInputClass, errors.password && "border-destructive")}
                />
                {errors.password ? (
                  <p className="text-xs text-destructive">{errors.password}</p>
                ) : null}
              </div>
              {error ? (
                <p className="text-sm font-medium text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              <Button
                type="submit"
                disabled={loading}
                className={cn("h-12 w-full rounded-2xl text-base font-semibold")}
              >
                {loading ? "Entrando…" : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground">
          Uso interno Horyzonn · Teste BD:{" "}
          <a className="underline text-primary" href="/api/health">
            /api/health
          </a>
          <span className="mt-1 block opacity-70">Login v5 · form sem validação HTML (noValidate)</span>
        </p>
      </div>
    </div>
  );
}
