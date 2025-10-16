import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { accessTokensTable } from "@/db/schema";
import { sendWhatsappMessage } from "@/lib/zapi-service";
import ReimbursementEmail from "@/components/emails/reimbursement";

const CAKTO_WEBHOOK_SECRET_REIMBURSEMENT = process.env.CAKTO_WEBHOOK_SECRET_REIMBURSEMENT!;
const resend = new Resend(process.env.RESEND_API_KEY as string);

const alertPhone = "+5564992214800"

export async function POST(req: NextRequest) {
    const body = await req.json();

    const secret = body?.secret;
    if (!secret || secret !== CAKTO_WEBHOOK_SECRET_REIMBURSEMENT) {
        return NextResponse.json({ error: "Segredo inválido" }, { status: 401 });
    }

    const data = body?.data;
    const customer = data?.customer;

    // Busca o token existente pelo email e altera o status para refunded
    await db
        .update(accessTokensTable)
        .set({
            status: "refunded",
            updatedAt: new Date()
        })
        .where(eq(accessTokensTable.email, customer.email));

    // Email de reembolso para usuários
    await resend.emails.send({
        from: `${process.env.NAME_FOR_EMAIL_SENDER} <${process.env.EMAIL_FOR_EMAIL_SENDER}>`,
        to: customer.email,
        subject: "Reembolso Sermonário",
        react: ReimbursementEmail({
            customerName: customer.name || "",
        }),
    });

    // Mensagem WhatsApp para usuários existentes
    await sendWhatsappMessage(alertPhone,
        `Olá, Leomir! 👋

Reembolso solicitado no Cakto. 😓
Cliente: ${customer.name}
Email: ${customer.email}

O acesso ao Sermonário foi cancelado.
 `
    );

    return NextResponse.json({ received: true });
}
