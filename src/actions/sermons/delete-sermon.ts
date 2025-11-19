"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { accessTokensTable, sermonsTable } from "@/db/schema";
import { getSession } from "@/lib/session";

export async function deleteSermon(sermonId: string) {
  try {
    const session = await getSession();
    if (!session?.email) {
      return { error: "Não autorizado" };
    }

    // Buscar o user_id a partir do email da sessão
    const userRecord = await db.query.accessTokensTable.findFirst({
      where: eq(accessTokensTable.email, session.email),
    });

    if (!userRecord || userRecord.status !== "active") {
      return { error: "Usuário não encontrado ou inativo" };
    }

    // Verificar se o sermão pertence ao usuário
    const sermon = await db.query.sermonsTable.findFirst({
      where: eq(sermonsTable.id, sermonId),
    });

    if (!sermon) {
      return { error: "Sermão não encontrado" };
    }

    if (sermon.user_id !== userRecord.id) {
      return { error: "Você não tem permissão para excluir este sermão" };
    }

    // Deletar o sermão
    await db.delete(sermonsTable).where(eq(sermonsTable.id, sermonId));

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir sermão:", error);
    return { error: "Erro ao excluir sermão" };
  }
}
