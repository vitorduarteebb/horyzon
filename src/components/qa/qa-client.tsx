"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { approveQAItem, rejectQAItem } from "@/actions/qa";
import { QA_ITEM_STATUS_LABELS } from "@/lib/constants";
import { DEFAULT_QA_ITEMS } from "@/lib/qa-default-checklist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/domain/empty-state";

type QAItemView = {
  id: string;
  title: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  notes: string | null;
  testedAt: Date | null;
  project: { title: string };
  task: { id: string; title: string | null } | null;
  tester: { name: string };
};

export function QAClient({ items }: { items: QAItemView[] }) {
  const pendingItems = items.filter((i) => i.status === "PENDING");
  const history = items.filter((i) => i.status !== "PENDING");

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-2 bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg">Checklist de validação padrão</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48 rounded-2xl border p-3 md:h-40">
            <ul className="space-y-2 text-sm">
              {DEFAULT_QA_ITEMS.map((label) => (
                <li key={label} className="flex gap-2 leading-snug">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  {label}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Fila ativa ({pendingItems.length})</h2>
        {pendingItems.length === 0 ? (
          <EmptyState title="Nenhum QA pendente" description="Tasks em READY_FOR_QA aparecem aqui." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingItems.map((item) => (
              <QAItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Histórico recente</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {history.slice(0, 12).map((item) => (
            <Card key={`${item.id}-hist`} className="rounded-2xl border">
              <CardContent className="space-y-2 p-4 text-sm">
                <Badge variant="outline" className="rounded-lg">
                  {QA_ITEM_STATUS_LABELS[item.status]}
                </Badge>
                <p className="font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.project.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function QAItemCard({ item }: { item: QAItemView }) {
  const [motivo, setMotivo] = useState("");
  const [pending, startTransition] = useTransition();
  const [checks, setChecks] = useState<Record<number, boolean>>({});

  return (
    <Card className="rounded-3xl border-2">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge className="rounded-lg bg-primary/15 text-primary">Pendente</Badge>
          <span className="text-xs text-muted-foreground">{item.project.title}</span>
        </div>
        <p className="text-lg font-semibold">{item.title}</p>
        {item.task ? (
          <p className="text-xs text-muted-foreground">Task: {item.task.title ?? item.task.id}</p>
        ) : null}
        <div className="space-y-2 border-t pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Checklist rápido
          </p>
          {DEFAULT_QA_ITEMS.slice(0, 7).map((label, idx) => (
            <label key={label} className="flex items-start gap-2 text-sm leading-snug">
              <input
                type="checkbox"
                checked={checks[idx] ?? false}
                onChange={(e) => setChecks((s) => ({ ...s, [idx]: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded-md border border-border"
              />
              {label}
            </label>
          ))}
        </div>
        <div className="space-y-2">
          <Label>Observações</Label>
          <Textarea
            placeholder="Registrar achados rápidos"
            className="min-h-[64px] rounded-xl"
          />
          <Label>Reprovação · motivo (obrigatório se reprovar)</Label>
          <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} className="rounded-xl" />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="h-11 flex-1 rounded-2xl"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await approveQAItem(item.id);
                  toast.success("Aprovado no QA");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Erro");
                }
              })
            }
          >
            Aprovar
          </Button>
          <Button
            variant="destructive"
            className="h-11 flex-1 rounded-2xl"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await rejectQAItem({ qaItemId: item.id, reason: motivo });
                  toast.success("Reprovação registrada");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Erro");
                }
              })
            }
          >
            Reprovar e devolver
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
