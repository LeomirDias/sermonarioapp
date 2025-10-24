import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import NewsletterEmail from "@/components/emails/newsletter";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, customerName, subject, message } = body;

        // Validação básica
        if (!email || !subject || !message) {
            return NextResponse.json(
                { error: "Email, assunto e mensagem são obrigatórios" },
                { status: 400 }
            );
        }

        // Enviar email de teste
        await resend.emails.send({
            from: `${process.env.NAME_FOR_EMAIL_SENDER} <${process.env.EMAIL_FOR_EMAIL_SENDER}>`,
            to: email,
            subject: subject,
            react: NewsletterEmail({
                customerName: customerName || "Cliente Teste",
                subject: subject,
                message: message,
            }),
        });

        return NextResponse.json({
            success: true,
            message: `Email de teste enviado com sucesso para: ${email}`,
            recipient: email,
            subject: subject
        });

    } catch (error) {
        console.error("Erro ao enviar email de teste:", error);
        return NextResponse.json(
            { error: "Erro ao enviar email de teste" },
            { status: 500 }
        );
    }
}

// Método GET para mostrar exemplos de uso
export async function GET() {
    return NextResponse.json({
        message: "API para envio de email de teste",
        usage: {
            method: "POST",
            endpoint: "/api/test-email",
            requiredFields: ["email", "subject", "message"],
            optionalFields: ["customerName"],
            example: {
                email: "teste@exemplo.com",
                customerName: "João Silva",
                subject: "Teste de Email",
                message: "Este é um email de teste para verificar o formato."
            }
        }
    });
}
