import {
  endOfWeek,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import type { UserRole } from "@prisma/client";
import {
  LeadPipelineStatus,
  LeadTemperature,
  ProjectStatus,
  TaskStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

const openProposalStatuses: LeadPipelineStatus[] = [
  LeadPipelineStatus.PROPOSAL,
  LeadPipelineStatus.CLOSING,
];

export async function getDashboardData(userId: string, role: UserRole) {
  const now = new Date();
  const dayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { locale: ptBR });
  const weekEnd = endOfWeek(now, { locale: ptBR });

  const [
    hotLeadsAdmin,
    weekMeetings,
    openProposalsCount,
    overdueProjects,
    blockedTasks,
    qaPending,
    qaRejected,
    tasksAwaitingFinal,
    teamGoals,
    forecastRevenue,
    nextActionsLeads,
    myTasks,
    myProjectsActive,
    internalMessages,
    leadsAngelBucket,
    followUpsToday,
    readyForQAGlobal,
  ] = await Promise.all([
    prisma.lead.findMany({
      where: { temperature: LeadTemperature.HOT },
      take: 8,
      orderBy: { followUpAt: "asc" },
      include: { owner: true },
    }),
    prisma.agendaEvent.findMany({
      where: {
        startsAt: { gte: weekStart, lte: weekEnd },
      },
      orderBy: { startsAt: "asc" },
      take: 18,
      include: { client: true, project: true, user: true },
    }),
    prisma.lead.count({
      where: { status: { in: openProposalStatuses } },
    }),
    prisma.project.findMany({
      where: {
        deadline: { lt: now },
        status: {
          notIn: [ProjectStatus.COMPLETED, ProjectStatus.CANCELLED],
        },
      },
      take: 8,
      include: { client: true, owner: true },
    }),
    prisma.task.findMany({
      where: { status: TaskStatus.BLOCKED },
      take: 10,
      include: { assignee: true, project: true },
    }),
    prisma.qAItem.findMany({
      where: { status: "PENDING" },
      take: 12,
      include: {
        task: true,
        project: { include: { client: true } },
        tester: true,
      },
    }),
    prisma.qAItem.findMany({
      where: {
        status: "REJECTED",
        testedAt: { gte: dayStart },
      },
      orderBy: { testedAt: "desc" },
      take: 6,
      include: { task: true, tester: true, project: true },
    }),
    prisma.task.findMany({
      where: { status: TaskStatus.APPROVED },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        assignee: true,
        project: { include: { client: true } },
      },
    }),
    prisma.goal.findMany({
      where: { endsAt: { gte: now } },
      orderBy: { endsAt: "asc" },
      take: 12,
      include: { user: true },
    }),
    prisma.project.aggregate({
      where: {
        status: {
          in: [
            ProjectStatus.ACTIVE,
            ProjectStatus.PLANNING,
            ProjectStatus.REVIEW,
          ],
        },
      },
      _sum: { value: true },
    }),
    prisma.lead.findMany({
      where: {
        OR: [{ nextAction: { not: null } }, { followUpAt: { not: null } }],
      },
      orderBy: { followUpAt: "asc" },
      take: 10,
      include: { owner: true },
    }),
    prisma.task.findMany({
      where: { assigneeId: userId },
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
      take: 30,
      include: { project: true, client: true },
    }),
    prisma.project.findMany({
      where: {
        ownerId: userId,
        status: { in: [ProjectStatus.ACTIVE, ProjectStatus.REVIEW] },
      },
      take: 8,
      include: { client: true },
    }),
    prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { sender: true, thread: true },
    }),
    prisma.lead.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { status: LeadPipelineStatus.QUALIFICATION },
        ],
      },
      take: 15,
      orderBy: { updatedAt: "desc" },
      include: { owner: true },
    }),
    prisma.lead.findMany({
      where: {
        followUpAt: {
          gte: dayStart,
          lt: new Date(dayStart.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      take: 15,
      include: { owner: true },
    }),
    prisma.task.findMany({
      where: { status: TaskStatus.READY_FOR_QA },
      take: 15,
      include: { assignee: true, project: true },
    }),
  ]);

  const forecast = Number(forecastRevenue._sum.value ?? 0);

  const landingTasks =
    role === "XAVIER"
      ? await prisma.task.findMany({
          where: {
            OR: [
              { title: { contains: "landing" } },
              { title: { contains: "Landing" } },
            ],
          },
          take: 8,
          include: { project: true },
        })
      : [];

  const feedbackTasks =
    role === "ANGEL"
      ? await prisma.task.findMany({
          where: {
            assigneeId: userId,
            OR: [
              { title: { contains: "feedback" } },
              { title: { contains: "depoimento" } },
            ],
          },
          take: 10,
          include: { project: true },
        })
      : [];

  const diagnosisLeads =
    role === "ANGEL"
      ? await prisma.lead.findMany({
          where: {
            ownerId: userId,
            status: LeadPipelineStatus.DIAGNOSIS,
          },
          take: 8,
        })
      : [];

  const creativesPending =
    role === "ANGEL"
      ? await prisma.task.count({
          where: {
            assigneeId: userId,
            status: { not: TaskStatus.DONE },
            title: { contains: "conteúdo" },
          },
        })
      : 0;

  return {
    role,
    now,
    dayStart,
    hotLeadsAdmin,
    weekMeetings,
    openProposalsCount,
    overdueProjects,
    blockedTasks,
    qaPending,
    qaRejected,
    tasksAwaitingFinal,
    teamGoals,
    forecast,
    nextActionsLeads,
    myTasks,
    myProjectsActive,
    internalMessages,
    leadsAngelBucket,
    followUpsToday,
    readyForQAGlobal,
    landingTasks,
    feedbackTasks,
    diagnosisLeads,
    creativesPending,
  };
}

export type DashboardPayload = Awaited<ReturnType<typeof getDashboardData>>;
