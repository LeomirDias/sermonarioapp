"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { accessTokensTable } from "@/db/schema";

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

export async function searchTokenByToken(token: string) {
    try {
        // Busca o token pelo valor do token
        const tokenRecord = await db.query.accessTokensTable.findFirst({
            where: eq(accessTokensTable.token, token),
        });

        if (!tokenRecord) {
            return {
                success: false,
                message: "Token não encontrado",
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
            email: tokenRecord.email,
        };
    } catch (error) {
        console.error("Erro ao buscar token:", error);
        return {
            success: false,
            message: "Erro interno do servidor. Tente novamente.",
        };
    }
}