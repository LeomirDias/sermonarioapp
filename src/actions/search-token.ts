"use server";

import { db } from "@/db";
import { accessTokensTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function searchTokenByEmail(email: string) {
    try {
        // Busca o token pelo email
        const tokenRecord = await db.query.accessTokensTable.findFirst({
            where: eq(accessTokensTable.email, email),
        });

        if (!tokenRecord) {
            return {
                success: false,
                message: "Nenhum token encontrado para este email",
            };
        }

        if (tokenRecord.status !== "active") {
            return {
                success: false,
                message: "Token inativo. Entre em contato conosco para reativar.",
            };
        }

        return {
            success: true,
            token: tokenRecord.token,
            name: tokenRecord.name,
        };
    } catch (error) {
        console.error("Erro ao buscar token:", error);
        return {
            success: false,
            message: "Erro interno do servidor. Tente novamente.",
        };
    }
}
