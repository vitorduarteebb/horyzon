"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Client, Project, Task, TaskPriority, TaskStatus, User } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";


import { adminFinalizeTask, createTask } from "@/actions/tasks";
import type { KanbanTask } from "@/components/domain/kanban-board";
import { KanbanBoard } from "@/components/domain/kanban-board";
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from "@/lib/constants";
import { AlertCard } from "@/components/domain/alert-card";
import { EmptyState } from "@/components/domain/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isDueToday, isOverdueTask } from "@/lib/dates";
import { taskSchema } from "@/lib/schemas";

type FormValues = z.infer<typeof taskSchema>;

type TaskSerialized = Omit<Task, "dueDate" | "completedAt" | "createdAt" | "updatedAt"> & {
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: Pick<User, "id" | "name">;
  project: Pick<Project, "id" | "title"> | null;
};

export function TasksClient({
  initialTasks,
  users,
  projects,
  clients,
  role,
}: {
  initialTasks: TaskSerialized[];
  users: Pick<User, "id" | "name" | "role">[];
  projects: Pick<Project, "id" | "title">[];
  clients: Pick<Client, "id" | "name" | "company">[];
  role: User["role"];
}) {
  const [pending, startTransition] = useTransition();
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return initialTasks.filter((t) => {
      if (assigneeFilter !== "all" && t.assigneeId !== assigneeFilter) return false;
      if (projectFilter === "all") return true;
      if (projectFilter === "__no_project") return !t.projectId;
      return t.projectId === projectFilter;
    });
  }, [initialTasks, assigneeFilter, projectFilter]);

  const kanbanTasks: KanbanTask[] = useMemo(
    () =>
      filtered.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        nextAction: t.nextAction,
        assignee: t.assignee,
        project: t.project,
      })),
    [filtered],
  );

  const overdue = filtered.filter((t) => isOverdueTask(t.dueDate ? new Date(t.dueDate) : null, t.status));
  const today = filtered.filter((t) => isDueToday(t.dueDate ? new Date(t.dueDate) : null));

  const approvals = filtered.filter((t) => t.status === "APPROVED");

  const form = useForm<FormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: "",
      clientId: "",
      assigneeId: users.find((u) => u.role === "GUSTAVO")?.id ?? users[0]?.id ?? "",
      status: "TODO" as TaskStatus,
      priority: "MEDIUM" as TaskPriority,
      dueDate: "",
      nextAction: "",
      impactedGoal: "",
    },
  });

  return (
    <div className="space-y-6">
      {overdue.length > 0 ? (
        <AlertCard
          tone="danger"
          title="Tarefas atrasadas"
          description={`${overdue.length} item(ns) ultrapassaram o prazo.`}
        />
      ) : null}
      {today.length > 0 ? (
        <AlertCard tone="warning" title="Vence hoje" description="Priorize antes do fim do dia." />
      ) : null}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
        <div className="space-y-1">
          <Label className="text-xs uppercase text-muted-foreground">Responsável</Label>
          <Select value={assigneeFilter} onValueChange={(v) => v && setAssigneeFilter(v)}>
            <SelectTrigger className="rounded-xl md:w-56">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs uppercase text-muted-foreground">Projeto</Label>
          <Select value={projectFilter} onValueChange={(v) => v && setProjectFilter(v)}>
            <SelectTrigger className="rounded-xl md:w-64">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="__no_project">Sem projeto</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {role === "ADMIN" && approvals.length > 0 ? (
        <Card className="rounded-3xl border-2 border-teal-200 bg-teal-50/40">
          <CardContent className="space-y-3 p-4">
            <p className="font-semibold">Aprovação final (Admin)</p>
            <p className="text-xs text-muted-foreground">
              Tarefas aprovadas no QA técnico aguardando o seu aceite antes de mover para DONE.
            </p>
            <div className="flex flex-wrap gap-2">
              {approvals.map((t) => (
                <div key={t.id} className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm">
                  <span className="font-medium">{t.title}</span>
                  <Badge variant="outline" className="rounded-lg">
                    {TASK_STATUS_LABELS.APPROVED}
                  </Badge>
                  <Button
                    size="sm"
                    className="rounded-xl"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        try {
                          await adminFinalizeTask(t.id);
                          toast.success("Tarefa concluída com aprovação final.");
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Erro");
                        }
                      })
                    }
                  >
                    Finalizar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-3xl border-2">
        <CardContent className="space-y-4 p-4 md:p-6">
          <h2 className="text-xl font-semibold">Nova tarefa</h2>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={form.handleSubmit((v) => {
              startTransition(async () => {
                try {
                  await createTask(v);
                  toast.success("Tarefa criada");
                  form.reset({ ...form.getValues(), title: "", description: "" });
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Erro");
                }
              });
            })}
          >
            <div className="space-y-2 md:col-span-2">
              <Label>Título</Label>
              <Input {...form.register("title")} className="rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Descrição</Label>
              <Textarea {...form.register("description")} className="min-h-[72px] rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Projeto opcional</Label>
              <Select
                value={form.watch("projectId") ?? ""}
                onValueChange={(val) =>
                  form.setValue(
                    "projectId",
                    !val || val === "__none__" ? "" : val,
                    { shouldValidate: true }
                  )
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhum</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cliente opcional</Label>
              <Select
                value={form.watch("clientId") ?? ""}
                onValueChange={(val) =>
                  form.setValue("clientId", !val || val === "__none__" ? "" : val)
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhum</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company || c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select
                value={form.watch("assigneeId")}
                onValueChange={(id) => {
                  if (id) {
                    form.setValue("assigneeId", id, { shouldValidate: true });
                  }
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Status inicial</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v) =>
                    v && form.setValue("status", v as TaskStatus)
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(v) =>
                    v &&
                    form.setValue("priority", v as TaskPriority, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Prazo</Label>
              <Input type="date" {...form.register("dueDate")} className="rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Meta impactada</Label>
              <Input {...form.register("impactedGoal")} className="rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Próxima ação</Label>
              <Input {...form.register("nextAction")} className="rounded-xl" />
            </div>
            <Button disabled={pending} type="submit" className="h-12 rounded-2xl md:col-span-2">
              Criar tarefa
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Kanban</h3>
        {filtered.length === 0 ? (
          <EmptyState title="Nada na filtragem" description="Ajuste os filtros ou crie nova tarefa." />
        ) : (
          <KanbanBoard initialTasks={kanbanTasks} />
        )}
      </div>
    </div>
  );
}
