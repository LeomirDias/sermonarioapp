import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import NewsletterEmail from "@/components/emails/newsletter";
import { db } from "@/db";
import { accessTokensTable } from "@/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { subject, message } = body;

        // Validação básica
        if (!subject || !message) {
            return NextResponse.json(
                { error: "Assunto e mensagem são obrigatórios" },
                { status: 400 }
            );
        }

        // Buscar todos os usuários com status "active"
        const activeUsers = await db
            .select({
                email: accessTokensTable.email,
                name: accessTokensTable.name,
            })
            .from(accessTokensTable)
            .where(eq(accessTokensTable.status, "active"));

        console.log(`Enviando newsletter para ${activeUsers.length} usuários ativos`);

        // Array para armazenar os resultados do envio
        const results = {
            total: activeUsers.length,
            sent: 0,
            failed: 0,
            errors: [] as string[]
        };

        // Enviar email para cada usuário
        for (const user of activeUsers) {
            try {
                await resend.emails.send({
                    from: `${process.env.NAME_FOR_EMAIL_SENDER} <${process.env.EMAIL_FOR_EMAIL_SENDER}>`,
                    to: user.email,
                    subject: subject,
                    react: NewsletterEmail({
                        customerName: user.name || "Cliente",
                        subject: subject,
                        message: message,
                    }),
                });

                results.sent++;
                console.log(`Email enviado para: ${user.email}`);
            } catch (error) {
                results.failed++;
                const errorMessage = `Erro ao enviar para ${user.email}: ${error}`;
                results.errors.push(errorMessage);
                console.error(errorMessage);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Newsletter enviada! ${results.sent} emails enviados com sucesso, ${results.failed} falharam.`,
            results: results
        });

    } catch (error) {
        console.error("Erro ao processar newsletter:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

// Método GET para verificar quantos usuários ativos existem
export async function GET() {
    try {
        const activeUsers = await db
            .select({
                email: accessTokensTable.email,
                name: accessTokensTable.name,
                createdAt: accessTokensTable.createdAt,
            })
            .from(accessTokensTable)
            .where(eq(accessTokensTable.status, "active"));

        return NextResponse.json({
            totalActiveUsers: activeUsers.length,
            users: activeUsers
        });
    } catch (error) {
        console.error("Erro ao buscar usuários ativos:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
