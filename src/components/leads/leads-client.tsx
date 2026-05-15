"use client";

import { useMemo, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Lead, LeadPipelineStatus, LeadTemperature, User } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { createLead, deleteLead, updateLead } from "@/actions/leads";
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
import {
  LEAD_STATUS_LABELS,
  LEAD_TEMPERATURE_LABELS,
  ROLE_LABELS,
} from "@/lib/constants";
import { isDueToday } from "@/lib/dates";
import { leadSchema } from "@/lib/schemas";

type LeadRow = Omit<Lead, "followUpAt"> & { followUpAt: string | null };
type FormValues = z.infer<typeof leadSchema>;

export function LeadsClient({
  initialLeads,
  users,
}: {
  initialLeads: LeadRow[];
  users: Pick<User, "id" | "name" | "role" | "email">[];
}) {
  const adminUser = users.find((u) => u.role === "ADMIN");
  const [pending, startTransition] = useTransition();
  const followUpsStale = useMemo(
    () => initialLeads.filter((l) => l.followUpAt && new Date(l.followUpAt) < new Date()),
    [initialLeads],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      company: "",
      whatsapp: "",
      email: "",
      source: "WhatsApp",
      temperature: "WARM" as LeadTemperature,
      status: "NEW" as LeadPipelineStatus,
      ownerId: adminUser?.id ?? users[0]?.id ?? "",
      nextAction: "",
      followUpAt: "",
      notes: "",
    },
  });

  return (
    <div className="space-y-6">
      {followUpsStale.length > 0 ? (
        <AlertCard
          tone="warning"
          title="Follow-ups urgentes"
          description={`${followUpsStale.length} lead(s) com retorno no passado. Defina próximas ações hoje.`}
        />
      ) : null}

      <Card className="rounded-3xl border-2 shadow-sm">
        <CardContent className="space-y-4 p-4 md:p-6">
          <div>
            <h2 className="text-xl font-semibold">Novo lead</h2>
            <p className="text-sm text-muted-foreground">
              Angel qualifica e passa ao Admin conforme o playbook.
            </p>
          </div>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={form.handleSubmit((values) => {
              startTransition(async () => {
                try {
                  await createLead(values);
                  toast.success("Lead criado");
                  form.reset({
                    ...form.getValues(),
                    name: "",
                    company: "",
                    whatsapp: "",
                    email: "",
                    nextAction: "",
                    notes: "",
                  });
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Erro ao criar lead");
                }
              });
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...form.register("name")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input id="company" {...form.register("company")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" {...form.register("whatsapp")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail opcional</Label>
              <Input id="email" {...form.register("email")} className="rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2 grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Origem</Label>
                <Input {...form.register("source")} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Temperatura</Label>
                <Select
                  value={form.watch("temperature")}
                  onValueChange={(v) => form.setValue("temperature", v as LeadTemperature, { shouldValidate: true })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEAD_TEMPERATURE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fase</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v) => form.setValue("status", v as LeadPipelineStatus, { shouldValidate: true })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Responsável</Label>
              <Select
                value={form.watch("ownerId")}
                onValueChange={(v) => {
                  if (v) form.setValue("ownerId", v, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({ROLE_LABELS[u.role]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nextAction">Próxima ação</Label>
              <Input id="nextAction" {...form.register("nextAction")} className="rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2 md:w-72">
              <Label htmlFor="followUpAt">Follow-up</Label>
              <Input id="followUpAt" type="datetime-local" {...form.register("followUpAt")} className="rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" {...form.register("notes")} className="min-h-[80px] rounded-xl" />
            </div>
            <Button disabled={pending} type="submit" className="h-12 rounded-2xl md:col-span-2">
              Guardar lead
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pipeline</h2>
        {initialLeads.length === 0 ? (
          <EmptyState title="Nenhum lead" description="Crie seu primeiro contacto através do formulário acima." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {initialLeads.map((lead) => (
              <LeadCardRow key={lead.id} lead={lead} users={users} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function LeadCardRow({ lead, users }: { lead: LeadRow; users: Pick<User, "id" | "name" | "role" | "email">[] }) {
  const [pending, startTransition] = useTransition();
  const fu = lead.followUpAt ? new Date(lead.followUpAt) : null;
  const followLate = fu !== null && fu < new Date();

  const form = useForm<FormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: lead.name,
      company: lead.company,
      whatsapp: lead.whatsapp,
      email: lead.email ?? "",
      source: lead.source,
      temperature: lead.temperature,
      status: lead.status,
      ownerId: lead.ownerId,
      nextAction: lead.nextAction ?? "",
      followUpAt: lead.followUpAt ? lead.followUpAt.slice(0, 16) : "",
      notes: lead.notes ?? "",
    },
  });

  return (
    <Card className="rounded-3xl border-2 shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge className="rounded-lg border-emerald-200 bg-emerald-50 text-emerald-900">
            {LEAD_TEMPERATURE_LABELS[lead.temperature]}
          </Badge>
          <Badge variant="outline" className="rounded-lg">
            {LEAD_STATUS_LABELS[lead.status]}
          </Badge>
        </div>
        <div>
          <p className="text-lg font-semibold">{lead.name}</p>
          <p className="text-sm text-muted-foreground">{lead.company}</p>
        </div>
        <form
          className="space-y-3 border-t pt-3"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              try {
                await updateLead(lead.id, values);
                toast.success("Lead atualizado");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Erro");
              }
            });
          })}
        >
          <Select
            value={form.watch("status")}
            onValueChange={(v) => form.setValue("status", v as LeadPipelineStatus, { shouldValidate: true })}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.watch("ownerId")}
            onValueChange={(id) => {
              if (id) form.setValue("ownerId", id, { shouldValidate: true });
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
          <Input {...form.register("nextAction")} placeholder="Próxima ação" className="rounded-xl" />
          <Input type="datetime-local" {...form.register("followUpAt")} className="rounded-xl" />
          <Textarea {...form.register("notes")} placeholder="Notas" className="min-h-[64px] rounded-xl" />
          {followLate ? (
            <p className="text-xs font-semibold text-amber-800">Follow-up atrasado</p>
          ) : fu && isDueToday(fu) ? (
            <p className="text-xs font-semibold text-emerald-800">Follow-up hoje</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button disabled={pending} type="submit" size="lg" className="flex-1 rounded-2xl">
              Guardar mudanças
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              className="rounded-2xl"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  if (!confirm("Excluir este lead?")) return;
                  try {
                    await deleteLead(lead.id);
                    toast.success("Excluído");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Erro ao excluir");
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
