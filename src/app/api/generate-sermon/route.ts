import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
// Importe o SDK oficial da OpenAI
import OpenAI from "openai";

import { db } from "@/db";
import { accessTokensTable, sermonLogsTable, sermonsTable } from "@/db/schema";
import { getSession } from "@/lib/session";

// Inicialize o cliente (ele lê a API Key do process.env.OPENAI_API_KEY automaticamente)
const openai = new OpenAI();

// Puxe o ID do seu assistente do .env
const assistantId = process.env.OPENAI_ASSISTANT_ID;

export async function POST(req: Request) {
  if (!assistantId) {
    console.error("OPENAI_ASSISTANT_ID não está configurado.");
    return NextResponse.json(
      { error: "Configuração do assistente não encontrada." },
      { status: 500 },
    );
  }

  // Verificar se o usuário está autenticado
  const session = await getSession();
  if (!session?.email) {
    return NextResponse.json(
      { error: "Não autorizado. Faça login para continuar." },
      { status: 401 },
    );
  }

  try {
    const { titulo, tema, versiculo, textoVersiculo, objetivo, dataSermao } =
      await req.json();

    // Buscar o user_id a partir do email da sessão
    const userRecord = await db.query.accessTokensTable.findFirst({
      where: eq(accessTokensTable.email, session.email),
    });

    if (!userRecord || userRecord.status !== "active") {
      return NextResponse.json(
        { error: "Usuário não encontrado ou inativo" },
        { status: 403 },
      );
    }

    // 1. Formate a mensagem do usuário (APENAS os dados dinâmicos)
    // Isso é tudo o que você enviará, economizando milhares de tokens.
    const userMessageContent = `
            Por favor, gere o sermão com os seguintes dados:
            - Título: ${titulo}
            - Tema: ${tema}
            - Versículo: ${versiculo}
            - Texto do Versículo: ${textoVersiculo}
            - Objetivo: ${objetivo}
            - Data: ${dataSermao || ""}

            IMPORTANTE: Use a data fornecida no campo "data" do JSON de resposta. Se a data fornecida for vazia ou nula, deixe o campo "data" como uma string vazia "".
        `;

    // 2. Crie uma nova "Thread" (uma nova conversa)
    const thread = await openai.beta.threads.create();

    // 3. Adicione a mensagem do usuário a essa Thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessageContent,
    });

    // 4. Crie um "Run" (peça ao assistente para processar a thread)
    // Usamos 'createAndPoll' para esperar síncronamente pela resposta.
    // Isso é perfeito para uma rota de API que precisa responder na hora.
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId,
      response_format: { type: "json_object" }, // Garante o JSON
      temperature: 0.7, // Adiciona criatividade controlada
    });

    // 6. Verifique se o "Run" foi concluído com sucesso
    if (run.status === "completed") {
      // Armazenar dados de uso para salvar no log
      let usageData: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      } = {};

      if (run.usage) {
        usageData = {
          prompt_tokens: run.usage.prompt_tokens,
          completion_tokens: run.usage.completion_tokens,
          total_tokens: run.usage.total_tokens,
        };
      }

      // 7. Se sim, liste as mensagens da thread
      const messages = await openai.beta.threads.messages.list(run.thread_id);

      // 8. Encontre a última mensagem (que é a resposta do assistente)
      const lastMessage = messages.data
        .filter(
          (msg) => msg.role === "assistant" && msg.content[0].type === "text",
        )
        .pop();

      if (lastMessage && lastMessage.content[0].type === "text") {
        // 9. Extraia o conteúdo de texto (que será nossa string JSON)
        const jsonResponse = lastMessage.content[0].text.value;

        // 10. Tente fazer o parse (deve funcionar graças ao response_format)
        try {
          const parsedJson = JSON.parse(jsonResponse);

          // 11. Tentar salvar no banco de dados (com tratamento de erro separado)
          // Mesmo se falhar, o usuário ainda receberá a resposta da API
          try {
            // Salvar o sermão no banco de dados
            const [savedSermon] = await db
              .insert(sermonsTable)
              .values({
                user_id: userRecord.id,
                title: titulo,
                theme: tema,
                main_verse: versiculo,
                verse_text: textoVersiculo,
                objective: objetivo,
                date: dataSermao || null,
                sermon_json: jsonResponse, // Armazena a resposta completa como JSON string
              })
              .returning();

            // Se o sermão foi salvo com sucesso, tentar salvar o log
            if (savedSermon) {
              try {
                await db.insert(sermonLogsTable).values({
                  user_id: userRecord.id,
                  sermon_id: savedSermon.id,
                  title: titulo,
                  action: "created",
                  prompt_tokens: usageData.prompt_tokens ?? null,
                  completion_tokens: usageData.completion_tokens ?? null,
                  total_tokens: usageData.total_tokens ?? null,
                });
              } catch (logError) {
                console.error("Erro ao salvar log do sermão:", logError);
                // Não bloqueia a resposta, apenas registra o erro
              }
            }
          } catch (dbError) {
            console.error("Erro ao salvar sermão no banco de dados:", dbError);
            // Não bloqueia a resposta, apenas registra o erro
            // O usuário ainda receberá o JSON da API
          }

          // 12. Retorne o JSON final para o seu frontend
          // Isso sempre acontece, mesmo se houver erro no banco
          return NextResponse.json(parsedJson);
        } catch (e) {
          console.error("Erro ao fazer parse do JSON do assistente:", e);
          console.error("String recebida:", jsonResponse);
          return NextResponse.json(
            { error: "Erro ao processar JSON da IA" },
            { status: 500 },
          );
        }
      } else {
        return NextResponse.json(
          { error: "Nenhuma resposta de texto do assistente encontrada" },
          { status: 500 },
        );
      }
    } else {
      // O Run falhou (ex: erro no modelo, conteúdo bloqueado, etc.)
      console.error("Run não completou:", run.status, run.last_error);
      return NextResponse.json(
        {
          error: "Falha ao gerar resposta da IA",
          details: run.last_error?.message,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Erro geral na rota do assistente:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro interno do servidor", details: errorMessage },
      { status: 500 },
    );
  }
}

// Não se esqueça da rota GET se precisar dela
export async function GET() {
  return NextResponse.json({
    message: "API de Sermões (Assistente) funcionando",
  });
}
