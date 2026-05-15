"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LibraryItem } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { createLibraryItem, deleteLibraryItem, updateLibraryItem } from "@/actions/library";
import { libraryItemSchema } from "@/lib/schemas";
import { EmptyState } from "@/components/domain/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormValues = z.infer<typeof libraryItemSchema>;

const CATEGORIES = [
  { id: "scripts_whatsapp", label: "Scripts WhatsApp" },
  { id: "proposta_modelo", label: "Modelo proposta" },
  { id: "checklist_gustavo", label: "Checklist Gustavo" },
  { id: "checklist_angel", label: "Checklist Angel" },
  { id: "checklist_xavier", label: "Checklist Xavier" },
  { id: "roteiro_diagnostico", label: "Diagnóstico" },
  { id: "precificacao", label: "Precificação" },
  { id: "outros", label: "Outros" },
];

export function LibraryClient({ items }: { items: LibraryItem[] }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(libraryItemSchema),
    defaultValues: { title: "", category: "scripts_whatsapp", content: "" },
  });

  const grouped = items.reduce<Record<string, LibraryItem[]>>((acc, it) => {
    acc[it.category] = acc[it.category] ? [...acc[it.category], it] : [it];
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-2">
        <CardContent className="space-y-4 p-4 md:p-6">
          <h2 className="text-xl font-semibold">Novo item</h2>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit((v) => {
              startTransition(async () => {
                try {
                  await createLibraryItem(v);
                  toast.success("Item criado");
                  form.reset({ title: "", category: form.getValues().category, content: "" });
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Erro");
                }
              });
            })}
          >
            <div className="space-y-2">
              <Label>Título</Label>
              <Input {...form.register("title")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <select
                className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                {...form.register("category")}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea {...form.register("content")} className="min-h-[120px] rounded-xl" />
            </div>
            <Button disabled={pending} type="submit" className="h-12 rounded-2xl">
              Guardar
            </Button>
          </form>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <EmptyState title="Biblioteca vazia" description="Centralize scripts, checklists e regras." />
      ) : (
        Object.entries(grouped).map(([cat, list]) => {
          const meta = CATEGORIES.find((c) => c.id === cat);
          return (
            <section key={cat} className="space-y-3">
              <h3 className="text-lg font-semibold">{meta?.label ?? cat}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {list.map((it) => (
                  <LibraryCard key={it.id} item={it} categories={CATEGORIES} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function LibraryCard({
  item,
  categories,
}: {
  item: LibraryItem;
  categories: { id: string; label: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(libraryItemSchema),
    defaultValues: {
      title: item.title,
      category: item.category,
      content: item.content,
    },
  });

  return (
    <Card className="rounded-3xl border-2">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-lg">
            {categories.find((c) => c.id === item.category)?.label ?? item.category}
          </Badge>
        </div>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((v) => {
            startTransition(async () => {
              try {
                await updateLibraryItem(item.id, v);
                toast.success("Atualizado");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Erro");
              }
            });
          })}
        >
          <Input {...form.register("title")} className="rounded-xl" />
          <select
            className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
            {...form.register("category")}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <Textarea {...form.register("content")} className="min-h-[100px] rounded-xl" />
          <div className="flex gap-2">
            <Button disabled={pending} type="submit" className="flex-1 rounded-2xl">
              Guardar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              className="rounded-2xl"
              onClick={() =>
                startTransition(async () => {
                  if (!confirm("Remover item?")) return;
                  await deleteLibraryItem(item.id);
                  toast.success("Removido");
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
