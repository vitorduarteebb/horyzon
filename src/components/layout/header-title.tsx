"use client";

import { usePathname } from "next/navigation";

import { mainNav } from "@/lib/navigation";

export function HeaderTitle({ fallback }: { fallback?: string }) {
  const pathname = usePathname();
  const item = mainNav.find(
    (i) => pathname === i.href || (i.href !== "/" && pathname.startsWith(i.href)),
  );
  const label = item?.label ?? fallback ?? "Operação";
  return <h1 className="truncate text-lg font-semibold md:text-xl">{label}</h1>;
}
