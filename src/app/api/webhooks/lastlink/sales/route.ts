import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

import NewSubscriptionEmail from "@/components/emails/new-sale";
import { db } from "@/db";
import { accessTokensTable } from "@/db/schema";
import { sendWhatsappMessage } from "@/lib/zapi-service";

const resend = new Resend(process.env.RESEND_API_KEY as string);
const LASTLINK_WEBHOOK_SECRET_SALES =
  process.env.LASTLINK_WEBHOOK_SECRET_SALES!;

const alertPhone = "+5564992214800";

export async function POST(req: NextRequest) {
  // pegar token do header
  const headerSecret = req.headers.get("x-lastlink-token");

  if (!headerSecret || headerSecret !== LASTLINK_WEBHOOK_SECRET_SALES) {
    return NextResponse.json({ error: "Segredo inválido" }, { status: 401 });
  }

  // só processa o body depois que validar o secret
  const body = await req.json();

  function generateAccessToken(): string {
    return `serm_${uuidv4()}_${Date.now()}`;
  }
  const data = body?.Data;
  const buyer = data?.Buyer;
  const purchase = data?.Purchase;
  const accessToken = generateAccessToken();

  const subscriptionData = {
    id: buyer.Id,
    //Cliente
    name: buyer.Name,
    email: buyer.Email,
    token: accessToken,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Cria novo token de acesso
  await db.insert(accessTokensTable).values(subscriptionData);

  // Email de acesso para novos usuários
  await resend.emails.send({
    from: `${process.env.NAME_FOR_EMAIL_SENDER} <${process.env.EMAIL_FOR_EMAIL_SENDER}>`,
    to: buyer.Email,
    subject: "Acesse seu Sermonário!",
    react: NewSubscriptionEmail({
      customerName: buyer.Name || "",
      email: buyer.Email || "",
    }),
  });

  // Mensagem WhatsApp para usuários existentes
  await sendWhatsappMessage(
    alertPhone,
    `Olá, Leomir! 👋

Mais uma venda realizada no Lastlink. 🤑🎉
Cliente: ${buyer.Name}
Email: ${buyer.Email}
Valor: R$ ${Number(purchase?.OriginalPrice.Value).toFixed(2)}
 `,
  );

  return NextResponse.json({ received: true });
}
