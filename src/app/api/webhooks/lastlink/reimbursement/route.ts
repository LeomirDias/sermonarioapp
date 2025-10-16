
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import ReimbursementEmail from "@/components/emails/reimbursement";
import { db } from "@/db";
import { accessTokensTable } from "@/db/schema";
import { sendWhatsappMessage } from "@/lib/zapi-service";

const resend = new Resend(process.env.RESEND_API_KEY as string);
const LASTLINK_WEBHOOK_SECRET_REIMBURSEMENT = process.env.LASTLINK_WEBHOOK_SECRET_REIMBURSEMENT!;

const alertPhone = "+5564992214800"

export async function POST(req: NextRequest) {
    // pegar token do header
    const headerSecret = req.headers.get("x-lastlink-token");

    if (!headerSecret || headerSecret !== LASTLINK_WEBHOOK_SECRET_REIMBURSEMENT) {
        return NextResponse.json({ error: "Segredo inválido" }, { status: 401 });
    }

    // só processa o body depois que validar o secret
    const body = await req.json();

    const data = body?.Data;
    const buyer = data?.Buyer;

    // Busca o token existente pelo email e altera o status para refunded
    await db
        .update(accessTokensTable)
        .set({
            status: "refunded",
            updatedAt: new Date()
        })
        .where(eq(accessTokensTable.email, buyer.Email));

    // Email de acesso para novos usuários
    await resend.emails.send({
        from: `${process.env.NAME_FOR_EMAIL_SENDER} <${process.env.EMAIL_FOR_EMAIL_SENDER}>`,
        to: buyer.Email,
        subject: "Reembolso Sermonário",
        react: ReimbursementEmail({
            customerName: buyer.Name || "",
        }),
    });

    // Mensagem WhatsApp para usuários existentes
    await sendWhatsappMessage(alertPhone,
        `Olá, Leomir! 👋

Reembolso solicitado no Lastlink. 😓
Cliente: ${buyer.Name}
Email: ${buyer.Email}

O acesso ao Sermonário foi cancelado.
 `
    );

    return NextResponse.json({ received: true });

}