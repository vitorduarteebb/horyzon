import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { TaskStatus } from "@prisma/client";
import { TASK_STATUS_LABELS } from "@/lib/constants";

const variants = cva("text-xs font-semibold rounded-lg px-2 py-0.5 border max-w-full truncate", {
  variants: {
    status: {
      BACKLOG: "bg-slate-100 text-slate-800 border-slate-200",
      TODO: "bg-sky-50 text-sky-900 border-sky-200",
      IN_PROGRESS: "bg-emerald-50 text-emerald-900 border-emerald-200",
      BLOCKED: "bg-amber-50 text-amber-950 border-amber-200",
      READY_FOR_QA: "bg-violet-50 text-violet-900 border-violet-200",
      REJECTED: "bg-red-50 text-red-900 border-red-200",
      APPROVED: "bg-teal-50 text-teal-900 border-teal-200",
      DONE: "bg-zinc-100 text-zinc-700 border-zinc-200",
    },
  },
  defaultVariants: { status: "BACKLOG" },
});

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <span title={TASK_STATUS_LABELS[status]} className={cn(variants({ status }), className)}>
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}
