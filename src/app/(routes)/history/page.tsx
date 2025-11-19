import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { accessTokensTable, sermonsTable } from "@/db/schema";
import { getSession } from "@/lib/session";

import SermonHistoryGrid from "./_components/sermon-history-grid";

export default async function HistoryPage() {
  const session = await getSession();

  if (!session) {
    redirect("/acess-not-found");
  }

  // Buscar o user_id a partir do email da sessão
  const userRecord = await db.query.accessTokensTable.findFirst({
    where: eq(accessTokensTable.email, session.email),
  });

  if (!userRecord || userRecord.status !== "active") {
    redirect("/acess-not-found");
  }

  // Buscar todos os sermões do usuário ordenados por data de criação (mais recentes primeiro)
  const sermons = await db.query.sermonsTable.findMany({
    where: eq(sermonsTable.user_id, userRecord.id),
    orderBy: (sermons, { desc }) => [desc(sermons.createdAt)],
  });

  return <SermonHistoryGrid initialSermons={sermons} />;
}
