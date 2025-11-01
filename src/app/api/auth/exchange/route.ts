import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { accessTokensTable } from "@/db/schema";
import { setSession } from "@/lib/session";

const Input = z.object({
  email: z.string().email().max(200),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const { email } = Input.parse(json);

    // Valida no DB (mesma lógica da server action, mas aqui no handler)
    const tokenRecord = await db.query.accessTokensTable.findFirst({
      where: eq(accessTokensTable.email, email),
    });

    if (!tokenRecord || tokenRecord.status !== "active") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Cria sessão
    const sid = randomBytes(16).toString("hex");
    await setSession({
      sid,
      email: tokenRecord.email,
      name: tokenRecord.name ?? undefined,
    });

    // Redireciona para área autenticada
    const res = NextResponse.redirect(new URL("/workspace", req.url), {
      status: 303,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }
}
