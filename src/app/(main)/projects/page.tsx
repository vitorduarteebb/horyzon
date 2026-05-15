import { auth } from "@/auth";
import { ProjectsClient } from "@/components/projects/projects-client";
import { prisma } from "@/lib/prisma";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [projects, clients, users] = await Promise.all([
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: { client: true, owner: true },
    }),
    prisma.client.findMany({ orderBy: { company: "asc" } }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <ProjectsClient
      initialProjects={projects}
      clients={clients}
      users={users}
      currentUserRole={session.user.role}
    />
  );
}
