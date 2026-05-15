import "server-only";

import { auth } from "@/auth";

/** Evita 500 em auth/configuração defeituosa (ex.: NEXTAUTH_* na Hostinger). */
export async function authSafe() {
  try {
    return await auth();
  } catch (error) {
    console.error("[authSafe]", error);
    return null;
  }
}
