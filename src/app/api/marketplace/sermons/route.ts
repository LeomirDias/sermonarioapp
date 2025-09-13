import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { sermonFilesTable, sermonsTable } from "@/db/schema";

export async function GET() {
    try {
        // Buscar todos os sermões com seus arquivos
        const sermons = await db
            .select({
                id: sermonsTable.id,
                title: sermonsTable.title,
                theme: sermonsTable.theme,
                mainVerse: sermonsTable.mainVerse,
                objective: sermonsTable.objective,
                description: sermonsTable.description,
                price_in_cents: sermonsTable.price_in_cents,
                checkout_url: sermonsTable.checkout_url,
                createdAt: sermonsTable.createdAt,
                updatedAt: sermonsTable.updatedAt,
            })
            .from(sermonsTable)
            .orderBy(sermonsTable.createdAt);

        // Buscar arquivos para cada sermão
        const sermonsWithFiles = await Promise.all(
            sermons.map(async (sermon) => {
                const files = await db
                    .select({
                        id: sermonFilesTable.id,
                        type: sermonFilesTable.type,
                        url: sermonFilesTable.url,
                    })
                    .from(sermonFilesTable)
                    .where(eq(sermonFilesTable.sermon_id, sermon.id));

                return {
                    ...sermon,
                    files,
                    hasAccess: sermon.price_in_cents === 0, // Sermões gratuitos sempre têm acesso
                };
            })
        );

        return NextResponse.json(sermonsWithFiles);
    } catch (error) {
        console.error("Erro ao buscar sermões:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
