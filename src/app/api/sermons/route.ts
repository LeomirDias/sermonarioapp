import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { accessTokensTable, sermonsTable } from "@/db/schema";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar o user_id a partir do email da sessão
    const userRecord = await db.query.accessTokensTable.findFirst({
      where: eq(accessTokensTable.email, session.email),
    });

    if (!userRecord || userRecord.status !== "active") {
      return NextResponse.json(
        { error: "Usuário não encontrado ou inativo" },
        { status: 403 },
      );
    }

    // Buscar todos os sermões do usuário ordenados por data de criação (mais recentes primeiro)
    const sermons = await db.query.sermonsTable.findMany({
      where: eq(sermonsTable.user_id, userRecord.id),
      orderBy: (sermons, { desc }) => [desc(sermons.createdAt)],
    });

    return NextResponse.json(sermons);
  } catch (error) {
    console.error("Erro ao buscar sermões:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
