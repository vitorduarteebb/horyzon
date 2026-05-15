"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createChatThread, markThreadRead, sendChatMessage } from "@/actions/chat";
import type { ChatMessage, ChatThread, Project, Task, User } from "@prisma/client";
import { toast } from "sonner";

type ThreadFull = ChatThread & {
  project: Project | null;
  task: Task | null;
  messages: (ChatMessage & { sender: User })[];
  _count?: { messages: number };
};

export function ChatClient({
  threads,
}: {
  threads: ThreadFull[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState(threads[0]?.id ?? "");
  const selected = useMemo(() => threads.find((t) => t.id === selectedId), [threads, selectedId]);
  const [newTitle, setNewTitle] = useState("");
  const [composer, setComposer] = useState("");

  useEffect(() => {
    if (!selectedId) return;
    void markThreadRead(selectedId);
  }, [selectedId]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(220px,320px)_1fr]">
      <Card className="rounded-3xl border-2 lg:h-[calc(100dvh-8rem)]">
        <CardContent className="space-y-3 p-4">
          <div className="space-y-2">
            <Label>Nova conversa</Label>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="rounded-xl" placeholder="Nome do tema" />
            <Button
              className="h-11 w-full rounded-2xl"
              disabled={pending || !newTitle.trim()}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await createChatThread({ title: newTitle.trim() });
                    setNewTitle("");
                    toast.success("Conversa criada");
                    router.refresh();
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Erro");
                  }
                })
              }
            >
              Criar
            </Button>
          </div>
          <ScrollArea className="h-[360px] pr-3 lg:h-[calc(100%-160px)]">
            <div className="space-y-2">
              {threads.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={`flex w-full flex-col rounded-2xl border px-3 py-2 text-left text-sm transition ${
                    selectedId === t.id ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  <span className="font-semibold line-clamp-2">{t.title}</span>
                  {t.project ? (
                    <span className="text-xs text-muted-foreground line-clamp-1">{t.project.title}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-2 lg:h-[calc(100dvh-8rem)]">
        <CardContent className="flex h-full flex-col gap-3 p-4">
          {selected ? (
            <>
              <div>
                <p className="text-lg font-semibold">{selected.title}</p>
                <p className="text-xs text-muted-foreground">
                  {selected.updatedAt ? new Date(selected.updatedAt).toLocaleString("pt-BR") : ""}
                </p>
              </div>
              <ScrollArea className="flex-1 rounded-2xl border bg-muted/20 p-3">
                <div className="space-y-3">
                  {selected.messages.map((m) => (
                    <div key={m.id} className="rounded-2xl bg-card px-3 py-2 shadow-sm border">
                      <p className="text-xs font-semibold text-muted-foreground">
                        {m.sender.name}{" "}
                        <span className="font-normal">{new Date(m.createdAt).toLocaleString("pt-BR")}</span>
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  className="min-h-[88px] rounded-2xl"
                  placeholder="Compartilhe update com o squad…"
                />
                <Button
                  className="h-11 w-full rounded-2xl"
                  disabled={!composer.trim() || pending}
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        await sendChatMessage({ threadId: selected.id, content: composer.trim() });
                        setComposer("");
                        toast.success("Enviado");
                        router.refresh();
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Erro");
                      }
                    })
                  }
                >
                  Enviar
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Selecione uma conversa.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
