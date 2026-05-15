import { prisma } from "@/lib/prisma";
import { LibraryClient } from "@/components/library/library-client";

export default async function LibraryPage() {
  const items = await prisma.libraryItem.findMany({ orderBy: { updatedAt: "desc" } });
  return <LibraryClient items={items} />;
}
