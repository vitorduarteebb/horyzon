import { auth } from "@/auth";
import { TasksClient } from "@/components/tasks/tasks-client";
import { prisma } from "@/lib/prisma";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [tasksRaw, users, projects, clients] = await Promise.all([
    prisma.task.findMany({
      orderBy: { updatedAt: "desc" },
      include: { assignee: true, project: true },
    }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    prisma.client.findMany({ orderBy: { company: "asc" }, select: { id: true, name: true, company: true } }),
  ]);

  const initialTasks = tasksRaw.map((t) => ({
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return (
    <TasksClient
      initialTasks={initialTasks}
      users={users}
      projects={projects}
      clients={clients}
      role={session.user.role}
    />
  );
}
