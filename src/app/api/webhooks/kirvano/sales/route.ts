import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

import NewSubscriptionEmail from "@/components/emails/new-sale";
import { db } from "@/db";
import { accessTokensTable } from "@/db/schema";
import { sendWhatsappMessage } from "@/lib/zapi-service";

const resend = new Resend(process.env.RESEND_API_KEY as string);

// Função para gerar token único
function generateAccessToken(): string {
  return `serm_${uuidv4()}_${Date.now()}`;
}

const alertPhone = "+5564992214800";

export async function POST(req: NextRequest) {
  const body = await req.json();

  //Define os dados do body (os dados estão diretamente no body, não em body.data)
  const data = body;
  //Define os dados do cliente
  const customer = data?.customer;
  //Define os dados do oferta
  const value = data?.total_price;

  // Gera token de acesso vitalício
  const accessToken = generateAccessToken();

  // Dados do token de acesso
  const tokenData = {
    id: `${uuidv4()}`,
    name: customer?.name || "",
    email: customer?.email || "",
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
    to: customer?.email || "",
    subject: "Acesse seu Sermonário!",
    react: NewSubscriptionEmail({
      customerName: customer?.name || "",
      email: customer?.email || "",
    }),
  });

  // Mensagem WhatsApp para usuários existentes
  await sendWhatsappMessage(
    alertPhone,
    `Olá, Leomir! 👋

Mais uma venda realizada no Kirvano. 🤑🎉
Cliente: ${customer?.name || "N/A"}
Email: ${customer?.email || "N/A"}
Valor: ${value || "N/A"}

O acesso de ${customer?.name || "o cliente"} ao Sermonário foi ativado.
 `,
  );

  return NextResponse.json({ received: true });
}
