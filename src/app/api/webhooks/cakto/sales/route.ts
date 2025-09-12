import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

import NewSubscriptionEmail from "@/components/emails/new-sale";
import { db } from "@/db";
import { accessTokensTable } from "@/db/schema";

const CAKTO_WEBHOOK_SECRET = process.env.CAKTO_WEBHOOK_SECRET_SALES!;
const resend = new Resend(process.env.RESEND_API_KEY as string);

// Função para gerar token único
function generateAccessToken(): string {
    return `serm_${uuidv4()}_${Date.now()}`;
}

export async function POST(req: NextRequest) {
    const body = await req.json();

    const secret = body?.secret;
    if (!secret || secret !== CAKTO_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Segredo inválido" }, { status: 401 });
    }

    const data = body?.data;
    const customer = data?.customer;

    // Gera token de acesso vitalício
    const accessToken = generateAccessToken();

    // Dados do token de acesso
    const tokenData = {
        id: customer.id || `customer_${uuidv4()}_${Date.now()}`,
        name: customer.name || "",
        email: customer.email,
        token: accessToken,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    // Cria novo token de acesso
    await db.insert(accessTokensTable).values(tokenData);

    // Mensagem para novos usuários
    await resend.emails.send({
        from: `${process.env.NAME_FOR_EMAIL_SENDER} <${process.env.EMAIL_FOR_EMAIL_SENDER}>`,
        to: customer.email,
        subject: "Acesse seu Sermonário!",
        react: NewSubscriptionEmail({
            customerName: customer.name || "",
            accessToken: accessToken,
        }),
    });


    return NextResponse.json({ received: true });
}
