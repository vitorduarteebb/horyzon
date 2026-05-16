import { Suspense } from "react";
import { redirect } from "next/navigation";

import { authSafe } from "@/lib/auth-safe";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LoginPage() {
  const session = await authSafe();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <>
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
            Carregando…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </>
  );
}
