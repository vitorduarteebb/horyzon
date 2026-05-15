"use client";

import Link from "next/link";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Client } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { createClient as createClientDb, deleteClient, updateClient as updateClientDb } from "@/actions/clients";
import { EmptyState } from "@/components/domain/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type FormValues = z.infer<typeof clientSchema>;

export function ClientsClient({ initialClients }: { initialClients: Client[] }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      company: "",
      whatsapp: "",
      email: "",
      status: "Ativo",
      notes: "",
    },
  });

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-2">
        <CardContent className="space-y-4 p-4 md:p-6">
          <h2 className="text-xl font-semibold">Novo cliente</h2>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={form.handleSubmit((v) => {
              startTransition(async () => {
                try {
                  await createClientDb(v);
                  toast.success("Cliente criado");
                  form.reset({ ...form.getValues(), name: "", company: "", whatsapp: "", email: "" });
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Erro");
                }
              });
            })}
          >
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input {...form.register("name")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Input {...form.register("company")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input {...form.register("whatsapp")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input {...form.register("email")} className="rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Status</Label>
              <Input {...form.register("status")} className="rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Notas</Label>
              <Textarea {...form.register("notes")} className="min-h-[80px] rounded-xl" />
            </div>
            <Button disabled={pending} type="submit" className="h-12 rounded-2xl md:col-span-2">
              Guardar
            </Button>
          </form>
        </CardContent>
      </Card>

      {initialClients.length === 0 ? (
        <EmptyState title="Sem clientes" description="Converta leads vencedores em clientes aqui." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {initialClients.map((c) => (
            <ClientRow key={c.id} client={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClientRow({ client }: { client: Client }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client.name,
      company: client.company,
      whatsapp: client.whatsapp,
      email: client.email,
      status: client.status,
      notes: client.notes ?? "",
    },
  });

  return (
    <Card className="rounded-3xl border-2">
      <CardContent className="space-y-3 p-4">
        <p className="text-lg font-semibold">{client.name}</p>
        <p className="text-sm text-muted-foreground">{client.company}</p>
        <form
          className="space-y-2 border-t pt-3"
          onSubmit={form.handleSubmit((v) => {
            startTransition(async () => {
              try {
                await updateClientDb(client.id, v);
                toast.success("Cliente atualizado");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Erro");
              }
            });
          })}
        >
          <Input {...form.register("status")} className="rounded-xl" />
          <Textarea {...form.register("notes")} className="min-h-[60px] rounded-xl" />
          <div className="flex gap-2">
            <Button disabled={pending} type="submit" className="flex-1 rounded-2xl">
              Atualizar
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-2xl"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  if (!confirm("Excluir cliente?")) return;
                  try {
                    await deleteClient(client.id);
                    toast.success("Excluído");
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
        <Link
          href="/projects"
          className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-11 w-full items-center justify-center rounded-2xl")}
        >
          Abrir projetos
        </Link>
      </CardContent>
    </Card>
  );
}
