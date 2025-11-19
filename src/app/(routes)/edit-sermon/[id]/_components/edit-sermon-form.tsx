"use client";

import { ArrowLeft, Loader2, Plus, Save, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { updateSermon } from "@/actions/sermons/update-sermon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

interface SermonJsonStructure {
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

interface EditSermonFormProps {
  sermon: Sermon;
}

export default function EditSermonForm({ sermon }: EditSermonFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Parse do sermon_json
  let initialSermonJson: SermonJsonStructure = {};
  try {
    initialSermonJson = JSON.parse(sermon.sermon_json) as SermonJsonStructure;
  } catch (error) {
    console.error("Erro ao fazer parse do sermon_json:", error);
  }

  // Estado inicial do formulário
  const [formData, setFormData] = useState({
    // Campos básicos
    title: sermon.title || "",
    theme: sermon.theme || "",
    main_verse: sermon.main_verse || "",
    verse_text: sermon.verse_text || "",
    objective: sermon.objective || "",
    date: sermon.date || "",
    // Introdução
    introduction: {
      greeting: initialSermonJson.estrutura?.introducao?.abertura || "",
      context: initialSermonJson.estrutura?.introducao?.contexto || "",
      hook: initialSermonJson.estrutura?.introducao?.gancho || "",
    },
    // Exposição Bíblica
    exposition: {
      historicalContext:
        initialSermonJson.estrutura?.exposicaoBiblica?.contextoHistorico || "",
      culturalContext:
        initialSermonJson.estrutura?.exposicaoBiblica?.contextoCultural || "",
      textAnalysis:
        initialSermonJson.estrutura?.exposicaoBiblica?.analiseTexto || "",
      supportVerses: Array.isArray(
        initialSermonJson.estrutura?.exposicaoBiblica?.versiculosApoio,
      )
        ? initialSermonJson.estrutura.exposicaoBiblica.versiculosApoio.join(
            "\n",
          )
        : initialSermonJson.estrutura?.exposicaoBiblica?.versiculosApoio || "",
    },
    // Pontos Principais
    mainPoints:
      Array.isArray(initialSermonJson.estrutura?.pontosPrincipais) &&
      initialSermonJson.estrutura.pontosPrincipais.length > 0
        ? initialSermonJson.estrutura.pontosPrincipais
        : [""],
    // Aplicação Prática
    application: {
      personal:
        initialSermonJson.estrutura?.aplicacaoPratica?.vidaPessoal || "",
      family: initialSermonJson.estrutura?.aplicacaoPratica?.familia || "",
      church: initialSermonJson.estrutura?.aplicacaoPratica?.igreja || "",
      society: initialSermonJson.estrutura?.aplicacaoPratica?.sociedade || "",
    },
    // Conclusão
    conclusion: {
      summary: initialSermonJson.estrutura?.conclusao?.resumo || "",
      callToAction: initialSermonJson.estrutura?.conclusao?.chamadaAcao || "",
      finalPrayer: initialSermonJson.estrutura?.conclusao?.oracaoFinal || "",
    },
    // Anotações
    notes: {
      illustrations: initialSermonJson.estrutura?.anotacoes?.ilustracoes || "",
      statistics: initialSermonJson.estrutura?.anotacoes?.estatisticas || "",
      quotes: initialSermonJson.estrutura?.anotacoes?.citacoes || "",
      general: initialSermonJson.estrutura?.anotacoes?.observacoes || "",
    },
  });

  // Estado original para cancelar
  const [originalData, setOriginalData] = useState(formData);

  // Detectar mudanças
  useEffect(() => {
    const hasChanged =
      JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(hasChanged);
  }, [formData, originalData]);

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => {
      const keys = field.split(".");
      if (keys.length === 1) {
        return { ...prev, [keys[0]]: value };
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...(prev[keys[0] as keyof typeof prev] as Record<string, unknown>),
            [keys[1]]: value,
          },
        };
      }
      return prev;
    });
  };

  const addMainPoint = () => {
    setFormData((prev) => ({
      ...prev,
      mainPoints: [...prev.mainPoints, ""],
    }));
  };

  const updateMainPoint = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      mainPoints: prev.mainPoints.map((point, i) =>
        i === index ? value : point,
      ),
    }));
  };

  const removeMainPoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mainPoints: prev.mainPoints.filter((_, i) => i !== index),
    }));
  };

  const handleCancel = () => {
    setFormData(originalData);
    setHasChanges(false);
    toast.info("Alterações descartadas");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Reconstruir sermon_json
      const sermonJson: SermonJsonStructure = {
        estrutura: {
          introducao: {
            abertura: formData.introduction.greeting || undefined,
            contexto: formData.introduction.context || undefined,
            gancho: formData.introduction.hook || undefined,
          },
          exposicaoBiblica: {
            contextoHistorico:
              formData.exposition.historicalContext || undefined,
            contextoCultural: formData.exposition.culturalContext || undefined,
            analiseTexto: formData.exposition.textAnalysis || undefined,
            versiculosApoio: formData.exposition.supportVerses || undefined,
          },
          pontosPrincipais: formData.mainPoints.filter((p) => p.trim() !== ""),
          aplicacaoPratica: {
            vidaPessoal: formData.application.personal || undefined,
            familia: formData.application.family || undefined,
            igreja: formData.application.church || undefined,
            sociedade: formData.application.society || undefined,
          },
          conclusao: {
            resumo: formData.conclusion.summary || undefined,
            chamadaAcao: formData.conclusion.callToAction || undefined,
            oracaoFinal: formData.conclusion.finalPrayer || undefined,
          },
          anotacoes: {
            ilustracoes: formData.notes.illustrations || undefined,
            estatisticas: formData.notes.statistics || undefined,
            citacoes: formData.notes.quotes || undefined,
            observacoes: formData.notes.general || undefined,
          },
        },
      };

      const result = await updateSermon(sermon.id, {
        title: formData.title || undefined,
        theme: formData.theme || undefined,
        main_verse: formData.main_verse || undefined,
        verse_text: formData.verse_text || undefined,
        objective: formData.objective || undefined,
        date: formData.date || null,
        sermon_json: JSON.stringify(sermonJson),
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Sermão salvo com sucesso!");
        setOriginalData(formData);
        setHasChanges(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao salvar sermão:", error);
      toast.error("Erro ao salvar sermão");
    } finally {
      setIsSaving(false);
      router.push("/history");
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Botão Voltar */}
      <div>
        <Link href="/history">
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4" />
            Voltar
          </Button>
        </Link>
      </div>

      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold">Editar Sermão</h1>
        <p className="text-muted-foreground mt-2">
          Edite os campos do sermão conforme necessário
        </p>
      </div>

      {/* Formulário Único */}
      <div className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Sermão</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Digite o título do sermão"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data da Pregação</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateField("date", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Tema do Sermão</Label>
              <Input
                id="theme"
                value={formData.theme}
                onChange={(e) => updateField("theme", e.target.value)}
                placeholder="Digite o tema do sermão"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="main_verse">Versículo Principal</Label>
                <Input
                  id="main_verse"
                  value={formData.main_verse}
                  onChange={(e) => updateField("main_verse", e.target.value)}
                  placeholder="Ex: João 3:16"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verse_text">Texto do Versículo</Label>
                <Input
                  id="verse_text"
                  value={formData.verse_text}
                  onChange={(e) => updateField("verse_text", e.target.value)}
                  placeholder="Digite o texto do versículo"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo do Sermão</Label>
              <Textarea
                id="objective"
                value={formData.objective}
                onChange={(e) => updateField("objective", e.target.value)}
                placeholder="Descreva o objetivo principal do sermão"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Introdução */}
        <Card>
          <CardHeader>
            <CardTitle>Introdução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="greeting">Abertura/Cumprimento</Label>
              <Textarea
                id="greeting"
                value={formData.introduction.greeting}
                onChange={(e) =>
                  updateField("introduction.greeting", e.target.value)
                }
                placeholder="Como você vai cumprimentar a congregação?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Contexto/Situação</Label>
              <Textarea
                id="context"
                value={formData.introduction.context}
                onChange={(e) =>
                  updateField("introduction.context", e.target.value)
                }
                placeholder="Descreva o contexto ou situação atual"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hook">Gancho/Chamada de Atenção</Label>
              <Textarea
                id="hook"
                value={formData.introduction.hook}
                onChange={(e) =>
                  updateField("introduction.hook", e.target.value)
                }
                placeholder="Como você vai captar a atenção da congregação?"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Exposição Bíblica */}
        <Card>
          <CardHeader>
            <CardTitle>Exposição Bíblica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="historicalContext">Contexto Histórico</Label>
              <Textarea
                id="historicalContext"
                value={formData.exposition.historicalContext}
                onChange={(e) =>
                  updateField("exposition.historicalContext", e.target.value)
                }
                placeholder="Descreva o contexto histórico do texto"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="culturalContext">Contexto Cultural</Label>
              <Textarea
                id="culturalContext"
                value={formData.exposition.culturalContext}
                onChange={(e) =>
                  updateField("exposition.culturalContext", e.target.value)
                }
                placeholder="Descreva o contexto cultural da época"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textAnalysis">Análise de Texto</Label>
              <Textarea
                id="textAnalysis"
                value={formData.exposition.textAnalysis}
                onChange={(e) =>
                  updateField("exposition.textAnalysis", e.target.value)
                }
                placeholder="Faça uma análise detalhada do texto"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportVerses">Versículos de Apoio</Label>
              <Textarea
                id="supportVerses"
                value={formData.exposition.supportVerses}
                onChange={(e) =>
                  updateField("exposition.supportVerses", e.target.value)
                }
                placeholder="Liste versículos que apoiam sua exposição"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pontos Principais */}
        <Card>
          <CardHeader>
            <CardTitle>Pontos Principais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.mainPoints.map((point, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`point-${index}`}>Ponto {index + 1}</Label>
                  <Textarea
                    id={`point-${index}`}
                    value={point}
                    onChange={(e) => updateMainPoint(index, e.target.value)}
                    placeholder={`Digite o ${index + 1}º ponto principal`}
                    rows={2}
                  />
                </div>
                {formData.mainPoints.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeMainPoint(index)}
                    className="mt-6"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={addMainPoint} className="w-full">
              <Plus className="mr-2 size-4" />
              Adicionar Ponto
            </Button>
          </CardContent>
        </Card>

        {/* Aplicação Prática */}
        <Card>
          <CardHeader>
            <CardTitle>Aplicação Prática</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personal">Aplicação para Vida Pessoal</Label>
              <Textarea
                id="personal"
                value={formData.application.personal}
                onChange={(e) =>
                  updateField("application.personal", e.target.value)
                }
                placeholder="Como aplicar este ensino na vida pessoal?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="family">Aplicação para Família</Label>
              <Textarea
                id="family"
                value={formData.application.family}
                onChange={(e) =>
                  updateField("application.family", e.target.value)
                }
                placeholder="Como aplicar este ensino na família?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="church">Aplicação para a Igreja</Label>
              <Textarea
                id="church"
                value={formData.application.church}
                onChange={(e) =>
                  updateField("application.church", e.target.value)
                }
                placeholder="Como aplicar este ensino na igreja?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="society">Aplicação para a Sociedade</Label>
              <Textarea
                id="society"
                value={formData.application.society}
                onChange={(e) =>
                  updateField("application.society", e.target.value)
                }
                placeholder="Como aplicar este ensino na sociedade?"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Conclusão */}
        <Card>
          <CardHeader>
            <CardTitle>Conclusão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="summary">Resumo dos Pontos</Label>
              <Textarea
                id="summary"
                value={formData.conclusion.summary}
                onChange={(e) =>
                  updateField("conclusion.summary", e.target.value)
                }
                placeholder="Faça um resumo dos pontos principais"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="callToAction">Chamada à Ação</Label>
              <Textarea
                id="callToAction"
                value={formData.conclusion.callToAction}
                onChange={(e) =>
                  updateField("conclusion.callToAction", e.target.value)
                }
                placeholder="Qual ação você quer que a congregação tome?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="finalPrayer">Oração Final</Label>
              <Textarea
                id="finalPrayer"
                value={formData.conclusion.finalPrayer}
                onChange={(e) =>
                  updateField("conclusion.finalPrayer", e.target.value)
                }
                placeholder="Escreva a oração final"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Anotações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Anotações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="illustrations">Ilustração/História</Label>
              <Textarea
                id="illustrations"
                value={formData.notes.illustrations}
                onChange={(e) =>
                  updateField("notes.illustrations", e.target.value)
                }
                placeholder="Adicione ilustrações ou histórias relevantes"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statistics">Estatísticas/Dados</Label>
              <Textarea
                id="statistics"
                value={formData.notes.statistics}
                onChange={(e) =>
                  updateField("notes.statistics", e.target.value)
                }
                placeholder="Adicione estatísticas ou dados relevantes"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quotes">Citações</Label>
              <Textarea
                id="quotes"
                value={formData.notes.quotes}
                onChange={(e) => updateField("notes.quotes", e.target.value)}
                placeholder="Adicione citações relevantes"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="general">Observações Gerais</Label>
              <Textarea
                id="general"
                value={formData.notes.general}
                onChange={(e) => updateField("notes.general", e.target.value)}
                placeholder="Adicione observações gerais"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving || !hasChanges}
          >
            <X className="size-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
