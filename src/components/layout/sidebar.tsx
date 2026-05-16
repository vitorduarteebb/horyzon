"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@prisma/client";

import { HoryzonLogo } from "@/components/brand/horyzon-logo";
import { ROLE_LABELS } from "@/lib/constants";
import { mainNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Sidebar({
  user,
}: {
  user: { name?: string | null; email?: string | null; role: UserRole };
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-5">
        <HoryzonLogo variant="mark" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-[0.12em]">HORYZON</p>
          <p className="truncate text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {mainNav
          .filter((item) => !item.requireAnyRole || item.requireAnyRole.includes(user.role))
          .map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/80 hover:bg-muted",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0 opacity-90" />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-border p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{user.name}</p>
        <p className="truncate">{user.email}</p>
      </div>
    </div>
  );
}
