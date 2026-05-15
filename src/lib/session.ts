import { auth } from "@/auth";

import "server-only";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado.");
  }
  return session;
}
