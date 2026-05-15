import { auth } from "@/auth";
import { CalendarClient } from "@/components/calendar/calendar-client";
import { prisma } from "@/lib/prisma";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user.id) return null;

  const [events, clients, projects, users] = await Promise.all([
    prisma.agendaEvent.findMany({
      orderBy: { startsAt: "asc" },
      include: { client: true, project: true, user: true },
      take: 200,
    }),
    prisma.client.findMany(),
    prisma.project.findMany(),
    prisma.user.findMany({ where: { active: true } }),
  ]);

  return (
    <CalendarClient
      events={events}
      clients={clients}
      projects={projects}
      users={users}
      sessionUserId={session.user.id}
    />
  );
}
