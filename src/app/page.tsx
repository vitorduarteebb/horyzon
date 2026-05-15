import { redirect } from "next/navigation";

import { authSafe } from "@/lib/auth-safe";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await authSafe();
  redirect(session?.user?.id ? "/dashboard" : "/login");
}
