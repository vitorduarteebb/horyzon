"use client";

import { useMemo, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Goal, User } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { createGoal, deleteGoal, updateGoal } from "@/actions/goals";
import { fmtBRL } from "@/lib/format";
import { goalSchema } from "@/lib/schemas";
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

type FormValues = z.infer<typeof goalSchema>;

export function GoalsClient({ goals, users }: { goals: Goal[]; users: User[] }) {
  const [pending, startTransition] = useTransition();
  const starts = useMemo(() => new Date(), []);
  const ends = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d;
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      userId: users[0]?.id ?? "",
      title: "",
      target: "100000",
      current: "0",
      period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
      startsAt: starts.toISOString().slice(0, 10),
      endsAt: ends.toISOString().slice(0, 10),
    },
  });

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-2">
        <CardContent className="space-y-4 p-4 md:p-6">
          <h2 className="text-xl font-semibold">Nova meta</h2>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={form.handleSubmit((v) => {
              startTransition(async () => {
                try {
                  await createGoal(v);
                  toast.success("Meta criada");
                  form.reset({ ...form.getValues(), title: "" });
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
              <Label>Pessoa</Label>
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
              <Label>Período</Label>
              <Input {...form.register("period")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Meta (valor)</Label>
              <Input {...form.register("target")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Atual</Label>
              <Input {...form.register("current")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Início</Label>
              <Input type="date" {...form.register("startsAt")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Fim</Label>
              <Input type="date" {...form.register("endsAt")} className="rounded-xl" />
            </div>
            <Button disabled={pending} type="submit" className="h-12 rounded-2xl md:col-span-2">
              Guardar
            </Button>
          </form>
        </CardContent>
      </Card>

      {goals.length === 0 ? (
        <EmptyState title="Sem metas" description="Defina metas claras para cada pilar." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {goals.map((g) => (
            <GoalRow key={g.id} goal={g} />
          ))}
        </div>
      )}
    </div>
  );
}

function GoalRow({ goal }: { goal: Goal }) {
  const [pending, startTransition] = useTransition();
  const progress = Number(goal.target) ? (Number(goal.current) / Number(goal.target)) * 100 : 0;

  const form = useForm<FormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      userId: goal.userId,
      title: goal.title,
      target: String(goal.target),
      current: String(goal.current),
      period: goal.period,
      startsAt: goal.startsAt.toISOString().slice(0, 10),
      endsAt: goal.endsAt.toISOString().slice(0, 10),
    },
  });

  return (
    <Card className="rounded-3xl border-2">
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="text-lg font-semibold">{goal.title}</p>
          <p className="text-xs text-muted-foreground">{goal.period}</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <p className="text-sm">
          {fmtBRL(Number(goal.current))} / {fmtBRL(Number(goal.target))}
        </p>
        <form
          className="space-y-2 border-t pt-3"
          onSubmit={form.handleSubmit((v) => {
            startTransition(async () => {
              try {
                await updateGoal(goal.id, v);
                toast.success("Meta atualizada");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Erro");
              }
            });
          })}
        >
          <Input {...form.register("current")} className="rounded-xl" />
          <div className="flex gap-2">
            <Button disabled={pending} type="submit" className="flex-1 rounded-2xl">
              Atualizar progresso
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-2xl"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  if (!confirm("Excluir meta?")) return;
                  await deleteGoal(goal.id);
                  toast.success("Removida");
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
