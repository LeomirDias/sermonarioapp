import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { accessTokensTable, sermonsTable } from "@/db/schema";
import { getSession } from "@/lib/session";

import EditSermonForm from "./_components/edit-sermon-form";

interface EditSermonPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSermonPage({ params }: EditSermonPageProps) {
  const { id } = await params;
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

  // Buscar o sermão por ID
  const sermon = await db.query.sermonsTable.findFirst({
    where: eq(sermonsTable.id, id),
  });

  if (!sermon) {
    redirect("/history");
  }

  // Verificar se o sermão pertence ao usuário
  if (sermon.user_id !== userRecord.id) {
    redirect("/history");
  }

  return <EditSermonForm sermon={sermon} />;
}
