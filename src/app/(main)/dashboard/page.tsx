import Link from "next/link";
import { UserRole } from "@prisma/client";
import { AlertTriangle, ArrowRight, Calendar, Flame, Sparkles } from "lucide-react";

import { auth } from "@/auth";
import { AlertCard } from "@/components/domain/alert-card";
import { StatCard } from "@/components/domain/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getDashboardData } from "@/lib/dashboard-data";
import { fmtBRL } from "@/lib/format";
import { LEAD_STATUS_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";
import { isDueToday, isOverdueTask } from "@/lib/dates";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const d = await getDashboardData(session.user.id, session.user.role);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Visão operacional</p>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Olá, {session.user.name?.split(" ")[0] ?? "time"}
          </h2>
        </div>
        <Link
          href="/tasks"
          className={cn(buttonVariants({ size: "lg" }), "inline-flex h-12 rounded-2xl px-4 text-base")}
        >
          Ir para tarefas
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>

      {session.user.role === UserRole.ADMIN ? (
        <AdminBoard d={d} />
      ) : session.user.role === UserRole.GUSTAVO ? (
        <GustavoBoard d={d} />
      ) : session.user.role === UserRole.ANGEL ? (
        <AngelBoard d={d} />
      ) : (
        <XavierBoard d={d} />
      )}
    </div>
  );
}

function AdminBoard({ d }: { d: Awaited<ReturnType<typeof getDashboardData>> }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Propostas abertas" value={d.openProposalsCount} icon={Sparkles} />
        <StatCard label="Faturamento previsto" value={fmtBRL(d.forecast)} hint="Projetos ativos" />
        <StatCard label="Item(s) em QA" value={d.qaPending.length} accent="amber" />
        <StatCard label="Aprovação final" value={d.tasksAwaitingFinal.length} hint="Pós-QA técnico" />
      </div>

      {d.overdueProjects.length > 0 ? (
        <AlertCard
          tone="danger"
          title="Projetos atrasados"
          description={`${d.overdueProjects.length} projeto(s) com prazo violado. Alinhe recuperação com o time.`}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-5 w-5 text-primary" />
              Leads quentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.hotLeadsAdmin.map((l) => (
              <div key={l.id} className="rounded-2xl border bg-card p-3">
                <p className="font-semibold">{l.name}</p>
                <p className="text-xs text-muted-foreground">{l.company}</p>
                <p className="mt-2 text-xs">
                  {LEAD_STATUS_LABELS[l.status]} · {l.owner.name}
                </p>
              </div>
            ))}
            {d.hotLeadsAdmin.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem leads quentes agora.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-primary" />
              Reuniões da semana
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {d.weekMeetings.map((e) => (
              <div key={e.id} className="flex justify-between gap-2 rounded-xl border p-2">
                <div>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.startsAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{e.user.name}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl border-2">
          <CardHeader>
            <CardTitle className="text-base">Tarefas bloqueadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {d.blockedTasks.map((t) => (
              <div key={t.id} className="rounded-xl border p-2 text-sm">
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.assignee.name}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-2">
          <CardHeader>
            <CardTitle className="text-base">Entregas aguardando aprovação final</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {d.tasksAwaitingFinal.map((t) => (
              <div key={t.id} className="rounded-xl border p-2 text-sm">
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">{TASK_STATUS_LABELS[t.status]}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-2">
        <CardHeader>
          <CardTitle className="text-base">Metas do time</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {d.teamGoals.map((g) => (
            <div key={g.id} className="rounded-2xl border p-3">
              <p className="text-sm font-semibold">{g.title}</p>
              <p className="text-xs text-muted-foreground">{g.user.name}</p>
              <p className="mt-2 text-xs">
                Atual: {Number(g.current)} / Meta: {Number(g.target)} · {g.period}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function GustavoBoard({ d }: { d: Awaited<ReturnType<typeof getDashboardData>> }) {
  const mine = d.myTasks;
  const blocked = mine.filter((t) => t.status === "BLOCKED");
  const qa = mine.filter((t) => t.status === "READY_FOR_QA");
  const repro = mine.filter((t) => t.status === "REJECTED");
  const near = mine.filter((t) => t.dueDate && (isDueToday(t.dueDate) || isOverdueTask(t.dueDate, t.status)));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Em produção" value={d.myProjectsActive.length} />
        <StatCard label="Prontas p/ QA" value={qa.length} accent="amber" />
        <StatCard label="Bloqueadas" value={blocked.length} accent="danger" />
        <StatCard label="Reprovadas" value={repro.length} />
      </div>
      {near.length > 0 ? (
        <AlertCard
          tone="warning"
          title="Prazos críticos"
          description="Há tarefas com vencimento hoje ou atrasadas na sua fila."
        />
      ) : null}
      <Card className="rounded-3xl border-2">
        <CardHeader>
          <CardTitle className="text-base">Checklist técnico</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1) Mover tarefa para READY_FOR_QA quando o build estiver estável.</p>
          <p>2) Marcar bloqueios cedo — evita surpresa no prazo.</p>
          <p>3) QA automático notifica Xavier — acompanhe reprovações.</p>
        </CardContent>
      </Card>
      <Card className="rounded-3xl border-2">
        <CardHeader>
          <CardTitle className="text-base">Suas tarefas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {mine.slice(0, 12).map((t) => (
            <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-2 text-sm">
              <span className="font-medium">{t.title}</span>
              <span className="text-xs text-muted-foreground">{TASK_STATUS_LABELS[t.status]}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AngelBoard({ d }: { d: Awaited<ReturnType<typeof getDashboardData>> }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Leads na fila" value={d.leadsAngelBucket.length} />
        <StatCard label="Follow-ups hoje" value={d.followUpsToday.length} accent="amber" />
        <StatCard label="Conteúdos pendentes" value={d.creativesPending} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl border-2">
          <CardHeader>
            <CardTitle className="text-base">Leads para responder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {d.leadsAngelBucket.slice(0, 8).map((l) => (
              <div key={l.id} className="rounded-xl border p-2">
                <p className="font-semibold">{l.name}</p>
                <p className="text-xs text-muted-foreground">{LEAD_STATUS_LABELS[l.status]}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-2">
          <CardHeader>
            <CardTitle className="text-base">Feedback / depoimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {d.feedbackTasks.map((t) => (
              <div key={t.id} className="rounded-xl border p-2">
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.project?.title}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-3xl border-2">
        <CardHeader>
          <CardTitle className="text-base">Mensagens internas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {d.internalMessages.map((m) => (
            <div key={m.id} className="rounded-xl border p-2">
              <p className="font-medium">{m.sender.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{m.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function XavierBoard({ d }: { d: Awaited<ReturnType<typeof getDashboardData>> }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Pendentes de QA" value={d.qaPending.length} accent="amber" />
        <StatCard label="Reprovações hoje" value={d.qaRejected.length} />
        <StatCard label="Landings rastreadas" value={d.landingTasks.length} />
      </div>
      <AlertCard
        tone="info"
        title="Fluxo de validação"
        description="Sempre que reprovar, descreva o motivo — a tarefa volta para REJECTED com contexto para o Gustavo."
      />
      <Card className="rounded-3xl border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Fila QA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {d.qaPending.map((q) => (
            <div key={q.id} className="rounded-xl border p-2">
              <p className="font-semibold">{q.title}</p>
              <p className="text-xs text-muted-foreground">{q.project.title}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
