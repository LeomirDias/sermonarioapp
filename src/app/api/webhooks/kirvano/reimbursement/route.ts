import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import ReimbursementEmail from "@/components/emails/reimbursement";
import { db } from "@/db";
import { accessTokensTable } from "@/db/schema";
import { sendWhatsappMessage } from "@/lib/zapi-service";

const resend = new Resend(process.env.RESEND_API_KEY as string);

const alertPhone = "+5564992214800"

export async function POST(req: NextRequest) {
    const body = await req.json();

    //Define os dados do body (os dados estão diretamente no body, não em body.data)
    const data = body;
    //Define os dados do cliente
    const customer = data?.customer;
    //Define os dados do oferta
    const value = data?.total_price;

    // Busca o token existente pelo email e altera o status para refunded
    await db
        .update(accessTokensTable)
        .set({
            status: "refunded",
            updatedAt: new Date()
        })
        .where(eq(accessTokensTable.email, customer?.email || ""));

    // Email de reembolso para usuários
    await resend.emails.send({
        from: `${process.env.NAME_FOR_EMAIL_SENDER} <${process.env.EMAIL_FOR_EMAIL_SENDER}>`,
        to: customer?.email || "",
        subject: "Reembolso Sermonário",
        react: ReimbursementEmail({
            customerName: customer?.name || "",
        }),
    });

    // Mensagem WhatsApp para usuários existentes
    await sendWhatsappMessage(alertPhone,
        `Olá, Leomir! 👋

Reembolso solicitado no Kirvano. 😓
Cliente: ${customer?.name || "N/A"}
Email: ${customer?.email || "N/A"}
Valor: ${value || "N/A"}

O acesso de ${customer?.name || "o cliente"} ao Sermonário foi cancelado.
 `
    );

    return NextResponse.json({ received: true });
}
