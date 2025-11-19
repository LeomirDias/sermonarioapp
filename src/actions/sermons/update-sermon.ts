"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { accessTokensTable, sermonsTable } from "@/db/schema";
import { getSession } from "@/lib/session";

export async function updateSermon(
  sermonId: string,
  data: {
    title?: string;
    theme?: string;
    main_verse?: string;
    verse_text?: string;
    objective?: string;
    date?: string | null;
    sermon_json?: string;
  },
) {
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
      return { error: "Você não tem permissão para editar este sermão" };
    }

    // Validar sermon_json se fornecido
    if (data.sermon_json !== undefined) {
      try {
        JSON.parse(data.sermon_json);
      } catch {
        return { error: "sermon_json inválido. Deve ser um JSON válido." };
      }
    }

    // Preparar dados para atualização
    const updateData: {
      title?: string;
      theme?: string;
      main_verse?: string;
      verse_text?: string;
      objective?: string;
      date?: string | null;
      sermon_json?: string;
      updatedAt: Date;
    } = {
      ...data,
      updatedAt: new Date(),
    };

    // Atualizar o sermão
    await db
      .update(sermonsTable)
      .set(updateData)
      .where(eq(sermonsTable.id, sermonId));

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar sermão:", error);
    return { error: "Erro ao atualizar sermão" };
  }
}
