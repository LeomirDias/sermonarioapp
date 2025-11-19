"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Sermon {
  id: string;
  user_id: string;
  title: string;
  theme: string;
  main_verse: string;
  verse_text: string;
  objective: string;
  date: string | null;
  sermon_json: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface SermonDetailDialogProps {
  sermon: Sermon;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SermonJsonStructure {
  titulo?: string;
  tema?: string;
  versiculoPrincipal?: string;
  textoVersiculo?: string;
  objetivo?: string;
  data?: string;
  estrutura?: {
    introducao?: {
      abertura?: string;
      contexto?: string;
      gancho?: string;
    };
    exposicaoBiblica?: {
      contextoHistorico?: string;
      contextoCultural?: string;
      analiseTexto?: string;
      versiculosApoio?: string[] | string;
    };
    pontosPrincipais?: string[];
    aplicacaoPratica?: {
      vidaPessoal?: string;
      familia?: string;
      igreja?: string;
      sociedade?: string;
    };
    conclusao?: {
      resumo?: string;
      chamadaAcao?: string;
      oracaoFinal?: string;
    };
    anotacoes?: {
      ilustracoes?: string;
      estatisticas?: string;
      citacoes?: string;
      observacoes?: string;
    };
  };
}

export default function SermonDetailDialog({
  sermon,
  open,
  onOpenChange,
}: SermonDetailDialogProps) {
  let sermonJson: SermonJsonStructure | null = null;
  try {
    sermonJson = JSON.parse(sermon.sermon_json) as SermonJsonStructure;
  } catch (error) {
    console.error("Erro ao fazer parse do sermon_json:", error);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{sermon.title}</DialogTitle>
          <DialogDescription>{sermon.main_verse}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6 break-words">
            {/* Informações Básicas */}
            <div className="space-y-2">
              <h3 className="text-primary text-lg font-semibold">
                Informações Básicas
              </h3>
              <div className="space-y-1 text-sm">
                <p className="break-words">
                  <span className="font-medium">Tema:</span> {sermon.theme}
                </p>
                <p className="break-words">
                  <span className="font-medium">Versículo Principal:</span>{" "}
                  {sermon.main_verse}
                </p>
                <p>
                  <span className="font-medium">Texto do Versículo:</span>
                </p>
                <p className="text-muted-foreground pl-4 break-words italic">
                  {sermon.verse_text}
                </p>
                <p className="break-words">
                  <span className="font-medium">Objetivo:</span>{" "}
                  {sermon.objective}
                </p>
                {sermon.date && (
                  <p className="break-words">
                    <span className="font-medium">Data:</span> {sermon.date}
                  </p>
                )}
              </div>
            </div>

            {/* Estrutura do Sermão */}
            {sermonJson?.estrutura && (
              <>
                {/* Introdução */}
                {sermonJson.estrutura.introducao && (
                  <div className="space-y-2">
                    <h3 className="text-primary text-lg font-semibold">
                      Introdução
                    </h3>
                    <div className="space-y-2 text-sm">
                      {sermonJson.estrutura.introducao.abertura && (
                        <div>
                          <p className="font-medium">Abertura/Cumprimento:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {sermonJson.estrutura.introducao.abertura}
                          </p>
                        </div>
                      )}
                      {sermonJson.estrutura.introducao.contexto && (
                        <div>
                          <p className="font-medium">Contexto/Situação:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {sermonJson.estrutura.introducao.contexto}
                          </p>
                        </div>
                      )}
                      {sermonJson.estrutura.introducao.gancho && (
                        <div>
                          <p className="font-medium">
                            Gancho/Chamada de Atenção:
                          </p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {sermonJson.estrutura.introducao.gancho}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Exposição Bíblica */}
                {sermonJson.estrutura.exposicaoBiblica && (
                  <div className="space-y-2">
                    <h3 className="text-primary text-lg font-semibold">
                      Exposição Bíblica
                    </h3>
                    <div className="space-y-2 text-sm">
                      {sermonJson.estrutura.exposicaoBiblica
                        .contextoHistorico && (
                        <div>
                          <p className="font-medium">Contexto Histórico:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {
                              sermonJson.estrutura.exposicaoBiblica
                                .contextoHistorico
                            }
                          </p>
                        </div>
                      )}
                      {sermonJson.estrutura.exposicaoBiblica
                        .contextoCultural && (
                        <div>
                          <p className="font-medium">Contexto Cultural:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {
                              sermonJson.estrutura.exposicaoBiblica
                                .contextoCultural
                            }
                          </p>
                        </div>
                      )}
                      {sermonJson.estrutura.exposicaoBiblica.analiseTexto && (
                        <div>
                          <p className="font-medium">Análise do Texto:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {sermonJson.estrutura.exposicaoBiblica.analiseTexto}
                          </p>
                        </div>
                      )}
                      {sermonJson.estrutura.exposicaoBiblica
                        .versiculosApoio && (
                        <div>
                          <p className="font-medium">Versículos de Apoio:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {Array.isArray(
                              sermonJson.estrutura.exposicaoBiblica
                                .versiculosApoio,
                            )
                              ? sermonJson.estrutura.exposicaoBiblica.versiculosApoio.join(
                                  ", ",
                                )
                              : sermonJson.estrutura.exposicaoBiblica
                                  .versiculosApoio}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pontos Principais */}
                {sermonJson.estrutura.pontosPrincipais &&
                  Array.isArray(sermonJson.estrutura.pontosPrincipais) &&
                  sermonJson.estrutura.pontosPrincipais.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-primary text-lg font-semibold">
                        Pontos Principais
                      </h3>
                      <div className="space-y-2 text-sm">
                        {sermonJson.estrutura.pontosPrincipais.map(
                          (point: string, index: number) => (
                            <div key={index}>
                              <p className="font-medium">Ponto {index + 1}:</p>
                              <p className="text-muted-foreground pl-4 break-words">
                                {point}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {/* Aplicação Prática */}
                {sermonJson.estrutura.aplicacaoPratica && (
                  <div className="space-y-2">
                    <h3 className="text-primary text-lg font-semibold">
                      Aplicação Prática
                    </h3>
                    <div className="space-y-2 text-sm">
                      {sermonJson.estrutura.aplicacaoPratica.vidaPessoal && (
                        <div>
                          <p className="font-medium">Vida Pessoal:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {sermonJson.estrutura.aplicacaoPratica.vidaPessoal}
                          </p>
                        </div>
                      )}
                      {sermonJson.estrutura.aplicacaoPratica.familia && (
                        <div>
                          <p className="font-medium">Família:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {sermonJson.estrutura.aplicacaoPratica.familia}
                          </p>
                        </div>
                      )}
                      {sermonJson.estrutura.aplicacaoPratica.igreja && (
                        <div>
                          <p className="font-medium">Igreja:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {sermonJson.estrutura.aplicacaoPratica.igreja}
                          </p>
                        </div>
                      )}
                      {sermonJson.estrutura.aplicacaoPratica.sociedade && (
                        <div>
                          <p className="font-medium">Sociedade:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {sermonJson.estrutura.aplicacaoPratica.sociedade}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Conclusão */}
                {sermonJson.estrutura.conclusao && (
                  <div className="space-y-2">
                    <h3 className="text-primary text-lg font-semibold">
                      Conclusão
                    </h3>
                    <div className="space-y-2 text-sm">
                      {sermonJson.estrutura.conclusao.resumo && (
                        <div>
                          <p className="font-medium">Resumo dos Pontos:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {sermonJson.estrutura.conclusao.resumo}
                          </p>
                        </div>
                      )}
                      {sermonJson.estrutura.conclusao.chamadaAcao && (
                        <div>
                          <p className="font-medium">Chamada à Ação:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {sermonJson.estrutura.conclusao.chamadaAcao}
                          </p>
                        </div>
                      )}
                      {sermonJson.estrutura.conclusao.oracaoFinal && (
                        <div>
                          <p className="font-medium">Oração Final:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {sermonJson.estrutura.conclusao.oracaoFinal}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Anotações */}
                {sermonJson.estrutura.anotacoes && (
                  <div className="space-y-2">
                    <h3 className="text-primary text-lg font-semibold">
                      Anotações Adicionais
                    </h3>
                    <div className="space-y-2 text-sm">
                      {sermonJson.estrutura.anotacoes.ilustracoes && (
                        <div>
                          <p className="font-medium">Ilustrações:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {sermonJson.estrutura.anotacoes.ilustracoes}
                          </p>
                        </div>
                      )}
                      {sermonJson.estrutura.anotacoes.estatisticas && (
                        <div>
                          <p className="font-medium">Estatísticas:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {sermonJson.estrutura.anotacoes.estatisticas}
                          </p>
                        </div>
                      )}
                      {sermonJson.estrutura.anotacoes.citacoes && (
                        <div>
                          <p className="font-medium">Citações:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {sermonJson.estrutura.anotacoes.citacoes}
                          </p>
                        </div>
                      )}
                      {sermonJson.estrutura.anotacoes.observacoes && (
                        <div>
                          <p className="font-medium">Observações Gerais:</p>
                          <p className="text-muted-foreground pl-4 break-words">
                            {sermonJson.estrutura.anotacoes.observacoes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
