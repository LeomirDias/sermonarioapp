import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ message: "API funcionando" });
}

export async function POST(req: Request) {
    try {
        const { titulo, tema, versiculo, textoVersiculo, objetivo } = await req.json();

        const prompt = `
Você é um assistente especialista em preparar sermões evangélicos completos, claros e aplicáveis para igrejas.

Instruções:
- Escreva como um sermão pronto para ser pregado em uma igreja evangélica, com linguagem simples, bíblica e inspiradora.
- Desenvolva cada seção de forma objetiva, mas detalhada, trazendo exemplos práticos e aplicações claras.
- Use uma introdução envolvente, que chame a atenção e desperte curiosidade.
- Na exposição bíblica, explique o contexto histórico e cultural, faça análise do texto e use versículos de apoio.
- Nos pontos principais, crie tópicos bem estruturados, baseados no tema e conectados ao versículo.
- Nas aplicações práticas, traga exemplos relevantes para a vida pessoal, família, igreja e sociedade.
- Na conclusão, faça um resumo do sermão, incentive uma ação prática e encerre com uma oração final bíblica e contextualizada.
- Em anotações, adicione ilustrações, citações de autores cristãos, dados ou observações que possam enriquecer a mensagem.
- Responda somente em JSON válido, sem explicações adicionais.

Formato esperado:
{
  "titulo": "",
  "data": "",
  "tema": "",
  "versiculoPrincipal": "",
  "textoVersiculo": "",
  "objetivo": "",
  "estrutura": {
    "introducao": {
      "abertura": "",
      "contexto": "",
      "gancho": ""
    },
    "exposicaoBiblica": {
      "contextoHistorico": "",
      "contextoCultural": "",
      "analiseTexto": "",
      "versiculosApoio": []
    },
    "pontosPrincipais": [],
    "aplicacaoPratica": {
      "vidaPessoal": "",
      "familia": "",
      "igreja": "",
      "sociedade": ""
    },
    "conclusao": {
      "resumo": "",
      "chamadaAcao": "",
      "oracaoFinal": ""
    },
    "anotacoes": {
      "ilustracoes": "",
      "estatisticas": "",
      "citacoes": "",
      "observacoes": ""
    }
  }
}

Dados do sermão:
- Título: ${titulo}
- Tema: ${tema}
- Versículo: ${versiculo} - ${textoVersiculo}
- Objetivo: ${objetivo}

Responda somente em JSON válido.
`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro da API OpenAI:', errorData);
            return NextResponse.json({ error: "Erro na API OpenAI", details: errorData }, { status: response.status });
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Resposta inválida da API OpenAI:', data);
            return NextResponse.json({ error: "Resposta inválida da API" }, { status: 500 });
        }

        const result = data.choices[0].message.content;

        // Limpar o resultado removendo blocos de código markdown se existirem
        let cleanResult = result.trim();

        // Se o resultado começa com ```json, extrair apenas o JSON
        if (cleanResult.startsWith('```json')) {
            const jsonStart = cleanResult.indexOf('{');
            const jsonEnd = cleanResult.lastIndexOf('}') + 1;
            if (jsonStart !== -1 && jsonEnd > jsonStart) {
                cleanResult = cleanResult.substring(jsonStart, jsonEnd);
            }
        }
        // Se o resultado começa com ```, extrair o conteúdo entre os blocos
        else if (cleanResult.startsWith('```')) {
            const lines = cleanResult.split('\n');
            const jsonLines = [];
            let inJsonBlock = false;

            for (const line of lines) {
                if (line.trim().startsWith('```') && !inJsonBlock) {
                    inJsonBlock = true;
                    continue;
                }
                if (line.trim().startsWith('```') && inJsonBlock) {
                    break;
                }
                if (inJsonBlock) {
                    jsonLines.push(line);
                }
            }
            cleanResult = jsonLines.join('\n');
        }

        try {
            const parsedResult = JSON.parse(cleanResult);
            return NextResponse.json(parsedResult);
        } catch (parseError) {
            console.error('Erro ao fazer parse do JSON:', parseError);
            console.error('Conteúdo recebido:', result);
            console.error('Conteúdo limpo:', cleanResult);
            return NextResponse.json({ error: "Erro ao processar resposta da IA" }, { status: 500 });
        }
    } catch (error) {
        console.error('Erro geral:', error);
        return NextResponse.json({ error: "Erro interno do servidor", details: error instanceof Error ? error.message : 'Erro desconhecido' }, { status: 500 });
    }
}
