"use client";

import { ChevronDown, ChevronUp, Loader2, Plus, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import SidebarMenu from "@/app/(routes)/workspace/_components/sidebar-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UpdatesDialog } from "@/components/updates-dialog";
import { useSermonStorage } from "@/hooks/useSermonStorage";

interface SermonBuilderProps {
  user: string;
  email: string;
}

export default function SermonBuilder({ user, email }: SermonBuilderProps) {
  const { sermonData, updateSermonData, clearSermonData } = useSermonStorage();

  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({
    introduction: false,
    exposition: false,
    mainPoints: false,
    application: false,
    conclusion: false,
    notes: false,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const addMainPoint = () => {
    updateSermonData({
      mainPoints: [...sermonData.mainPoints, ""],
    });
  };

  const updateMainPoint = (index: number, value: string) => {
    updateSermonData({
      mainPoints: sermonData.mainPoints.map((point, i) =>
        i === index ? value : point,
      ),
    });
  };

  const removeMainPoint = (index: number) => {
    updateSermonData({
      mainPoints: sermonData.mainPoints.filter((_, i) => i !== index),
    });
  };

  const generateSermon = async () => {
    // Validar se os campos obrigatórios estão preenchidos
    if (
      !sermonData.title ||
      !sermonData.theme ||
      !sermonData.mainVerse ||
      !sermonData.verseText ||
      !sermonData.objective
    ) {
      setGenerationError(
        "Por favor, preencha todos os campos obrigatórios: Título, Tema, Versículo Principal, Texto do Versículo e Objetivo.",
      );
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/generate-sermon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: sermonData.title,
          tema: sermonData.theme,
          versiculo: sermonData.mainVerse,
          textoVersiculo: sermonData.verseText,
          objetivo: sermonData.objective,
          data: sermonData.date,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar sermão");
      }

      const generatedSermon = await response.json();

      // Mapear a resposta da API para o formato do componente
      const mappedData = {
        title: generatedSermon.titulo || sermonData.title,
        date:
          generatedSermon.data ||
          sermonData.date ||
          new Date().toISOString().split("T")[0],
        theme: generatedSermon.tema || sermonData.theme,
        mainVerse: generatedSermon.versiculoPrincipal || sermonData.mainVerse,
        verseText: generatedSermon.textoVersiculo || sermonData.verseText,
        objective: generatedSermon.objetivo || sermonData.objective,
        introduction: {
          greeting:
            generatedSermon.estrutura?.introducao?.abertura ||
            sermonData.introduction.greeting,
          context:
            generatedSermon.estrutura?.introducao?.contexto ||
            sermonData.introduction.context,
          hook:
            generatedSermon.estrutura?.introducao?.gancho ||
            sermonData.introduction.hook,
        },
        exposition: {
          historicalContext:
            generatedSermon.estrutura?.exposicaoBiblica?.contextoHistorico ||
            sermonData.exposition.historicalContext,
          culturalContext:
            generatedSermon.estrutura?.exposicaoBiblica?.contextoCultural ||
            sermonData.exposition.culturalContext,
          textAnalysis:
            generatedSermon.estrutura?.exposicaoBiblica?.analiseTexto ||
            sermonData.exposition.textAnalysis,
          supportVerses: Array.isArray(
            generatedSermon.estrutura?.exposicaoBiblica?.versiculosApoio,
          )
            ? generatedSermon.estrutura.exposicaoBiblica.versiculosApoio.join(
                "\n",
              )
            : generatedSermon.estrutura?.exposicaoBiblica?.versiculosApoio ||
              sermonData.exposition.supportVerses,
        },
        mainPoints:
          Array.isArray(generatedSermon.estrutura?.pontosPrincipais) &&
          generatedSermon.estrutura.pontosPrincipais.length > 0
            ? generatedSermon.estrutura.pontosPrincipais.filter(
                (point: string) =>
                  point && typeof point === "string" && point.trim() !== "",
              )
            : sermonData.mainPoints,
        application: {
          personal:
            generatedSermon.estrutura?.aplicacaoPratica?.vidaPessoal ||
            sermonData.application.personal,
          family:
            generatedSermon.estrutura?.aplicacaoPratica?.familia ||
            sermonData.application.family,
          church:
            generatedSermon.estrutura?.aplicacaoPratica?.igreja ||
            sermonData.application.church,
          society:
            generatedSermon.estrutura?.aplicacaoPratica?.sociedade ||
            sermonData.application.society,
        },
        conclusion: {
          summary:
            generatedSermon.estrutura?.conclusao?.resumo ||
            sermonData.conclusion.summary,
          callToAction:
            generatedSermon.estrutura?.conclusao?.chamadaAcao ||
            sermonData.conclusion.callToAction,
          finalPrayer:
            generatedSermon.estrutura?.conclusao?.oracaoFinal ||
            sermonData.conclusion.finalPrayer,
        },
        notes: {
          illustrations:
            generatedSermon.estrutura?.anotacoes?.ilustracoes ||
            sermonData.notes.illustrations,
          statistics:
            generatedSermon.estrutura?.anotacoes?.estatisticas ||
            sermonData.notes.statistics,
          quotes:
            generatedSermon.estrutura?.anotacoes?.citacoes ||
            sermonData.notes.quotes,
          general:
            generatedSermon.estrutura?.anotacoes?.observacoes ||
            sermonData.notes.general,
        },
      };

      // Atualizar todos os dados de uma vez
      updateSermonData(mappedData);

      // Expandir todas as seções para mostrar o conteúdo gerado
      setCollapsedSections({
        introduction: false,
        exposition: false,
        mainPoints: false,
        application: false,
        conclusion: false,
        notes: false,
      });
    } catch (error) {
      console.error("Erro ao gerar sermão:", error);
      setGenerationError("Erro ao gerar sermão. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(sermonData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `sermao-${sermonData.title || "sem-titulo"}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="relative min-h-screen bg-gray-50 py-4">
      <UpdatesDialog />
      <SidebarMenu
        sermonData={sermonData}
        onClear={clearSermonData}
        onExport={handleExport}
      />

      <div className="relative mx-auto max-w-5xl px-4 pb-20 lg:ml-100 lg:pb-4">
        <div className="p-4">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Olá, {user.split(" ")[0]}
          </h1>
          <p className="text-sm text-gray-600">
            Seja bem vindo ao seu Sermonário.
          </p>

          <Image
            src="/LogoIcon.png"
            alt="Sermonário"
            className="absolute top-0 right-6 h-32 w-32"
            width={128}
            height={128}
          />
        </div>

        {/* Seção de inputs superiores */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações Básicas do Sermão</CardTitle>
            <p className="mt-1 text-sm text-gray-600">
              Preencha os campos abaixo e clique em &quot;Gerar Sermão&quot;
              para criar automaticamente a estrutura completa
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Título do Sermão *
                </label>
                <Input
                  value={sermonData.title}
                  onChange={(e) => updateSermonData({ title: e.target.value })}
                  placeholder="Digite o título do sermão"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Data da Pregação
                </label>
                <Input
                  type="date"
                  value={sermonData.date}
                  onChange={(e) => updateSermonData({ date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tema do Sermão *
              </label>
              <Input
                value={sermonData.theme}
                onChange={(e) => updateSermonData({ theme: e.target.value })}
                placeholder="Digite o tema do sermão"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Versículo Principal *
                </label>
                <Input
                  value={sermonData.mainVerse}
                  onChange={(e) =>
                    updateSermonData({ mainVerse: e.target.value })
                  }
                  placeholder="Ex: João 3:16"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Texto do Versículo *
                </label>
                <Input
                  value={sermonData.verseText}
                  onChange={(e) =>
                    updateSermonData({ verseText: e.target.value })
                  }
                  placeholder="Digite o texto do versículo"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Objetivo do Sermão *
              </label>
              <Textarea
                value={sermonData.objective}
                onChange={(e) =>
                  updateSermonData({ objective: e.target.value })
                }
                placeholder="Descreva o objetivo principal do sermão"
                rows={3}
              />
            </div>

            {/* Botão de Gerar Sermão */}
            <div className="border-t pt-4">
              <Button
                onClick={generateSermon}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Gerando Sermão...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Gerar Sermão com IA
                  </>
                )}
              </Button>

              {generationError && (
                <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">{generationError}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Aviso sobre preenchimento automático */}
        {!isGenerating &&
          (sermonData.introduction.greeting ||
            sermonData.exposition.historicalContext ||
            sermonData.mainPoints[0]) && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  <strong>Conteúdo gerado automaticamente:</strong> As seções
                  abaixo foram preenchidas pela IA. Você pode editar, adicionar
                  ou remover qualquer conteúdo conforme necessário.
                </p>
              </div>
            </div>
          )}

        {/* Seção de Introdução */}
        <Card className="mb-6">
          <Collapsible
            open={!collapsedSections.introduction}
            onOpenChange={() => toggleSection("introduction")}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="flex items-center justify-between">
                  Introdução
                  {collapsedSections.introduction ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronUp className="h-5 w-5" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Abertura/Cumprimento
                  </label>
                  <Textarea
                    value={sermonData.introduction.greeting}
                    onChange={(e) =>
                      updateSermonData({
                        introduction: {
                          ...sermonData.introduction,
                          greeting: e.target.value,
                        },
                      })
                    }
                    placeholder="Como você vai cumprimentar a congregação?"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Contexto/Situação
                  </label>
                  <Textarea
                    value={sermonData.introduction.context}
                    onChange={(e) =>
                      updateSermonData({
                        introduction: {
                          ...sermonData.introduction,
                          context: e.target.value,
                        },
                      })
                    }
                    placeholder="Descreva o contexto ou situação atual"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Gancho/Chamada de Atenção
                  </label>
                  <Textarea
                    value={sermonData.introduction.hook}
                    onChange={(e) =>
                      updateSermonData({
                        introduction: {
                          ...sermonData.introduction,
                          hook: e.target.value,
                        },
                      })
                    }
                    placeholder="Como você vai captar a atenção da congregação?"
                    rows={3}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Seção de Exposição Bíblica */}
        <Card className="mb-6">
          <Collapsible
            open={!collapsedSections.exposition}
            onOpenChange={() => toggleSection("exposition")}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="flex items-center justify-between">
                  Exposição Bíblica
                  {collapsedSections.exposition ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronUp className="h-5 w-5" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Contexto Histórico
                  </label>
                  <Textarea
                    value={sermonData.exposition.historicalContext}
                    onChange={(e) =>
                      updateSermonData({
                        exposition: {
                          ...sermonData.exposition,
                          historicalContext: e.target.value,
                        },
                      })
                    }
                    placeholder="Descreva o contexto histórico do texto"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Contexto Cultural
                  </label>
                  <Textarea
                    value={sermonData.exposition.culturalContext}
                    onChange={(e) =>
                      updateSermonData({
                        exposition: {
                          ...sermonData.exposition,
                          culturalContext: e.target.value,
                        },
                      })
                    }
                    placeholder="Descreva o contexto cultural da época"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Análise de Texto
                  </label>
                  <Textarea
                    value={sermonData.exposition.textAnalysis}
                    onChange={(e) =>
                      updateSermonData({
                        exposition: {
                          ...sermonData.exposition,
                          textAnalysis: e.target.value,
                        },
                      })
                    }
                    placeholder="Faça uma análise detalhada do texto"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Versículos de Apoio
                  </label>
                  <Textarea
                    value={sermonData.exposition.supportVerses}
                    onChange={(e) =>
                      updateSermonData({
                        exposition: {
                          ...sermonData.exposition,
                          supportVerses: e.target.value,
                        },
                      })
                    }
                    placeholder="Liste versículos que apoiam sua exposição"
                    rows={3}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Seção de Pontos Principais */}
        <Card className="mb-6">
          <Collapsible
            open={!collapsedSections.mainPoints}
            onOpenChange={() => toggleSection("mainPoints")}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="flex items-center justify-between">
                  Pontos Principais
                  {collapsedSections.mainPoints ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronUp className="h-5 w-5" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {sermonData.mainPoints.map((point, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Ponto {index + 1}
                      </label>
                      <Textarea
                        value={point}
                        onChange={(e) => updateMainPoint(index, e.target.value)}
                        placeholder={`Digite o ${index + 1}º ponto principal`}
                        rows={2}
                      />
                    </div>
                    {sermonData.mainPoints.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMainPoint(index)}
                        className="mt-6"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addMainPoint}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Ponto
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Seção de Aplicação Prática */}
        <Card className="mb-6">
          <Collapsible
            open={!collapsedSections.application}
            onOpenChange={() => toggleSection("application")}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="flex items-center justify-between">
                  Aplicação Prática
                  {collapsedSections.application ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronUp className="h-5 w-5" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Aplicação para Vida Pessoal
                  </label>
                  <Textarea
                    value={sermonData.application.personal}
                    onChange={(e) =>
                      updateSermonData({
                        application: {
                          ...sermonData.application,
                          personal: e.target.value,
                        },
                      })
                    }
                    placeholder="Como aplicar este ensino na vida pessoal?"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Aplicação para Família
                  </label>
                  <Textarea
                    value={sermonData.application.family}
                    onChange={(e) =>
                      updateSermonData({
                        application: {
                          ...sermonData.application,
                          family: e.target.value,
                        },
                      })
                    }
                    placeholder="Como aplicar este ensino na família?"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Aplicação para a Igreja
                  </label>
                  <Textarea
                    value={sermonData.application.church}
                    onChange={(e) =>
                      updateSermonData({
                        application: {
                          ...sermonData.application,
                          church: e.target.value,
                        },
                      })
                    }
                    placeholder="Como aplicar este ensino na igreja?"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Aplicação para a Sociedade
                  </label>
                  <Textarea
                    value={sermonData.application.society}
                    onChange={(e) =>
                      updateSermonData({
                        application: {
                          ...sermonData.application,
                          society: e.target.value,
                        },
                      })
                    }
                    placeholder="Como aplicar este ensino na sociedade?"
                    rows={3}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Seção de Conclusão */}
        <Card className="mb-6">
          <Collapsible
            open={!collapsedSections.conclusion}
            onOpenChange={() => toggleSection("conclusion")}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="flex items-center justify-between">
                  Conclusão
                  {collapsedSections.conclusion ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronUp className="h-5 w-5" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Resumo dos Pontos
                  </label>
                  <Textarea
                    value={sermonData.conclusion.summary}
                    onChange={(e) =>
                      updateSermonData({
                        conclusion: {
                          ...sermonData.conclusion,
                          summary: e.target.value,
                        },
                      })
                    }
                    placeholder="Faça um resumo dos pontos principais"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Chamada à Ação
                  </label>
                  <Textarea
                    value={sermonData.conclusion.callToAction}
                    onChange={(e) =>
                      updateSermonData({
                        conclusion: {
                          ...sermonData.conclusion,
                          callToAction: e.target.value,
                        },
                      })
                    }
                    placeholder="Qual ação você quer que a congregação tome?"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Oração Final
                  </label>
                  <Textarea
                    value={sermonData.conclusion.finalPrayer}
                    onChange={(e) =>
                      updateSermonData({
                        conclusion: {
                          ...sermonData.conclusion,
                          finalPrayer: e.target.value,
                        },
                      })
                    }
                    placeholder="Escreva a oração final"
                    rows={3}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Seção de Anotações Adicionais */}
        <Card className="mb-6">
          <Collapsible
            open={!collapsedSections.notes}
            onOpenChange={() => toggleSection("notes")}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="flex items-center justify-between">
                  Anotações Adicionais
                  {collapsedSections.notes ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronUp className="h-5 w-5" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ilustração/História
                  </label>
                  <Textarea
                    value={sermonData.notes.illustrations}
                    onChange={(e) =>
                      updateSermonData({
                        notes: {
                          ...sermonData.notes,
                          illustrations: e.target.value,
                        },
                      })
                    }
                    placeholder="Adicione ilustrações ou histórias relevantes"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Estatísticas/Dados
                  </label>
                  <Textarea
                    value={sermonData.notes.statistics}
                    onChange={(e) =>
                      updateSermonData({
                        notes: {
                          ...sermonData.notes,
                          statistics: e.target.value,
                        },
                      })
                    }
                    placeholder="Adicione estatísticas ou dados relevantes"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Citações
                  </label>
                  <Textarea
                    value={sermonData.notes.quotes}
                    onChange={(e) =>
                      updateSermonData({
                        notes: { ...sermonData.notes, quotes: e.target.value },
                      })
                    }
                    placeholder="Adicione citações relevantes"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Observações Gerais
                  </label>
                  <Textarea
                    value={sermonData.notes.general}
                    onChange={(e) =>
                      updateSermonData({
                        notes: { ...sermonData.notes, general: e.target.value },
                      })
                    }
                    placeholder="Adicione observações gerais"
                    rows={3}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
      <p className="absolute bottom-2 left-2 text-xs text-gray-400 sm:fixed">
        Email de acesso vitalício: {email}
      </p>
      <p className="absolute bottom-0 my-2 hidden w-full text-center text-xs text-gray-400 md:block">
        © 2025 Sermonário. Todos os direitos reservados. Desenvolvido por{" "}
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          Synqia
        </a>
      </p>
    </div>
  );
}
