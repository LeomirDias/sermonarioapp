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

        // Configurações do PDF
        doc.setFontSize(20)
        doc.text('ESTRUTURA DO SERMÃO', 20, 20)

        let yPosition = 40

        // Informações básicas
        if (sermonData.title) {
            doc.setFontSize(16)
            doc.text(`Título: ${sermonData.title}`, 20, yPosition)
            yPosition += 10
        }

        if (sermonData.date) {
            doc.setFontSize(12)
            doc.text(`Data: ${sermonData.date}`, 20, yPosition)
            yPosition += 10
        }

        if (sermonData.theme) {
            doc.setFontSize(12)
            doc.text(`Tema: ${sermonData.theme}`, 20, yPosition)
            yPosition += 10
        }

        if (sermonData.mainVerse) {
            doc.setFontSize(12)
            doc.text(`Versículo: ${sermonData.mainVerse}`, 20, yPosition)
            yPosition += 10
        }

        if (sermonData.verseText) {
            doc.setFontSize(10)
            const verseText = doc.splitTextToSize(sermonData.verseText, 170)
            doc.text(verseText, 20, yPosition)
            yPosition += verseText.length * 5 + 10
        }

        if (sermonData.objective) {
            doc.setFontSize(12)
            doc.text('Objetivo:', 20, yPosition)
            yPosition += 10
            doc.setFontSize(10)
            const objective = doc.splitTextToSize(sermonData.objective, 170)
            doc.text(objective, 20, yPosition)
            yPosition += objective.length * 5 + 15
        }

        // Introdução
        if (sermonData.introduction.greeting || sermonData.introduction.context || sermonData.introduction.hook) {
            doc.setFontSize(14)
            doc.text('INTRODUÇÃO', 20, yPosition)
            yPosition += 10

            if (sermonData.introduction.greeting) {
                doc.setFontSize(12)
                doc.text('Abertura/Cumprimento:', 20, yPosition)
                yPosition += 10
                doc.setFontSize(10)
                const greeting = doc.splitTextToSize(sermonData.introduction.greeting, 170)
                doc.text(greeting, 20, yPosition)
                yPosition += greeting.length * 5 + 10
            }

            if (sermonData.introduction.context) {
                doc.setFontSize(12)
                doc.text('Contexto/Situação:', 20, yPosition)
                yPosition += 10
                doc.setFontSize(10)
                const context = doc.splitTextToSize(sermonData.introduction.context, 170)
                doc.text(context, 20, yPosition)
                yPosition += context.length * 5 + 10
            }

            if (sermonData.introduction.hook) {
                doc.setFontSize(12)
                doc.text('Gancho/Chamada de Atenção:', 20, yPosition)
                yPosition += 10
                doc.setFontSize(10)
                const hook = doc.splitTextToSize(sermonData.introduction.hook, 170)
                doc.text(hook, 20, yPosition)
                yPosition += hook.length * 5 + 15
            }
        }

        // Pontos principais
        if (sermonData.mainPoints.some(point => point.trim())) {
            doc.setFontSize(14)
            doc.text('PONTOS PRINCIPAIS', 20, yPosition)
            yPosition += 10

            sermonData.mainPoints.forEach((point, index) => {
                if (point.trim()) {
                    doc.setFontSize(12)
                    doc.text(`Ponto ${index + 1}:`, 20, yPosition)
                    yPosition += 10
                    doc.setFontSize(10)
                    const pointText = doc.splitTextToSize(point, 170)
                    doc.text(pointText, 20, yPosition)
                    yPosition += pointText.length * 5 + 10
                }
            })
            yPosition += 5
        }

        // Aplicação prática
        if (sermonData.application.personal || sermonData.application.family ||
            sermonData.application.church || sermonData.application.society) {
            doc.setFontSize(14)
            doc.text('APLICAÇÃO PRÁTICA', 20, yPosition)
            yPosition += 10

            if (sermonData.application.personal) {
                doc.setFontSize(12)
                doc.text('Vida Pessoal:', 20, yPosition)
                yPosition += 10
                doc.setFontSize(10)
                const personal = doc.splitTextToSize(sermonData.application.personal, 170)
                doc.text(personal, 20, yPosition)
                yPosition += personal.length * 5 + 10
            }

            if (sermonData.application.family) {
                doc.setFontSize(12)
                doc.text('Família:', 20, yPosition)
                yPosition += 10
                doc.setFontSize(10)
                const family = doc.splitTextToSize(sermonData.application.family, 170)
                doc.text(family, 20, yPosition)
                yPosition += family.length * 5 + 10
            }

            if (sermonData.application.church) {
                doc.setFontSize(12)
                doc.text('Igreja:', 20, yPosition)
                yPosition += 10
                doc.setFontSize(10)
                const church = doc.splitTextToSize(sermonData.application.church, 170)
                doc.text(church, 20, yPosition)
                yPosition += church.length * 5 + 10
            }

            if (sermonData.application.society) {
                doc.setFontSize(12)
                doc.text('Sociedade:', 20, yPosition)
                yPosition += 10
                doc.setFontSize(10)
                const society = doc.splitTextToSize(sermonData.application.society, 170)
                doc.text(society, 20, yPosition)
                yPosition += society.length * 5 + 15
            }
        }

        // Conclusão
        if (sermonData.conclusion.summary || sermonData.conclusion.callToAction || sermonData.conclusion.finalPrayer) {
            doc.setFontSize(14)
            doc.text('CONCLUSÃO', 20, yPosition)
            yPosition += 10

            if (sermonData.conclusion.summary) {
                doc.setFontSize(12)
                doc.text('Resumo dos Pontos:', 20, yPosition)
                yPosition += 10
                doc.setFontSize(10)
                const summary = doc.splitTextToSize(sermonData.conclusion.summary, 170)
                doc.text(summary, 20, yPosition)
                yPosition += summary.length * 5 + 10
            }

            if (sermonData.conclusion.callToAction) {
                doc.setFontSize(12)
                doc.text('Chamada à Ação:', 20, yPosition)
                yPosition += 10
                doc.setFontSize(10)
                const callToAction = doc.splitTextToSize(sermonData.conclusion.callToAction, 170)
                doc.text(callToAction, 20, yPosition)
                yPosition += callToAction.length * 5 + 10
            }

            if (sermonData.conclusion.finalPrayer) {
                doc.setFontSize(12)
                doc.text('Oração Final:', 20, yPosition)
                yPosition += 10
                doc.setFontSize(10)
                const finalPrayer = doc.splitTextToSize(sermonData.conclusion.finalPrayer, 170)
                doc.text(finalPrayer, 20, yPosition)
                yPosition += finalPrayer.length * 5 + 10
            }
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
                        <Link href="/store" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Loja de Sermões
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-1/2 flex items-center gap-2 shadow-md hover:border-primary hover:shadow-xl hover:bg-blue-50 hover:text-primary hover:scale-105 transition-all duration-300"
                    >
                        <Link href="/tutorial" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
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
                        <a href="mailto:sermonario@gmail.com" className="flex items-center gap-2 px-4 py-2">
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
                <div className="fixed top-4 right-4 w-96 max-h-96 bg-white shadow-lg rounded-lg p-4 z-40 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Estrutura do Sermão</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPreview(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="text-sm space-y-2">
                        {sermonData.title && <p><strong>Título:</strong> {sermonData.title}</p>}
                        {sermonData.date && <p><strong>Data:</strong> {sermonData.date}</p>}
                        {sermonData.theme && <p><strong>Tema:</strong> {sermonData.theme}</p>}
                        {sermonData.mainVerse && <p><strong>Versículo:</strong> {sermonData.mainVerse}</p>}
                        {sermonData.objective && <p><strong>Objetivo:</strong> {sermonData.objective.substring(0, 100)}...</p>}

                        <div className="mt-4">
                            <p><strong>Seções Preenchidas:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                {sermonData.introduction.greeting && <li>Introdução - Abertura</li>}
                                {sermonData.introduction.context && <li>Introdução - Contexto</li>}
                                {sermonData.introduction.hook && <li>Introdução - Gancho</li>}
                                {sermonData.exposition.historicalContext && <li>Exposição - Contexto Histórico</li>}
                                {sermonData.exposition.culturalContext && <li>Exposição - Contexto Cultural</li>}
                                {sermonData.exposition.textAnalysis && <li>Exposição - Análise de Texto</li>}
                                {sermonData.mainPoints.some(p => p.trim()) && <li>Pontos Principais ({sermonData.mainPoints.filter(p => p.trim()).length})</li>}
                                {sermonData.application.personal && <li>Aplicação - Vida Pessoal</li>}
                                {sermonData.application.family && <li>Aplicação - Família</li>}
                                {sermonData.application.church && <li>Aplicação - Igreja</li>}
                                {sermonData.application.society && <li>Aplicação - Sociedade</li>}
                                {sermonData.conclusion.summary && <li>Conclusão - Resumo</li>}
                                {sermonData.conclusion.callToAction && <li>Conclusão - Chamada à Ação</li>}
                                {sermonData.conclusion.finalPrayer && <li>Conclusão - Oração Final</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
