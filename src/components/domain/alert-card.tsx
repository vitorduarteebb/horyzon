import { AlertTriangle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

export function AlertCard({
  title,
  description,
  tone = "info",
  className,
}: {
  title: string;
  description: string;
  tone?: "info" | "warning" | "danger";
  className?: string;
}) {
  const styles =
    tone === "danger"
      ? "border-red-200 bg-red-50 text-red-950"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-950"
        : "border-primary/20 bg-primary/5 text-foreground";

  const Icon = tone === "danger" || tone === "warning" ? AlertTriangle : Info;

  return (
    <div className={cn("flex gap-3 rounded-2xl border-2 p-4", styles, className)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm opacity-90">{description}</p>
      </div>
    </div>
  );
}
