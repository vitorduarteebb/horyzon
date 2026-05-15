import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { SessionProvider } from "next-auth/react";

import { authSafe } from "@/lib/auth-safe";
import { AppShell } from "@/components/layout/app-shell";

/** Evita pré-render estático no build (consultas Prisma + sessão em tempo de pedido). */
export const dynamic = "force-dynamic";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const session = await authSafe();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <AppShell user={session.user}>{children}</AppShell>
    </SessionProvider>
  );
}
