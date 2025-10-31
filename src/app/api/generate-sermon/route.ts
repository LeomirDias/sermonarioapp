import { NextResponse } from "next/server";
// Importe o SDK oficial da OpenAI
import OpenAI from "openai";

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

  try {
    const { titulo, tema, versiculo, textoVersiculo, objetivo, dataSermao } =
      await req.json();

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
      if (run.usage) {
        console.log(`Tokens gastos nesta requisição:`);
        console.log(`- Prompt (Entrada): ${run.usage.prompt_tokens} tokens`);
        console.log(
          `- Completion (Saída): ${run.usage.completion_tokens} tokens`,
        );
        console.log(`- Total: ${run.usage.total_tokens} tokens`);

        // Se você tiver um banco de dados, aqui é o local
        // ideal para salvar 'run.usage' e associar ao
        // usuário que fez a requisição, para seu controle de custos.
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
          // 11. Retorne o JSON final para o seu frontend
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
