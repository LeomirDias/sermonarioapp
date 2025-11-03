import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { accessTokensTable } from "@/db/schema";
import { setSession } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/?token_invalido=1", req.url), {
        status: 303,
      });
    }

    // Busca token ativo
    const tokenRecord = await db.query.accessTokensTable.findFirst({
      where: eq(accessTokensTable.token, token),
    });

    if (!tokenRecord || tokenRecord.status !== "active") {
      return NextResponse.redirect(new URL("/?token_invalido=1", req.url), {
        status: 303,
      });
    }

    // Cria sessão (Route Handler pode modificar cookies)
    const sid = randomBytes(16).toString("hex");
    await setSession({
      sid,
      email: tokenRecord.email,
      name: tokenRecord.name ?? undefined,
    });

    // Redireciona para área autenticada
    return NextResponse.redirect(new URL("/workspace", req.url), {
      status: 303,
    });
  } catch {
    return NextResponse.redirect(new URL("/?token_invalido=1", req.url), {
      status: 303,
    });
  }
}

// Mantém o POST para compatibilidade com outras chamadas
const PostInput = z.object({
  email: z.string().email().max(200),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const { email } = PostInput.parse(json);

    // Busca token ativo pelo email
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
