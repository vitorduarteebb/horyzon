import { isBefore, startOfDay } from "date-fns";

import { TaskStatus } from "@prisma/client";

export function isOverdueTask(due: Date | null, status: TaskStatus) {
  if (!due || status === TaskStatus.DONE) return false;
  return isBefore(due, startOfDay(new Date()));
}

export function isDueToday(due: Date | null) {
  if (!due) return false;
  const d = startOfDay(due);
  const t = startOfDay(new Date());
  return d.getTime() === t.getTime();
}
