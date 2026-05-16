import type { Session } from "next-auth";

import { auth } from "@/auth";

import "server-only";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado.");
  }
  return session;
}

/** Sessão apenas se o utilizador for ADMIN (para acções restritas). */
export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    throw new Error("Apenas administradores podem efectuar esta acção.");
  }
  return session;
}
