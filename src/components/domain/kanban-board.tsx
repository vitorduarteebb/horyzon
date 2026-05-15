"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { TaskPriority, TaskStatus } from "@prisma/client";
import { toast } from "sonner";

import { updateTaskStatus } from "@/actions/tasks";
import { TASK_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { PriorityBadge } from "@/components/domain/priority-badge";
import { StatusBadge } from "@/components/domain/status-badge";
import { isDueToday, isOverdueTask } from "@/lib/dates";

const COLUMN_ORDER: TaskStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "READY_FOR_QA",
  "REJECTED",
  "APPROVED",
  "DONE",
];

export type KanbanTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  nextAction: string | null;
  assignee: { id: string; name: string };
  project: { id: string; title: string } | null;
};

export function KanbanBoard({ initialTasks }: { initialTasks: KanbanTask[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const grouped = COLUMN_ORDER.map((status) => ({
    status,
    items: initialTasks.filter((t) => t.status === status),
  }));

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    const nextStatus = destination.droppableId as TaskStatus;
    startTransition(async () => {
      try {
        await updateTaskStatus(draggableId, nextStatus);
        toast.success("Status atualizado");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Falha ao mover tarefa");
      }
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 md:pb-2">
        {grouped.map((col) => (
          <Droppable droppableId={col.status} key={col.status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  "flex w-[min(88vw,320px)] shrink-0 flex-col rounded-2xl border-2 border-dashed p-3",
                  snapshot.isDraggingOver ? "border-primary/50 bg-primary/5" : "border-border bg-card/40",
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {TASK_STATUS_LABELS[col.status]}
                  </h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">
                    {col.items.length}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  {col.items.map((task, index) => (
                    <Draggable draggableId={task.id} index={index} key={task.id}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                        >
                          <Card
                            className={cn(
                              "rounded-2xl border-2 shadow-sm transition",
                              dragSnapshot.isDragging ? "rotate-1 scale-[1.01] shadow-md" : "",
                              pending ? "opacity-60" : "",
                            )}
                          >
                            <CardContent className="space-y-2 p-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge status={task.status} />
                                <PriorityBadge priority={task.priority} />
                              </div>
                              <p className="text-sm font-semibold leading-snug">{task.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {task.assignee.name}
                                {task.project ? (
                                  <>
                                    {" "}
                                    · <span className="font-medium">{task.project.title}</span>
                                  </>
                                ) : null}
                              </p>
                              {task.dueDate ? (
                                <p
                                  className={cn(
                                    "text-xs font-medium",
                                    isOverdueTask(new Date(task.dueDate), task.status)
                                      ? "text-red-600"
                                      : isDueToday(new Date(task.dueDate))
                                        ? "text-amber-700"
                                        : "text-muted-foreground",
                                  )}
                                >
                                  Prazo: {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                                </p>
                              ) : null}
                              {task.nextAction ? (
                                <p className="rounded-lg bg-muted/60 px-2 py-1 text-xs text-foreground/90">
                                  Próxima ação: {task.nextAction}
                                </p>
                              ) : null}
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
