import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { accessSermonsTable, accessTokensTable } from "@/db/schema";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { sermonIds } = await request.json();
        const { token } = await params;

        if (!token || !sermonIds || !Array.isArray(sermonIds)) {
            return NextResponse.json(
                { error: "Token e lista de IDs de sermões são obrigatórios" },
                { status: 400 }
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

        // Verificar acesso para cada sermão
        const accessResults = await Promise.all(
            sermonIds.map(async (sermonId: string) => {
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


                return {
                    sermonId,
                    hasAccess: access.length > 0,
                };
            })
        );

        return NextResponse.json(accessResults);
    } catch (error) {
        console.error("Erro ao verificar acesso:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
