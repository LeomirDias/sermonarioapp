"use client"

import jsPDF from 'jspdf'
import {
    BookOpen,
    Download,
    Eye,
    FileEdit,
    FileText,
    Mail,
    Menu,
    MonitorPlay,
    Trash2,
    Upload,
    X
} from "lucide-react"
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


interface SermonData {
    title: string
    date: string
    theme: string
    mainVerse: string
    verseText: string
    objective: string
    introduction: {
        greeting: string
        context: string
        hook: string
    }
    exposition: {
        historicalContext: string
        culturalContext: string
        textAnalysis: string
        supportVerses: string
    }
    mainPoints: string[]
    application: {
        personal: string
        family: string
        church: string
        society: string
    }
    conclusion: {
        summary: string
        callToAction: string
        finalPrayer: string
    }
    notes: {
        illustrations: string
        statistics: string
        quotes: string
        general: string
    }
}

interface SidebarMenuProps {
    sermonData: SermonData
    onImport: (data: SermonData) => void
    onClear: () => void
    onExport: () => void
}

export default function SidebarMenu({ sermonData, onImport, onClear }: SidebarMenuProps) {
    const [showPreview, setShowPreview] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const params = useParams()
    const token = params.token as string

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string)
                    onImport(data)
                    alert('Sermão importado com sucesso!')
                } catch {
                    alert('Erro ao importar arquivo. Verifique se é um JSON válido.')
                }
            }
            reader.readAsText(file)
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }


    const handleExportJSON = () => {
        const dataStr = JSON.stringify(sermonData, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
        const exportFileDefaultName = `sermao-${sermonData.title || 'sem-titulo'}.json`

        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
    }

    const handleExportPDF = () => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.width
        const pageHeight = doc.internal.pageSize.height
        let yPosition = 30

        // Função auxiliar para formatar data para dd/mm/aaaa
        const formatDate = (dateString: string) => {
            try {
                // Se a data já está no formato dd/mm/aaaa, retorna como está
                if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
                    return dateString
                }

                // Para datas no formato ISO (YYYY-MM-DD) ou outras, cria a data localmente
                let date: Date

                if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                    // Para formato YYYY-MM-DD, cria a data localmente para evitar problemas de fuso horário
                    const [year, month, day] = dateString.split('-').map(Number)
                    date = new Date(year, month - 1, day) // month - 1 porque Date usa 0-11 para meses
                } else {
                    // Para outros formatos, usa o construtor padrão
                    date = new Date(dateString)
                }

                if (isNaN(date.getTime())) {
                    return dateString // Retorna a string original se não for uma data válida
                }

                const day = date.getDate().toString().padStart(2, '0')
                const month = (date.getMonth() + 1).toString().padStart(2, '0')
                const year = date.getFullYear()
                return `${day}/${month}/${year}`
            } catch {
                return dateString // Retorna a string original em caso de erro
            }
        }

        // Função auxiliar para adicionar seção
        const addSection = (title: string, y: number) => {
            doc.setFontSize(16)
            doc.setTextColor(43, 128, 255)
            doc.setFont(undefined, 'bold')
            doc.text(title, 20, y)
            doc.setFont(undefined, 'normal')
            return y + 15
        }

        // Função auxiliar para adicionar subseção
        const addSubsection = (title: string, content: string, y: number) => {
            if (!content || content.trim() === '') return y

            doc.setFontSize(12)
            doc.setTextColor(0, 0, 0)
            doc.setFont(undefined, 'bold')
            doc.text(title, 20, y)
            y += 8

            doc.setFontSize(10)
            doc.setTextColor(50, 50, 50)
            doc.setFont(undefined, 'normal')
            const lines = doc.splitTextToSize(content, 170)
            doc.text(lines, 20, y)
            y += lines.length * 5 + 10

            return y
        }

        // Função auxiliar para verificar se precisa de nova página
        const checkNewPage = (y: number, neededSpace: number = 30) => {
            if (y + neededSpace > pageHeight - 20) {
                doc.addPage()
                return 30
            }
            return y
        }

        // Cabeçalho principal
        doc.setFillColor(43, 128, 255)
        doc.rect(0, 0, pageWidth, 25, 'F')

        doc.setFontSize(20)
        doc.setTextColor(255, 255, 255)
        doc.setFont(undefined, 'bold')
        const headerTitle = sermonData.title ? `SERMÃO: ${sermonData.title.toUpperCase()}` : 'SERMÃO ESTRUTURADO'
        doc.text(headerTitle, pageWidth / 2, 18, { align: 'center' })

        yPosition = 40

        // Informações básicas do sermão
        if (sermonData.title || sermonData.date || sermonData.theme || sermonData.mainVerse || sermonData.verseText || sermonData.objective) {
            yPosition = addSection('INFORMAÇÕES BÁSICAS', yPosition)
            yPosition = checkNewPage(yPosition, 50)

            if (sermonData.title) {
                yPosition = addSubsection('• Título:', sermonData.title, yPosition)
            }

            if (sermonData.date) {
                yPosition = addSubsection('• Data:', formatDate(sermonData.date), yPosition)
            }

            if (sermonData.theme) {
                yPosition = addSubsection('• Tema:', sermonData.theme, yPosition)
            }

            if (sermonData.mainVerse) {
                yPosition = addSubsection('• Versículo Principal:', sermonData.mainVerse, yPosition)
            }

            if (sermonData.verseText) {
                yPosition = addSubsection('• Texto do Versículo:', sermonData.verseText, yPosition)
            }

            if (sermonData.objective) {
                yPosition = addSubsection('• Objetivo:', sermonData.objective, yPosition)
            }

        }

        // Introdução
        if (sermonData.introduction.greeting || sermonData.introduction.context || sermonData.introduction.hook) {
            yPosition = checkNewPage(yPosition, 40)
            yPosition = addSection('INTRODUÇÃO', yPosition)

            if (sermonData.introduction.greeting) {
                yPosition = addSubsection('• Abertura/Cumprimento:', sermonData.introduction.greeting, yPosition)
            }

            if (sermonData.introduction.context) {
                yPosition = addSubsection('• Contexto/Situação:', sermonData.introduction.context, yPosition)
            }

            if (sermonData.introduction.hook) {
                yPosition = addSubsection('• Gancho/Chamada de Atenção:', sermonData.introduction.hook, yPosition)
            }

        }

        // Exposição Bíblica
        if (sermonData.exposition.historicalContext || sermonData.exposition.culturalContext ||
            sermonData.exposition.textAnalysis || sermonData.exposition.supportVerses) {
            yPosition = checkNewPage(yPosition, 40)
            yPosition = addSection('EXPOSIÇÃO BÍBLICA', yPosition)

            if (sermonData.exposition.historicalContext) {
                yPosition = addSubsection('• Contexto Histórico:', sermonData.exposition.historicalContext, yPosition)
            }

            if (sermonData.exposition.culturalContext) {
                yPosition = addSubsection('• Contexto Cultural:', sermonData.exposition.culturalContext, yPosition)
            }

            if (sermonData.exposition.textAnalysis) {
                yPosition = addSubsection('• Análise do Texto:', sermonData.exposition.textAnalysis, yPosition)
            }

            if (sermonData.exposition.supportVerses) {
                yPosition = addSubsection('• Versículos de Apoio:', sermonData.exposition.supportVerses, yPosition)
            }

        }

        // Pontos principais
        if (sermonData.mainPoints.some(point => point.trim())) {
            yPosition = checkNewPage(yPosition, 40)
            yPosition = addSection('PONTOS PRINCIPAIS', yPosition)

            sermonData.mainPoints.forEach((point, index) => {
                if (point.trim()) {
                    yPosition = addSubsection(`• Ponto ${index + 1}:`, point, yPosition)
                }
            })

        }

        // Aplicação prática
        if (sermonData.application.personal || sermonData.application.family ||
            sermonData.application.church || sermonData.application.society) {
            yPosition = checkNewPage(yPosition, 40)
            yPosition = addSection('APLICAÇÃO PRÁTICA', yPosition)

            if (sermonData.application.personal) {
                yPosition = addSubsection('• Vida Pessoal:', sermonData.application.personal, yPosition)
            }

            if (sermonData.application.family) {
                yPosition = addSubsection('• Família:', sermonData.application.family, yPosition)
            }

            if (sermonData.application.church) {
                yPosition = addSubsection('• Igreja:', sermonData.application.church, yPosition)
            }

            if (sermonData.application.society) {
                yPosition = addSubsection('• Sociedade:', sermonData.application.society, yPosition)
            }

        }

        // Conclusão
        if (sermonData.conclusion.summary || sermonData.conclusion.callToAction || sermonData.conclusion.finalPrayer) {
            yPosition = checkNewPage(yPosition, 40)
            yPosition = addSection('CONCLUSÃO', yPosition)

            if (sermonData.conclusion.summary) {
                yPosition = addSubsection('• Resumo dos Pontos:', sermonData.conclusion.summary, yPosition)
            }

            if (sermonData.conclusion.callToAction) {
                yPosition = addSubsection('• Chamada à Ação:', sermonData.conclusion.callToAction, yPosition)
            }

            if (sermonData.conclusion.finalPrayer) {
                yPosition = addSubsection('• Oração Final:', sermonData.conclusion.finalPrayer, yPosition)
            }

        }

        // Anotações
        if (sermonData.notes.illustrations || sermonData.notes.statistics ||
            sermonData.notes.quotes || sermonData.notes.general) {
            yPosition = checkNewPage(yPosition, 40)
            yPosition = addSection('ANOTAÇÕES ADICIONAIS', yPosition)

            if (sermonData.notes.illustrations) {
                yPosition = addSubsection('• Ilustrações:', sermonData.notes.illustrations, yPosition)
            }

            if (sermonData.notes.statistics) {
                yPosition = addSubsection('• Estatísticas:', sermonData.notes.statistics, yPosition)
            }

            if (sermonData.notes.quotes) {
                yPosition = addSubsection('• Citações:', sermonData.notes.quotes, yPosition)
            }

            if (sermonData.notes.general) {
                yPosition = addSubsection('• Observações Gerais:', sermonData.notes.general, yPosition)
            }
        }

        // Rodapé
        const totalPages = doc.internal.getNumberOfPages()
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.text(`Pagina ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10, { align: 'right' })
            doc.text('Gerado pelo Sermonario', 20, pageHeight - 10)
        }

        // Salvar o PDF
        doc.save(`sermao-${sermonData.title || 'sem-titulo'}.pdf`)
    }

    const MenuContent = () => (
        <>
            <div className="space-y-3">
                {/* Importar JSON */}
                <Card className="border-transparent shadow-md hover:border-primary hover:bg-blue-50 hover:scale-105 transition-all duration-300">
                    <CardHeader className="flex items-center justify-center">
                        <CardTitle className="text-md flex flex-col text-primary items-center gap-2">
                            <div className="bg-primary rounded-full p-2">
                                <FileEdit className="h-5 w-5 text-white" />
                            </div>
                            Editar um Sermão
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full flex items-center bg-primary text-white gap-2 shadow-md hover:border-primary/50 hover:shadow-xl hover:bg-blue-50 hover:text-primary"
                            onClick={handleUploadClick}
                        >
                            <Upload className="h-4 w-4" />
                            Escolher Arquivo
                        </Button>
                    </CardContent>
                </Card>

                {/* Exportar JSON */}
                <Card className="border-transparent shadow-md hover:border-primary hover:bg-blue-50 hover:scale-105 transition-all duration-300">
                    <CardHeader className="flex items-center justify-center">
                        <CardTitle className="text-md flex flex-col text-primary items-center gap-2">
                            <div className="bg-primary rounded-full p-2">
                                <Download className="h-5 w-5 text-white" />
                            </div>
                            Salvar sermão editável
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full flex items-center bg-primary text-white gap-2 shadow-md hover:border-primary/50 hover:shadow-xl hover:bg-blue-50 hover:text-primary"
                            onClick={handleExportJSON}
                        >
                            Baixar JSON
                        </Button>
                    </CardContent>
                </Card>

                {/* Visualizar Estrutura */}
                <Card className="border-transparent shadow-md hover:border-primary hover:bg-blue-50 hover:scale-105 transition-all duration-300">
                    <CardHeader className="flex items-center justify-center">
                        <CardTitle className="text-md flex flex-col text-primary items-center gap-2">
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
                            className="w-full flex items-center bg-primary text-white gap-2 shadow-md hover:border-primary/50 hover:shadow-xl hover:bg-blue-50 hover:text-primary"
                            onClick={() => setShowPreview(!showPreview)}
                        >
                            {showPreview ? 'Ocultar' : 'Mostrar'} Estrutura
                        </Button>
                    </CardContent>
                </Card>

                {/* Exportar PDF */}
                <Card className="border-transparent shadow-md hover:border-primary hover:bg-blue-50 hover:scale-105 transition-all duration-300">
                    <CardHeader className="flex items-center justify-center">
                        <CardTitle className="text-md flex flex-col text-primary items-center gap-2">
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
                            className="w-full flex items-center bg-primary text-white gap-2 shadow-md hover:border-primary/50 hover:shadow-xl hover:bg-blue-50 hover:text-primary"
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
                    className="w-full flex items-center gap-2 shadow-md hover:border-red-500 hover:shadow-xl hover:bg-red-50 hover:text-red-600 hover:scale-105 transition-all duration-300"
                    onClick={() => {
                        if (confirm('Tem certeza que deseja limpar todos os dados?')) {
                            onClear()
                        }
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                    Limpar Tudo
                </Button>

                <div className="flex items-center justify-center gap-2 w-full mt-4 border-t-1 border-gray-200 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-1/2 flex items-center gap-2 shadow-md hover:border-primary hover:shadow-xl hover:bg-blue-50 hover:text-primary hover:scale-105 transition-all duration-300"
                    >
                        <Link href={`/${token}/marketplace`} className="flex items-center justify-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Loja de Sermões
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-1/2 flex items-center gap-2 shadow-md hover:border-primary hover:shadow-xl hover:bg-blue-50 hover:text-primary hover:scale-105 transition-all duration-300"
                    >
                        <Link href="/tutorials" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                            <MonitorPlay className="h-4 w-4" />
                            Tutorial
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    )

    return (
        <>
            {/* Trigger button para mobile - canto superior direito */}
            <Button
                variant="default"
                size="sm"
                className="fixed bottom-4 right-3 z-50 h-10 w-10 rounded-full md:hidden bg-primary shadow-sm border-transparent text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <Menu className="h-8 w-8" />
            </Button>

            {/* Overlay para mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-gray-50 bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="fixed bottom-4 left-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-primary hover:text-white z-50"
                    >
                        <a href="mailto:sermonarioapp@gmail.com" className="flex items-center gap-2 px-4 py-2">
                            <Mail className="w-8 h-8" />
                        </a>
                    </Button>
                </div>
            )}

            {/* Menu lateral - Desktop (sempre visível) */}
            <div className="hidden md:block fixed left-0 top-0 h-full w-100 bg-none z-40 overflow-y-auto p-4">
                <MenuContent />
            </div>

            {/* Menu lateral - Mobile (colapsável) */}
            <div className={`fixed right-0 top-0 h-full w-80 bg-gray-50 border-l-1 border-gray-200 shadow-xl z-50 overflow-y-auto p-4 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Menu</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <MenuContent />
            </div>

            {/* Preview da estrutura */}
            {showPreview && (
                <div className="fixed top-4 right-4 w-100 max-h-200 bg-white shadow-lg rounded-lg p-4 z-40 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Prévia do Sermão</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 bg-none hover:bg-white hover:text-red-500 hover:scale-105 transition-all duration-300"
                            onClick={() => setShowPreview(false)}
                        >
                            Fechar
                        </Button>
                    </div>
                    <div className="text-sm space-y-3">
                        {/* Informações Básicas */}
                        {sermonData.title && <div><strong>Título:</strong> {sermonData.title}</div>}
                        {sermonData.date && <div><strong>Data:</strong> {sermonData.date}</div>}
                        {sermonData.theme && <div><strong>Tema:</strong> {sermonData.theme}</div>}
                        {sermonData.mainVerse && <div><strong>Versículo:</strong> {sermonData.mainVerse}</div>}
                        {sermonData.verseText && <div><strong>Texto do Versículo:</strong> {sermonData.verseText}</div>}
                        {sermonData.objective && <div><strong>Objetivo:</strong> {sermonData.objective}</div>}

                        {/* Introdução */}
                        {(sermonData.introduction.greeting || sermonData.introduction.context || sermonData.introduction.hook) && (
                            <div className="mt-3">
                                <h4 className="font-semibold text-blue-600 mb-2">INTRODUÇÃO</h4>
                                {sermonData.introduction.greeting && <div className="mb-1"><strong>Abertura:</strong> {sermonData.introduction.greeting}</div>}
                                {sermonData.introduction.context && <div className="mb-1"><strong>Contexto:</strong> {sermonData.introduction.context}</div>}
                                {sermonData.introduction.hook && <div className="mb-1"><strong>Gancho:</strong> {sermonData.introduction.hook}</div>}
                            </div>
                        )}

                        {/* Exposição Bíblica */}
                        {(sermonData.exposition.historicalContext || sermonData.exposition.culturalContext || sermonData.exposition.textAnalysis || sermonData.exposition.supportVerses) && (
                            <div className="mt-3">
                                <h4 className="font-semibold text-blue-600 mb-2">EXPOSIÇÃO BÍBLICA</h4>
                                {sermonData.exposition.historicalContext && <div className="mb-1"><strong>Contexto Histórico:</strong> {sermonData.exposition.historicalContext}</div>}
                                {sermonData.exposition.culturalContext && <div className="mb-1"><strong>Contexto Cultural:</strong> {sermonData.exposition.culturalContext}</div>}
                                {sermonData.exposition.textAnalysis && <div className="mb-1"><strong>Análise do Texto:</strong> {sermonData.exposition.textAnalysis}</div>}
                                {sermonData.exposition.supportVerses && <div className="mb-1"><strong>Versículos de Apoio:</strong> {sermonData.exposition.supportVerses}</div>}
                            </div>
                        )}

                        {/* Pontos Principais */}
                        {sermonData.mainPoints.some(point => point.trim()) && (
                            <div className="mt-3">
                                <h4 className="font-semibold text-blue-600 mb-2">PONTOS PRINCIPAIS</h4>
                                {sermonData.mainPoints.map((point, index) => (
                                    point.trim() && <div key={index} className="mb-1"><strong>Ponto {index + 1}:</strong> {point}</div>
                                ))}
                            </div>
                        )}

                        {/* Aplicação Prática */}
                        {(sermonData.application.personal || sermonData.application.family || sermonData.application.church || sermonData.application.society) && (
                            <div className="mt-3">
                                <h4 className="font-semibold text-blue-600 mb-2">APLICAÇÃO PRÁTICA</h4>
                                {sermonData.application.personal && <div className="mb-1"><strong>Vida Pessoal:</strong> {sermonData.application.personal}</div>}
                                {sermonData.application.family && <div className="mb-1"><strong>Família:</strong> {sermonData.application.family}</div>}
                                {sermonData.application.church && <div className="mb-1"><strong>Igreja:</strong> {sermonData.application.church}</div>}
                                {sermonData.application.society && <div className="mb-1"><strong>Sociedade:</strong> {sermonData.application.society}</div>}
                            </div>
                        )}

                        {/* Conclusão */}
                        {(sermonData.conclusion.summary || sermonData.conclusion.callToAction || sermonData.conclusion.finalPrayer) && (
                            <div className="mt-3">
                                <h4 className="font-semibold text-blue-600 mb-2">CONCLUSÃO</h4>
                                {sermonData.conclusion.summary && <div className="mb-1"><strong>Resumo:</strong> {sermonData.conclusion.summary}</div>}
                                {sermonData.conclusion.callToAction && <div className="mb-1"><strong>Chamada à Ação:</strong> {sermonData.conclusion.callToAction}</div>}
                                {sermonData.conclusion.finalPrayer && <div className="mb-1"><strong>Oração Final:</strong> {sermonData.conclusion.finalPrayer}</div>}
                            </div>
                        )}

                        {/* Anotações */}
                        {(sermonData.notes.illustrations || sermonData.notes.statistics || sermonData.notes.quotes || sermonData.notes.general) && (
                            <div className="mt-3">
                                <h4 className="font-semibold text-blue-600 mb-2">ANOTAÇÕES</h4>
                                {sermonData.notes.illustrations && <div className="mb-1"><strong>Ilustrações:</strong> {sermonData.notes.illustrations}</div>}
                                {sermonData.notes.statistics && <div className="mb-1"><strong>Estatísticas:</strong> {sermonData.notes.statistics}</div>}
                                {sermonData.notes.quotes && <div className="mb-1"><strong>Citações:</strong> {sermonData.notes.quotes}</div>}
                                {sermonData.notes.general && <div className="mb-1"><strong>Observações:</strong> {sermonData.notes.general}</div>}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
