import type { ReactNode } from "react";
import Link from "next/link";
import type { UserRole } from "@prisma/client";
import { PanelLeft } from "lucide-react";

import { signOutAction } from "@/actions/auth";
import { HeaderTitle } from "@/components/layout/header-title";

import { buttonVariants } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { QuickActions } from "@/components/layout/quick-actions";
import { Sidebar } from "@/components/layout/sidebar";
import { ROLE_LABELS } from "@/lib/constants";
import { UserAvatar } from "@/components/domain/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function AppShell({
  user,
  children,
}: {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: UserRole;
  };
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[var(--hz-app-bg)] pb-24 md:pb-0">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-border bg-card/90 backdrop-blur md:block">
          <Sidebar user={user} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur md:px-6">
            <Sheet>
              <SheetTrigger
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "md:hidden rounded-xl",
                )}
              >
                <PanelLeft className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <Sidebar user={user} />
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">HORYZON</p>
              <HeaderTitle />
              <Link
                href="https://horyzonn.com.br"
                className="mt-1 inline-block text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                target="_blank"
                rel="noreferrer noopener"
              >
                Site institucional →
              </Link>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "flex items-center gap-2 rounded-2xl border border-border bg-background px-2 py-1.5",
                  "text-left transition hover:bg-muted/60",
                  "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <UserAvatar name={user.name ?? user.email ?? "Usuário"} />
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-medium leading-tight">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0">
                  <Link href="/settings" className="flex w-full rounded-md px-2 py-2 text-sm hover:bg-accent">
                    Ajustes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-destructive outline-none hover:bg-accent"
                  >
                    Sair
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 space-y-6 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>

      <MobileNav />
      <QuickActions />
    </div>
  );
}
