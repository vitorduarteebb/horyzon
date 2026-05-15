import { prisma } from "@/lib/prisma";
import { GoalsClient } from "@/components/goals/goals-client";

export default async function GoalsPage() {
  const [goals, users] = await Promise.all([
    prisma.goal.findMany({ orderBy: { endsAt: "asc" } }),
    prisma.user.findMany({ where: { active: true } }),
  ]);

  return <GoalsClient goals={goals} users={users} />;
}
