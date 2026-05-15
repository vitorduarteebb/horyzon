"use client";

import Link from "next/link";
import { MessageSquarePlus, Plus, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const quickLink =
  "inline-flex h-14 w-full justify-start gap-3 rounded-2xl px-4 text-base font-semibold";

export function QuickActions() {
  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          "fixed bottom-20 right-4 z-50 h-14 w-14 rounded-2xl p-0 shadow-lg md:bottom-8 md:right-8",
        )}
      >
        <Plus className="h-7 w-7" />
        <span className="sr-only">Ação rápida</span>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Ação rápida</SheetTitle>
        </SheetHeader>
        <div className="mt-4 grid gap-3 pb-6">
          <Link
            href="/leads"
            className={cn(buttonVariants({ variant: "default", size: "lg" }), quickLink)}
          >
            <Sparkles className="h-5 w-5" />
            Novo lead
          </Link>
          <Link
            href="/tasks"
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }), quickLink)}
          >
            <Plus className="h-5 w-5" />
            Ir para tarefas
          </Link>
          <Link
            href="/chat"
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }), quickLink)}
          >
            <MessageSquarePlus className="h-5 w-5" />
            Abrir chat
          </Link>
          <Link
            href="/calendar"
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }), quickLink)}
          >
            <Plus className="h-5 w-5" />
            Nova agenda
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
