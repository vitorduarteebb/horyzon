"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AgendaEvent, Client, Project, User, AgendaEventType } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { createAgendaEvent, deleteAgendaEvent } from "@/actions/agenda";
import { AGENDA_EVENT_TYPE_LABELS } from "@/lib/constants";
import { agendaEventSchema } from "@/lib/schemas";
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
import { EmptyState } from "@/components/domain/empty-state";

type FormValues = z.infer<typeof agendaEventSchema>;

type EventRow = AgendaEvent & { client: Client | null; project: Project | null; user: User };

export function CalendarClient({
  events,
  clients,
  projects,
  users,
  sessionUserId,
}: {
  events: EventRow[];
  clients: Client[];
  projects: Project[];
  users: User[];
  sessionUserId: string;
}) {
  const [day, setDay] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () => events.filter((e) => format(e.startsAt, "yyyy-MM-dd") === day),
    [events, day],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(agendaEventSchema),
    defaultValues: {
      title: "",
      type: "MEETING",
      userId: sessionUserId,
      clientId: "",
      projectId: "",
      startsAt: `${day}T09:00`,
      endsAt: `${day}T09:45`,
      notes: "",
    },
  });

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-2">
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="space-y-1">
            <Label>Data</Label>
            <Input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="rounded-xl" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-2">
        <CardContent className="space-y-4 p-4 md:p-6">
          <h2 className="text-xl font-semibold">Novo evento</h2>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={form.handleSubmit((v) => {
              startTransition(async () => {
                try {
                  await createAgendaEvent(v);
                  toast.success("Evento criado");
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
              <Label>Tipo</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(v) => form.setValue("type", v as AgendaEventType)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AGENDA_EVENT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select
                value={form.watch("userId")}
                onValueChange={(id) => {
                  if (id) form.setValue("userId", id);
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
              <Label>Cliente (opc.)</Label>
              <Select
                value={form.watch("clientId") || "__none__"}
                onValueChange={(val) => {
                  if (!val || val === "__none__") {
                    form.setValue("clientId", undefined);
                  } else {
                    form.setValue("clientId", val);
                  }
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhum</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Projeto (opc.)</Label>
              <Select
                value={form.watch("projectId") || "__none__"}
                onValueChange={(val) => {
                  if (!val || val === "__none__") {
                    form.setValue("projectId", undefined);
                  } else {
                    form.setValue("projectId", val);
                  }
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
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
              <Label>Início</Label>
              <Input type="datetime-local" {...form.register("startsAt")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Fim</Label>
              <Input type="datetime-local" {...form.register("endsAt")} className="rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Notas</Label>
              <Textarea {...form.register("notes")} className="min-h-[72px] rounded-xl" />
            </div>
            <Button disabled={pending} type="submit" className="h-12 rounded-2xl md:col-span-2">
              Guardar evento
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          {format(new Date(`${day}T12:00:00`), "PPPP", { locale: ptBR })}
        </h2>
        {filtered.length === 0 ? (
          <EmptyState title="Sem eventos neste dia" description="Crie reuniões, entregas e follow-ups." />
        ) : (
          <div className="space-y-3">
            {filtered.map((ev) => (
              <Card key={ev.id} className="rounded-2xl border">
                <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm uppercase text-muted-foreground">
                      {AGENDA_EVENT_TYPE_LABELS[ev.type]}
                    </p>
                    <p className="text-lg font-semibold">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(ev.startsAt, "HH:mm")} · {ev.user.name}
                    </p>
                    {ev.client ? (
                      <p className="text-xs text-muted-foreground">Cliente · {ev.client.company}</p>
                    ) : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-destructive"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        if (!confirm("Excluir evento?")) return;
                        await deleteAgendaEvent(ev.id);
                        toast.success("Removido");
                      })
                    }
                  >
                    Excluir
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
