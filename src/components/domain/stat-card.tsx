import type { ComponentType } from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  accent = "default",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "default" | "amber" | "danger";
  icon?: ComponentType<{ className?: string }>;
}) {
  const ring =
    accent === "amber"
      ? "border-amber-300/60 shadow-amber-100/40"
      : accent === "danger"
        ? "border-red-300/60 shadow-red-100/40"
        : "border-border";

  return (
    <Card className={cn("rounded-2xl border-2 shadow-sm", ring)}>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-2xl font-semibold tabular-nums text-foreground">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? <Icon className="h-6 w-6 shrink-0 text-primary/80" /> : null}
      </CardContent>
    </Card>
  );
}
