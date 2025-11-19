"use client";

import jsPDF from "jspdf";
import {
  Bell,
  Eye,
  FileDownIcon,
  FileText,
  History,
  MonitorPlay,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  UpdatesDialog,
  useHasUnseenUpdates,
} from "@/components/updates-dialog";

interface SermonData {
  title: string;
  date: string;
  theme: string;
  mainVerse: string;
  verseText: string;
  objective: string;
  introduction: {
    greeting: string;
    context: string;
    hook: string;
  };
  exposition: {
    historicalContext: string;
    culturalContext: string;
    textAnalysis: string;
    supportVerses: string;
  };
  mainPoints: string[];
  application: {
    personal: string;
    family: string;
    church: string;
    society: string;
  };
  conclusion: {
    summary: string;
    callToAction: string;
    finalPrayer: string;
  };
  notes: {
    illustrations: string;
    statistics: string;
    quotes: string;
    general: string;
  };
}

interface SidebarMenuProps {
  sermonData: SermonData;
  onClear: () => void;
  onExport: () => void;
}

export default function SidebarMenu({ sermonData, onClear }: SidebarMenuProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const hasUnseenUpdates = useHasUnseenUpdates();

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 30;

    // Função auxiliar para formatar data para dd/mm/aaaa
    const formatDate = (dateString: string) => {
      try {
        // Se a data já está no formato dd/mm/aaaa, retorna como está
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
          return dateString;
        }

        // Para datas no formato ISO (YYYY-MM-DD) ou outras, cria a data localmente
        let date: Date;

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          // Para formato YYYY-MM-DD, cria a data localmente para evitar problemas de fuso horário
          const [year, month, day] = dateString.split("-").map(Number);
          date = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11 para meses
        } else {
          // Para outros formatos, usa o construtor padrão
          date = new Date(dateString);
        }

        if (isNaN(date.getTime())) {
          return dateString; // Retorna a string original se não for uma data válida
        }

        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      } catch {
        return dateString; // Retorna a string original em caso de erro
      }
    };

    // Função auxiliar para adicionar seção
    const addSection = (title: string, y: number) => {
      doc.setFontSize(16);
      doc.setTextColor(43, 128, 255);
      doc.setFont(undefined, "bold");
      doc.text(title, 20, y);
      doc.setFont(undefined, "normal");
      return y + 15;
    };

    // Função auxiliar para adicionar subseção
    const addSubsection = (title: string, content: string, y: number) => {
      if (!content || content.trim() === "") return y;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "bold");
      doc.text(title, 20, y);
      y += 8;

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.setFont(undefined, "normal");
      const lines = doc.splitTextToSize(content, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 10;

      return y;
    };

    // Função auxiliar para verificar se precisa de nova página
    const checkNewPage = (y: number, neededSpace: number = 30) => {
      if (y + neededSpace > pageHeight - 20) {
        doc.addPage();
        return 30;
      }
      return y;
    };

    // Cabeçalho principal
    doc.setFillColor(43, 128, 255);
    doc.rect(0, 0, pageWidth, 25, "F");

    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");
    const headerTitle = sermonData.title
      ? `SERMÃO: ${sermonData.title.toUpperCase()}`
      : "SERMÃO ESTRUTURADO";
    doc.text(headerTitle, pageWidth / 2, 18, { align: "center" });

    yPosition = 40;

    // Informações básicas do sermão
    if (
      sermonData.title ||
      sermonData.date ||
      sermonData.theme ||
      sermonData.mainVerse ||
      sermonData.verseText ||
      sermonData.objective
    ) {
      yPosition = addSection("INFORMAÇÕES BÁSICAS", yPosition);
      yPosition = checkNewPage(yPosition, 50);

      if (sermonData.title) {
        yPosition = addSubsection("• Título:", sermonData.title, yPosition);
      }

      if (sermonData.date) {
        yPosition = addSubsection(
          "• Data:",
          formatDate(sermonData.date),
          yPosition,
        );
      }

      if (sermonData.theme) {
        yPosition = addSubsection("• Tema:", sermonData.theme, yPosition);
      }

      if (sermonData.mainVerse) {
        yPosition = addSubsection(
          "• Versículo Principal:",
          sermonData.mainVerse,
          yPosition,
        );
      }

      if (sermonData.verseText) {
        yPosition = addSubsection(
          "• Texto do Versículo:",
          sermonData.verseText,
          yPosition,
        );
      }

      if (sermonData.objective) {
        yPosition = addSubsection(
          "• Objetivo:",
          sermonData.objective,
          yPosition,
        );
      }
    }

    // Introdução
    if (
      sermonData.introduction.greeting ||
      sermonData.introduction.context ||
      sermonData.introduction.hook
    ) {
      yPosition = checkNewPage(yPosition, 40);
      yPosition = addSection("INTRODUÇÃO", yPosition);

      if (sermonData.introduction.greeting) {
        yPosition = addSubsection(
          "• Abertura/Cumprimento:",
          sermonData.introduction.greeting,
          yPosition,
        );
      }

      if (sermonData.introduction.context) {
        yPosition = addSubsection(
          "• Contexto/Situação:",
          sermonData.introduction.context,
          yPosition,
        );
      }

      if (sermonData.introduction.hook) {
        yPosition = addSubsection(
          "• Gancho/Chamada de Atenção:",
          sermonData.introduction.hook,
          yPosition,
        );
      }
    }

    // Exposição Bíblica
    if (
      sermonData.exposition.historicalContext ||
      sermonData.exposition.culturalContext ||
      sermonData.exposition.textAnalysis ||
      sermonData.exposition.supportVerses
    ) {
      yPosition = checkNewPage(yPosition, 40);
      yPosition = addSection("EXPOSIÇÃO BÍBLICA", yPosition);

      if (sermonData.exposition.historicalContext) {
        yPosition = addSubsection(
          "• Contexto Histórico:",
          sermonData.exposition.historicalContext,
          yPosition,
        );
      }

      if (sermonData.exposition.culturalContext) {
        yPosition = addSubsection(
          "• Contexto Cultural:",
          sermonData.exposition.culturalContext,
          yPosition,
        );
      }

      if (sermonData.exposition.textAnalysis) {
        yPosition = addSubsection(
          "• Análise do Texto:",
          sermonData.exposition.textAnalysis,
          yPosition,
        );
      }

      if (sermonData.exposition.supportVerses) {
        yPosition = addSubsection(
          "• Versículos de Apoio:",
          sermonData.exposition.supportVerses,
          yPosition,
        );
      }
    }

    // Pontos principais
    if (sermonData.mainPoints.some((point) => point.trim())) {
      yPosition = checkNewPage(yPosition, 40);
      yPosition = addSection("PONTOS PRINCIPAIS", yPosition);

      sermonData.mainPoints.forEach((point, index) => {
        if (point.trim()) {
          yPosition = addSubsection(`• Ponto ${index + 1}:`, point, yPosition);
        }
      });
    }

    // Aplicação prática
    if (
      sermonData.application.personal ||
      sermonData.application.family ||
      sermonData.application.church ||
      sermonData.application.society
    ) {
      yPosition = checkNewPage(yPosition, 40);
      yPosition = addSection("APLICAÇÃO PRÁTICA", yPosition);

      if (sermonData.application.personal) {
        yPosition = addSubsection(
          "• Vida Pessoal:",
          sermonData.application.personal,
          yPosition,
        );
      }

      if (sermonData.application.family) {
        yPosition = addSubsection(
          "• Família:",
          sermonData.application.family,
          yPosition,
        );
      }

      if (sermonData.application.church) {
        yPosition = addSubsection(
          "• Igreja:",
          sermonData.application.church,
          yPosition,
        );
      }

      if (sermonData.application.society) {
        yPosition = addSubsection(
          "• Sociedade:",
          sermonData.application.society,
          yPosition,
        );
      }
    }

    // Conclusão
    if (
      sermonData.conclusion.summary ||
      sermonData.conclusion.callToAction ||
      sermonData.conclusion.finalPrayer
    ) {
      yPosition = checkNewPage(yPosition, 40);
      yPosition = addSection("CONCLUSÃO", yPosition);

      if (sermonData.conclusion.summary) {
        yPosition = addSubsection(
          "• Resumo dos Pontos:",
          sermonData.conclusion.summary,
          yPosition,
        );
      }

      if (sermonData.conclusion.callToAction) {
        yPosition = addSubsection(
          "• Chamada à Ação:",
          sermonData.conclusion.callToAction,
          yPosition,
        );
      }

      if (sermonData.conclusion.finalPrayer) {
        yPosition = addSubsection(
          "• Oração Final:",
          sermonData.conclusion.finalPrayer,
          yPosition,
        );
      }
    }

    // Anotações
    if (
      sermonData.notes.illustrations ||
      sermonData.notes.statistics ||
      sermonData.notes.quotes ||
      sermonData.notes.general
    ) {
      yPosition = checkNewPage(yPosition, 40);
      yPosition = addSection("ANOTAÇÕES ADICIONAIS", yPosition);

      if (sermonData.notes.illustrations) {
        yPosition = addSubsection(
          "• Ilustrações:",
          sermonData.notes.illustrations,
          yPosition,
        );
      }

      if (sermonData.notes.statistics) {
        yPosition = addSubsection(
          "• Estatísticas:",
          sermonData.notes.statistics,
          yPosition,
        );
      }

      if (sermonData.notes.quotes) {
        yPosition = addSubsection(
          "• Citações:",
          sermonData.notes.quotes,
          yPosition,
        );
      }

      if (sermonData.notes.general) {
        yPosition = addSubsection(
          "• Observações Gerais:",
          sermonData.notes.general,
          yPosition,
        );
      }
    }

    // Rodapé
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Pagina ${i} de ${totalPages}`,
        pageWidth - 30,
        pageHeight - 10,
        { align: "right" },
      );
      doc.text("Gerado pelo Sermonario", 20, pageHeight - 10);
    }

    // Salvar o PDF
    doc.save(`sermao-${sermonData.title || "sem-titulo"}.pdf`);
  };

  const handleClear = () => {
    setShowClearDialog(true);
  };

  const handleConfirmClear = () => {
    onClear();
    setShowClearDialog(false);
  };

  const PreviewContent = () => (
    <div className="space-y-3 text-sm">
      {/* Informações Básicas */}
      {sermonData.title && (
        <div>
          <strong>Título:</strong> {sermonData.title}
        </div>
      )}
      {sermonData.date && (
        <div>
          <strong>Data:</strong> {sermonData.date}
        </div>
      )}
      {sermonData.theme && (
        <div>
          <strong>Tema:</strong> {sermonData.theme}
        </div>
      )}
      {sermonData.mainVerse && (
        <div>
          <strong>Versículo:</strong> {sermonData.mainVerse}
        </div>
      )}
      {sermonData.verseText && (
        <div>
          <strong>Texto do Versículo:</strong> {sermonData.verseText}
        </div>
      )}
      {sermonData.objective && (
        <div>
          <strong>Objetivo:</strong> {sermonData.objective}
        </div>
      )}

      {/* Introdução */}
      {(sermonData.introduction.greeting ||
        sermonData.introduction.context ||
        sermonData.introduction.hook) && (
        <div className="mt-3">
          <h4 className="mb-2 font-semibold text-blue-600">INTRODUÇÃO</h4>
          {sermonData.introduction.greeting && (
            <div className="mb-1">
              <strong>Abertura:</strong> {sermonData.introduction.greeting}
            </div>
          )}
          {sermonData.introduction.context && (
            <div className="mb-1">
              <strong>Contexto:</strong> {sermonData.introduction.context}
            </div>
          )}
          {sermonData.introduction.hook && (
            <div className="mb-1">
              <strong>Gancho:</strong> {sermonData.introduction.hook}
            </div>
          )}
        </div>
      )}

      {/* Exposição Bíblica */}
      {(sermonData.exposition.historicalContext ||
        sermonData.exposition.culturalContext ||
        sermonData.exposition.textAnalysis ||
        sermonData.exposition.supportVerses) && (
        <div className="mt-3">
          <h4 className="mb-2 font-semibold text-blue-600">
            EXPOSIÇÃO BÍBLICA
          </h4>
          {sermonData.exposition.historicalContext && (
            <div className="mb-1">
              <strong>Contexto Histórico:</strong>{" "}
              {sermonData.exposition.historicalContext}
            </div>
          )}
          {sermonData.exposition.culturalContext && (
            <div className="mb-1">
              <strong>Contexto Cultural:</strong>{" "}
              {sermonData.exposition.culturalContext}
            </div>
          )}
          {sermonData.exposition.textAnalysis && (
            <div className="mb-1">
              <strong>Análise do Texto:</strong>{" "}
              {sermonData.exposition.textAnalysis}
            </div>
          )}
          {sermonData.exposition.supportVerses && (
            <div className="mb-1">
              <strong>Versículos de Apoio:</strong>{" "}
              {sermonData.exposition.supportVerses}
            </div>
          )}
        </div>
      )}

      {/* Pontos Principais */}
      {sermonData.mainPoints.some((point) => point.trim()) && (
        <div className="mt-3">
          <h4 className="mb-2 font-semibold text-blue-600">
            PONTOS PRINCIPAIS
          </h4>
          {sermonData.mainPoints.map(
            (point, index) =>
              point.trim() && (
                <div key={index} className="mb-1">
                  <strong>Ponto {index + 1}:</strong> {point}
                </div>
              ),
          )}
        </div>
      )}

      {/* Aplicação Prática */}
      {(sermonData.application.personal ||
        sermonData.application.family ||
        sermonData.application.church ||
        sermonData.application.society) && (
        <div className="mt-3">
          <h4 className="mb-2 font-semibold text-blue-600">
            APLICAÇÃO PRÁTICA
          </h4>
          {sermonData.application.personal && (
            <div className="mb-1">
              <strong>Vida Pessoal:</strong> {sermonData.application.personal}
            </div>
          )}
          {sermonData.application.family && (
            <div className="mb-1">
              <strong>Família:</strong> {sermonData.application.family}
            </div>
          )}
          {sermonData.application.church && (
            <div className="mb-1">
              <strong>Igreja:</strong> {sermonData.application.church}
            </div>
          )}
          {sermonData.application.society && (
            <div className="mb-1">
              <strong>Sociedade:</strong> {sermonData.application.society}
            </div>
          )}
        </div>
      )}

      {/* Conclusão */}
      {(sermonData.conclusion.summary ||
        sermonData.conclusion.callToAction ||
        sermonData.conclusion.finalPrayer) && (
        <div className="mt-3">
          <h4 className="mb-2 font-semibold text-blue-600">CONCLUSÃO</h4>
          {sermonData.conclusion.summary && (
            <div className="mb-1">
              <strong>Resumo:</strong> {sermonData.conclusion.summary}
            </div>
          )}
          {sermonData.conclusion.callToAction && (
            <div className="mb-1">
              <strong>Chamada à Ação:</strong>{" "}
              {sermonData.conclusion.callToAction}
            </div>
          )}
          {sermonData.conclusion.finalPrayer && (
            <div className="mb-1">
              <strong>Oração Final:</strong> {sermonData.conclusion.finalPrayer}
            </div>
          )}
        </div>
      )}

      {/* Anotações */}
      {(sermonData.notes.illustrations ||
        sermonData.notes.statistics ||
        sermonData.notes.quotes ||
        sermonData.notes.general) && (
        <div className="mt-3">
          <h4 className="mb-2 font-semibold text-blue-600">ANOTAÇÕES</h4>
          {sermonData.notes.illustrations && (
            <div className="mb-1">
              <strong>Ilustrações:</strong> {sermonData.notes.illustrations}
            </div>
          )}
          {sermonData.notes.statistics && (
            <div className="mb-1">
              <strong>Estatísticas:</strong> {sermonData.notes.statistics}
            </div>
          )}
          {sermonData.notes.quotes && (
            <div className="mb-1">
              <strong>Citações:</strong> {sermonData.notes.quotes}
            </div>
          )}
          {sermonData.notes.general && (
            <div className="mb-1">
              <strong>Observações:</strong> {sermonData.notes.general}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const MenuContent = () => (
    <>
      <div className="space-y-3">
        {/* Visualizar Estrutura */}
        <Card className="hover:border-primary border-transparent shadow-md transition-all duration-300 hover:scale-105 hover:bg-blue-50">
          <CardHeader className="flex items-center justify-center">
            <CardTitle className="text-md text-primary flex flex-col items-center gap-2">
              <div className="bg-primary rounded-full p-2">
                <Eye className="h-5 w-5 text-white" />
              </div>
              Visualizar prévia do sermão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              className="bg-primary hover:border-primary/50 hover:text-primary flex w-full items-center gap-2 text-white shadow-md hover:bg-blue-50 hover:shadow-xl"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "Ocultar" : "Mostrar"} Estrutura
            </Button>
          </CardContent>
        </Card>

        {/* Exportar PDF */}
        <Card className="hover:border-primary border-transparent shadow-md transition-all duration-300 hover:scale-105 hover:bg-blue-50">
          <CardHeader className="flex items-center justify-center">
            <CardTitle className="text-md text-primary flex flex-col items-center gap-2">
              <div className="bg-primary rounded-full p-2">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Salvar sermão em PDF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              className="bg-primary hover:border-primary/50 hover:text-primary flex w-full items-center gap-2 text-white shadow-md hover:bg-blue-50 hover:shadow-xl"
              onClick={handleExportPDF}
            >
              Gerar PDF
            </Button>
          </CardContent>
        </Card>

        {/* Limpar Dados */}
        <Button
          variant="outline"
          size="sm"
          className="flex w-full items-center gap-2 shadow-md transition-all duration-300 hover:scale-105 hover:border-red-500 hover:bg-red-50 hover:text-red-600 hover:shadow-xl"
          onClick={handleClear}
        >
          <Trash2 className="h-4 w-4" />
          Limpar Tudo
        </Button>

        <div className="mt-4 flex w-full items-center justify-center gap-2 border-t-1 border-gray-200 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="hover:border-primary hover:text-primary flex w-1/2 items-center gap-2 shadow-md transition-all duration-300 hover:scale-105 hover:bg-blue-50 hover:shadow-xl"
          >
            <Link
              href={`/history`}
              className="flex items-center justify-center gap-2"
            >
              <History className="h-4 w-4" />
              Meu sermões
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hover:border-primary hover:text-primary flex w-1/2 items-center gap-2 shadow-md transition-all duration-300 hover:scale-105 hover:bg-blue-50 hover:shadow-xl"
          >
            <Link
              href="/tutorials"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <MonitorPlay className="h-4 w-4" />
              Tutoriais
            </Link>
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Ícone de Atualizações - Fixo no canto superior direito (apenas em telas lg+) */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 hidden h-12 w-12 rounded-full bg-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-blue-50 hover:shadow-xl lg:flex"
        onClick={() => setShowUpdates(true)}
        title="Atualizações"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {hasUnseenUpdates && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 animate-pulse rounded-full bg-red-500" />
        )}
      </Button>

      {/* Menu lateral - Desktop (apenas em telas lg+) */}
      <div className="fixed top-0 left-0 z-40 hidden h-full w-100 overflow-y-auto bg-none p-4 lg:block">
        <MenuContent />
      </div>

      {/* Menu horizontal - Mobile/Tablet (abaixo de lg) */}
      <div className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-between border-t border-gray-200 bg-white px-2 py-2 shadow-lg lg:hidden">
        {/* Esquerda: Limpar + Visualizar */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex h-auto min-h-[60px] w-auto min-w-[60px] flex-col items-center justify-center gap-1 px-2 py-1 transition-all duration-300 hover:scale-105 hover:bg-red-50 hover:text-red-600"
            onClick={handleClear}
            title="Limpar Tudo"
          >
            <Trash2 className="h-7 w-7" />
            <span className="text-xs">Limpar</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-primary flex h-auto min-h-[60px] w-auto min-w-[60px] flex-col items-center justify-center gap-1 px-2 py-1 transition-all duration-300 hover:scale-105 hover:bg-blue-50"
            onClick={() => setShowPreview(true)}
            title="Visualizar Prévia"
          >
            <Eye className="h-7 w-7" />
            <span className="text-xs">Prévia</span>
          </Button>
        </div>

        {/* Centro: PDF */}
        <Button
          variant="default"
          size="sm"
          className="bg-primary flex h-auto min-h-[60px] w-auto min-w-[60px] flex-col items-center justify-center gap-1 rounded-full px-2 py-1 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl"
          onClick={handleExportPDF}
          title="Salvar em PDF"
        >
          <FileDownIcon className="h-7 w-7 text-white" />
          <span className="text-xs text-white">PDF</span>
        </Button>

        {/* Direita: Histórico + Tutoriais */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-primary flex h-auto min-h-[60px] w-auto min-w-[60px] flex-col items-center justify-center gap-1 px-2 py-1 transition-all duration-300 hover:scale-105 hover:bg-blue-50"
            asChild
            title="Meus Sermões"
          >
            <Link
              href="/history"
              className="flex flex-col items-center justify-center gap-1"
            >
              <History className="h-7 w-7" />
              <span className="text-xs">Meus Sermões</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-primary flex h-auto min-h-[60px] w-auto min-w-[60px] flex-col items-center justify-center gap-1 px-2 py-1 transition-all duration-300 hover:scale-105 hover:bg-blue-50"
            asChild
            title="Tutoriais"
          >
            <Link
              href="/tutorials"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1"
            >
              <MonitorPlay className="h-7 w-7" />
              <span className="text-xs">Tutoriais</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Preview da estrutura - Desktop (painel fixo) */}
      {showPreview && (
        <div className="fixed top-4 right-4 z-40 hidden max-h-[calc(100vh-2rem)] w-100 overflow-y-auto rounded-lg bg-white p-4 shadow-lg lg:block">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">Prévia do Sermão</h3>
            <Button
              variant="ghost"
              size="sm"
              className="bg-none text-gray-600 transition-all duration-300 hover:scale-105 hover:bg-white hover:text-red-500"
              onClick={() => setShowPreview(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <PreviewContent />
        </div>
      )}

      {/* Preview da estrutura - Mobile (modal) */}
      <div className="lg:hidden">
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Prévia do Sermão</DialogTitle>
            </DialogHeader>
            <PreviewContent />
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de confirmação para limpar dados */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Limpeza</AlertDialogTitle>
            <AlertDialogDescription>
              Está ação excluirá todos os dados do sermão atual e não poderá ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClear}
              className="bg-red-600 hover:bg-red-700"
            >
              Limpar Tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpdatesDialog open={showUpdates} onOpenChange={setShowUpdates} />
    </>
  );
}
