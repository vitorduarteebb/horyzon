import { prisma } from "@/lib/prisma";
import { QAClient } from "@/components/qa/qa-client";

export default async function QAPage() {
  const items = await prisma.qAItem.findMany({
    orderBy: { updatedAt: "desc" },
    include: { project: true, task: true, tester: true },
  });

  return <QAClient items={items} />;
}
