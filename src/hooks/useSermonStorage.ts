import { useEffect, useState } from 'react'

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

const STORAGE_KEY = 'sermon-data'

export function useSermonStorage() {
    const [sermonData, setSermonData] = useState<SermonData>({
        title: "",
        date: "",
        theme: "",
        mainVerse: "",
        verseText: "",
        objective: "",
        introduction: {
            greeting: "",
            context: "",
            hook: ""
        },
        exposition: {
            historicalContext: "",
            culturalContext: "",
            textAnalysis: "",
            supportVerses: ""
        },
        mainPoints: [""],
        application: {
            personal: "",
            family: "",
            church: "",
            society: ""
        },
        conclusion: {
            summary: "",
            callToAction: "",
            finalPrayer: ""
        },
        notes: {
            illustrations: "",
            statistics: "",
            quotes: "",
            general: ""
        }
    })

    // Carregar dados do localStorage na inicialização
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY)
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData)
                setSermonData(parsedData)
            } catch (error) {
                console.error('Erro ao carregar dados do localStorage:', error)
            }
        }
    }, [])

    // Salvar dados no localStorage sempre que houver mudanças
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sermonData))
    }, [sermonData])

    const updateSermonData = (updates: Partial<SermonData>) => {
        setSermonData(prev => ({ ...prev, ...updates }))
    }

    const clearSermonData = () => {
        const emptyData: SermonData = {
            title: "",
            date: "",
            theme: "",
            mainVerse: "",
            verseText: "",
            objective: "",
            introduction: {
                greeting: "",
                context: "",
                hook: ""
            },
            exposition: {
                historicalContext: "",
                culturalContext: "",
                textAnalysis: "",
                supportVerses: ""
            },
            mainPoints: [""],
            application: {
                personal: "",
                family: "",
                church: "",
                society: ""
            },
            conclusion: {
                summary: "",
                callToAction: "",
                finalPrayer: ""
            },
            notes: {
                illustrations: "",
                statistics: "",
                quotes: "",
                general: ""
            }
        }
        setSermonData(emptyData)
        localStorage.removeItem(STORAGE_KEY)
    }

    const importSermonData = (data: SermonData) => {
        setSermonData(data)
    }

    return {
        sermonData,
        updateSermonData,
        clearSermonData,
        importSermonData
    }
}
