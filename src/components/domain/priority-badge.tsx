import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { TaskPriority } from "@prisma/client";
import { TASK_PRIORITY_LABELS } from "@/lib/constants";

const variants = cva("text-xs font-semibold rounded-lg px-2 py-0.5 border", {
  variants: {
    priority: {
      LOW: "bg-zinc-50 text-zinc-700 border-zinc-200",
      MEDIUM: "bg-blue-50 text-blue-900 border-blue-100",
      HIGH: "bg-orange-50 text-orange-900 border-orange-200",
      URGENT: "bg-red-600 text-white border-red-700",
    },
  },
  defaultVariants: { priority: "MEDIUM" },
});

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  return (
    <span className={cn(variants({ priority }), className)}>{TASK_PRIORITY_LABELS[priority]}</span>
  );
}
