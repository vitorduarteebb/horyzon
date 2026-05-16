import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { authSafe } from "@/lib/auth-safe";
import { ROLE_LABELS } from "@/lib/constants";
import { AdminCreateUserForm } from "./admin-create-user-form";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const session = await authSafe();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Administração</p>
        <h1 className="text-3xl font-bold tracking-tight">Utilizadores</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Cria contas para a equipa. Identidade visual alinhada a{" "}
          <Link href="https://horyzonn.com.br" className="font-medium underline underline-offset-4 hover:text-foreground">
            horyzonn.com.br
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
        <section className="rounded-3xl border-2 bg-card shadow-sm ring-1 ring-white/10">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Lista actual</h2>
            <p className="text-xs text-muted-foreground">{users.length} utilizador(es)</p>
          </div>
          <div className="divide-y divide-border overflow-x-auto">
            <div className="grid grid-cols-[1.2fr_1.8fr_auto_auto] gap-2 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:px-6">
              <span>Nome</span>
              <span>E-mail</span>
              <span className="text-right">Papel</span>
              <span className="text-center">Estado</span>
            </div>
            {users.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-[1.2fr_1.8fr_auto_auto] items-center gap-2 px-4 py-3 text-sm md:px-6"
              >
                <span className="truncate font-medium">{u.name}</span>
                <span className="truncate text-muted-foreground">{u.email}</span>
                <span className="text-right text-xs font-medium">{ROLE_LABELS[u.role]}</span>
                <span className={`text-center text-xs ${u.active ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {u.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <AdminCreateUserForm />
      </div>
    </div>
  );
}
