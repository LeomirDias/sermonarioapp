import jsPDF from "jspdf";

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

export function exportSermonToPDF(sermonData: SermonData) {
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
}

