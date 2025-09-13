import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { accessSermonsTable, accessTokensTable, sermonFilesTable, sermonsTable } from "@/db/schema";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sermonId: string; token: string }> }
) {
    try {
        const { sermonId, token } = await params;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") as "pdf" | "json";

        if (!type || !["pdf", "json"].includes(type)) {
            return NextResponse.json(
                { error: "Tipo de arquivo inválido" },
                { status: 400 }
            );
        }

        // Buscar o sermão
        const sermon = await db
            .select()
            .from(sermonsTable)
            .where(eq(sermonsTable.id, sermonId))
            .limit(1);

        if (!sermon.length) {
            return NextResponse.json(
                { error: "Sermão não encontrado" },
                { status: 404 }
            );
        }

        const sermonData = sermon[0];

        // Verificar se é gratuito ou se o usuário tem acesso
        const isFree = sermonData.price_in_cents === 0;

        if (!isFree) {
            if (!token) {
                return NextResponse.json(
                    { error: "Token de acesso necessário" },
                    { status: 401 }
                );
            }

            // Buscar o cliente pelo token
            const client = await db
                .select()
                .from(accessTokensTable)
                .where(eq(accessTokensTable.token, token))
                .limit(1);

            if (!client.length) {
                return NextResponse.json(
                    { error: "Token inválido" },
                    { status: 401 }
                );
            }

            // Verificar se o usuário tem acesso a este sermão
            const access = await db
                .select()
                .from(accessSermonsTable)
                .where(
                    and(
                        eq(accessSermonsTable.client_token, token),
                        eq(accessSermonsTable.sermon_id, sermonId),
                        eq(accessSermonsTable.status, "approved")
                    )
                )
                .limit(1);

            if (!access.length) {
                return NextResponse.json(
                    { error: "Acesso negado. Sermão não adquirido." },
                    { status: 403 }
                );
            }
        }

        // Buscar o arquivo correspondente
        const file = await db
            .select()
            .from(sermonFilesTable)
            .where(
                and(
                    eq(sermonFilesTable.sermon_id, sermonId),
                    eq(sermonFilesTable.type, type)
                )
            )
            .limit(1);

        if (!file.length) {
            return NextResponse.json(
                { error: "Arquivo não encontrado" },
                { status: 404 }
            );
        }

        const fileData = file[0];

        // Buscar o arquivo do blob da Vercel
        try {
            const response = await fetch(fileData.url);

            if (!response.ok) {
                throw new Error("Erro ao buscar arquivo do blob");
            }

            const fileBuffer = await response.arrayBuffer();

            // Retornar o arquivo
            return new NextResponse(fileBuffer, {
                headers: {
                    "Content-Type": type === "pdf" ? "application/pdf" : "application/json",
                    "Content-Disposition": `attachment; filename="sermao-${sermonId}.${type}"`,
                },
            });
        } catch (error) {
            console.error("Erro ao buscar arquivo do blob:", error);
            return NextResponse.json(
                { error: "Erro ao buscar arquivo" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Erro no download:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
