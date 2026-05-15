import { prisma } from "@/lib/prisma";
import { LeadsClient } from "@/components/leads/leads-client";

export default async function LeadsPage() {
  const [leads, users] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { updatedAt: "desc" },
      include: { owner: true },
    }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const initialLeads = leads.map((l) => ({
    ...l,
    followUpAt: l.followUpAt ? l.followUpAt.toISOString() : null,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  }));

  return <LeadsClient initialLeads={initialLeads} users={users} />;
}
