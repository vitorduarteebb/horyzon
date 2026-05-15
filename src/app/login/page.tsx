import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <>
      <div className="border-b-2 border-amber-600 bg-amber-400 px-3 py-2 text-center text-xs font-bold leading-snug text-amber-950 md:text-sm">
        Deploy vivo · UTC {new Date().toISOString()}
        <span className="mt-1 block font-normal">
          Faixa âmbar = HTML gerado no servidor. Se não vês isto, o deploy/CDN ainda está antigo.
        </span>
      </div>
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
