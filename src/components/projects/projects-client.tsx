"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Client, Project, User, ProjectStatus, ProjectPriority } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import {
  createProject as createProjectDb,
  deleteProject,
  updateProject as updateProjectDb,
} from "@/actions/projects";
import { PROJECT_PRIORITY_LABELS, PROJECT_STATUS_LABELS } from "@/lib/constants";
import { fmtBRL } from "@/lib/format";
import { EmptyState } from "@/components/domain/empty-state";
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
import { projectSchema } from "@/lib/schemas";

type FormValues = z.infer<typeof projectSchema>;

export function ProjectsClient({
  initialProjects,
  clients,
  users,
  currentUserRole,
}: {
  initialProjects: (Project & { client: Client; owner: User })[];
  clients: Client[];
  users: User[];
  currentUserRole: User["role"];
}) {
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      clientId: clients[0]?.id ?? "",
      ownerId: users.find((u) => u.role === "ADMIN")?.id ?? users[0]?.id ?? "",
      status: "PLANNING" as ProjectStatus,
      priority: "MEDIUM" as ProjectPriority,
      value: "",
      deadline: "",
      progress: 0,
      nextAction: "",
      risk: "",
      description: "",
    },
  });

  return (
    <div className="space-y-6">
      {currentUserRole === "ADMIN" ? (
        <Card className="rounded-3xl border-2">
          <CardContent className="space-y-4 p-4 md:p-6">
            <div>
              <h2 className="text-xl font-semibold">Novo projeto</h2>
              <p className="text-sm text-muted-foreground">
                Após fechar o escopo, registre o projeto e abra tarefas para o Gustavo.
              </p>
            </div>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={form.handleSubmit((v) => {
                startTransition(async () => {
                  try {
                    await createProjectDb(v);
                    toast.success("Projeto criado");
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
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  value={form.watch("clientId")}
                  onValueChange={(id) => {
                    if (id) form.setValue("clientId", id);
                  }}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gestor</Label>
                <Select
                  value={form.watch("ownerId")}
                  onValueChange={(id) => {
                    if (id) form.setValue("ownerId", id);
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
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v) => form.setValue("status", v as ProjectStatus)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
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
                  onValueChange={(v) => form.setValue("priority", v as ProjectPriority)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROJECT_PRIORITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (opcional)</Label>
                <Input {...form.register("value")} className="rounded-xl" placeholder="18500" />
              </div>
              <div className="space-y-2">
                <Label>Prazo</Label>
                <Input type="date" {...form.register("deadline")} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Progresso (%)</Label>
                <Input type="number" min={0} max={100} {...form.register("progress")} className="rounded-xl" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Risco</Label>
                <Input {...form.register("risk")} className="rounded-xl" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Próxima ação operacional</Label>
                <Input {...form.register("nextAction")} className="rounded-xl" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descrição</Label>
                <Textarea {...form.register("description")} className="min-h-[96px] rounded-xl" />
              </div>
              <Button disabled={pending} type="submit" className="h-12 rounded-2xl md:col-span-2">
                Guardar projeto
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          Somente o Admin registra projetos oficialmente neste playbook.
        </p>
      )}

      {initialProjects.length === 0 ? (
        <EmptyState title="Sem projetos" description="Crie projetos assim que converter leads." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {initialProjects.map((p) => (
            <ProjectCard key={p.id} project={p} clients={clients} users={users} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  clients,
  users,
}: {
  project: Project & { client: Client; owner: User };
  clients: Client[];
  users: User[];
}) {
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project.title,
      clientId: project.clientId,
      ownerId: project.ownerId,
      status: project.status,
      priority: project.priority,
      value: project.value ? String(project.value) : "",
      deadline: project.deadline ? project.deadline.toISOString().slice(0, 10) : "",
      progress: project.progress,
      nextAction: project.nextAction ?? "",
      risk: project.risk ?? "",
      description: project.description ?? "",
    },
  });

  return (
    <Card className="rounded-3xl border-2 shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="text-lg font-semibold">{project.title}</p>
          <p className="text-sm text-muted-foreground">{project.client.company}</p>
          {project.value ? (
            <p className="mt-1 text-xs font-medium text-emerald-800">{fmtBRL(Number(project.value))}</p>
          ) : null}
        </div>
        <form
          className="space-y-2 border-t pt-3 text-sm"
          onSubmit={form.handleSubmit((v) => {
            startTransition(async () => {
              try {
                await updateProjectDb(project.id, v);
                toast.success("Projeto atualizado");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Erro");
              }
            });
          })}
        >
          <div className="grid gap-2 md:grid-cols-2">
            <Select
              value={form.watch("status")}
              onValueChange={(v) => form.setValue("status", v as ProjectStatus)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={form.watch("priority")}
              onValueChange={(v) => form.setValue("priority", v as ProjectPriority)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROJECT_PRIORITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select
            value={form.watch("clientId")}
            onValueChange={(id) => {
              if (id) form.setValue("clientId", id);
            }}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.watch("ownerId")}
            onValueChange={(id) => {
              if (id) form.setValue("ownerId", id);
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
          <Input type="number" {...form.register("progress")} className="rounded-xl" />
          <Input type="date" {...form.register("deadline")} className="rounded-xl" />
          <Input {...form.register("nextAction")} placeholder="Próxima ação" className="rounded-xl" />
          <Textarea {...form.register("description")} className="min-h-[64px] rounded-xl" />
          <div className="flex gap-2">
            <Button disabled={pending} type="submit" className="flex-1 rounded-2xl">
              Guardar mudanças
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-2xl"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  if (!confirm("Remover projeto?")) return;
                  try {
                    await deleteProject(project.id);
                    toast.success("Removido");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Erro");
                  }
                })
              }
            >
              Excluir
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
