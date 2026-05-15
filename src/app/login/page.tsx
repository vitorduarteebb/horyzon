"use client";

import type { FormEvent } from "react";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/** `<input>` nativo + estas classes — evita UI de validação de libs no login. */
const loginInputClass =
  "flex h-12 w-full min-w-0 rounded-xl border border-input bg-transparent px-3 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 md:text-sm dark:bg-input/30";

function LoginFormInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const rawEmail = typeof fd.get("email") === "string" ? (fd.get("email") as string) : "";
    const rawPassword = typeof fd.get("password") === "string" ? (fd.get("password") as string) : "";

    const parsed = loginSchema.safeParse({
      email: rawEmail.trim(),
      password: rawPassword,
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      const fieldErrors: { email?: string; password?: string } = {};
      if (flattened.fieldErrors.email?.[0]) fieldErrors.email = flattened.fieldErrors.email[0];
      if (flattened.fieldErrors.password?.[0]) fieldErrors.password = flattened.fieldErrors.password[0];
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      setError("E-mail ou senha incorretos.");
      return;
    }
    const cb = params.get("callbackUrl") ?? "/dashboard";
    router.push(cb);
    router.refresh();
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
            <form noValidate onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  inputMode="email"
                  autoComplete="username email"
                  required={false}
                  aria-required={false}
                  aria-invalid={errors.email ? true : undefined}
                  className={cn(loginInputClass, errors.email && "border-destructive")}
                  defaultValue=""
                />
                {errors.email ? (
                  <p className="text-xs text-destructive">{errors.email}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required={false}
                  aria-required={false}
                  aria-invalid={errors.password ? true : undefined}
                  className={cn(loginInputClass, errors.password && "border-destructive")}
                  defaultValue=""
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
          Uso interno Horyzonn · Operação em MySQL + Prisma
          <span className="mt-1 block opacity-70">Login v2 (inputs nativos) — se não vês isto, o site ainda está em cache</span>
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--hz-app-bg)] px-4">
      <p className="text-sm text-muted-foreground">Carregando…</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginFormInner />
    </Suspense>
  );
}
