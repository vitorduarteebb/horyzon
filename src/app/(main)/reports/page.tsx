import { prisma } from "@/lib/prisma";
import { ReportsCharts } from "@/components/reports/reports-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtBRL } from "@/lib/format";
import { LEAD_STATUS_LABELS } from "@/lib/constants";

export default async function ReportsPage() {
  const [leadGroups, assigneeTasks, projectGroups, overdueTasks, weeklyGoals] = await Promise.all([
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.task.groupBy({ by: ["assigneeId"], _count: { _all: true } }),
    prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.task.findMany({
      where: { dueDate: { lt: new Date() }, NOT: { status: "DONE" } },
      include: { assignee: true, project: true },
      take: 15,
      orderBy: { dueDate: "asc" },
    }),
    prisma.goal.findMany({
      where: { endsAt: { gte: new Date() } },
      take: 6,
      include: { user: true },
    }),
  ]);

  const users = await prisma.user.findMany();
  const byUserId = Object.fromEntries(users.map((u) => [u.id, u.name]));

  const forecast = await prisma.project.aggregate({
    where: { status: { in: ["ACTIVE", "REVIEW", "PLANNING"] } },
    _sum: { value: true },
  });

  const leadBars = leadGroups.map((row) => ({
    name: LEAD_STATUS_LABELS[row.status],
    count: row._count._all,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-3xl border-2">
          <CardHeader>
            <CardTitle className="text-base">Leads por fase</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ReportsCharts payload={leadBars} />
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-2">
          <CardHeader>
            <CardTitle className="text-base">Tarefas por responsável</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ReportsCharts
              payload={assigneeTasks.map((row) => ({
                name: byUserId[row.assigneeId] ?? "—",
                count: row._count._all,
              }))}
            />
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-2">
          <CardHeader>
            <CardTitle className="text-base">Projetos por status</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ReportsCharts
              payload={projectGroups.map((row) => ({ name: row.status, count: row._count._all }))}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-2">
        <CardHeader>
          <CardTitle>Faturamento previsto (ativos)</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{fmtBRL(Number(forecast._sum.value ?? 0))}</CardContent>
      </Card>

      <Card className="rounded-3xl border-2">
        <CardHeader>
          <CardTitle>Tarefas atrasadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {overdueTasks.map((t) => (
            <div key={t.id} className="flex flex-wrap justify-between gap-2 rounded-xl border p-3">
              <span className="font-medium">{t.title}</span>
              <span className="text-xs text-muted-foreground">
                {String(t.status)} · {t.assignee.name}
              </span>
            </div>
          ))}
          {overdueTasks.length === 0 ? <p className="text-muted-foreground">Nada atrasado.</p> : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-2">
        <CardHeader>
          <CardTitle>Metas vigentes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {weeklyGoals.map((g) => (
            <div key={g.id} className="rounded-2xl border p-4">
              <p className="font-semibold">{g.title}</p>
              <p className="text-xs text-muted-foreground">{g.user.name}</p>
              <p className="mt-2 text-xs">
                {fmtBRL(Number(g.current))} / {fmtBRL(Number(g.target))}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
