"use client";

import { FileJson, FileText, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Sermon {
    id: string;
    title: string;
    theme: string;
    mainVerse: string;
    objective: string;
    description: string;
    price_in_cents: number;
    checkout_url?: string;
    createdAt: string;
    updatedAt: string;
    files?: {
        id: string;
        type: string;
        url: string;
    }[];
    hasAccess?: boolean;
}

interface AccessResult {
    sermonId: string;
    hasAccess: boolean;
}

interface MarketplaceClientProps {
    token: string;
}

export default function MarketplaceClient({ token }: MarketplaceClientProps) {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        const checkUserAccess = async (sermonIds: string[]) => {
            try {
                const response = await fetch(`/api/marketplace/check-access/${token}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ sermonIds }),
                });

                if (response.ok) {
                    const accessResults = await response.json();

                    setSermons(prevSermons =>
                        prevSermons.map(sermon => {
                            const accessResult = accessResults.find((ar: AccessResult) => ar.sermonId === sermon.id);
                            const isFree = sermon.price_in_cents === 0;
                            const hasPaidAccess = accessResult?.hasAccess ?? false;

                            return {
                                ...sermon,
                                hasAccess: isFree || hasPaidAccess
                            };
                        })
                    );
                }
            } catch (error) {
                console.error("Erro ao verificar acesso:", error);
            }
        };

        const fetchSermons = async () => {
            try {
                const response = await fetch("/api/marketplace/sermons");
                const data = await response.json();

                // Primeiro, definir os sermões no estado
                setSermons(data);

                // Depois, verificar acesso do usuário para sermões pagos
                const paidSermons = data.filter((sermon: Sermon) => sermon.price_in_cents > 0);

                if (paidSermons.length > 0) {
                    await checkUserAccess(paidSermons.map((s: Sermon) => s.id));
                }
            } catch (error) {
                console.error("Erro ao carregar sermões:", error);
                toast.error("Erro ao carregar sermões");
            } finally {
                setLoading(false);
            }
        };

        fetchSermons();
    }, [token]);

    const handleDownload = async (sermonId: string, type: "pdf" | "json") => {
        setDownloading(`${sermonId}-${type}`);
        try {
            const response = await fetch(`/api/marketplace/download/${token}/${sermonId}?type=${type}`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Erro ao fazer download");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `sermao-${sermonId}.${type}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Download iniciado com sucesso!");
        } catch (error) {
            console.error("Erro no download:", error);
            toast.error("Erro ao fazer download");
        } finally {
            setDownloading(null);
        }
    };

    const handlePurchase = (sermon: Sermon) => {
        // Usar checkout_url personalizado se disponível, senão usar URL padrão
        const checkoutUrl = sermon.checkout_url;
        window.open(checkoutUrl, "_blank");
    };

    const formatPrice = (priceInCents: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(priceInCents / 100);
    };

    const isFree = (price: number) => price === 0;

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Carregando sermões...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">Marketplace de Sermões</h1>
                <p className="text-xl text-muted-foreground">
                    Encontre sermões prontos para usar em suas pregações
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sermons.map((sermon) => (
                    <Card key={sermon.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant={
                                    isFree(sermon.price_in_cents)
                                        ? "default"
                                        : sermon.hasAccess
                                            ? "default"
                                            : "secondary"
                                }>
                                    {isFree(sermon.price_in_cents)
                                        ? "Gratuito"
                                        : sermon.hasAccess
                                            ? "Adquirido"
                                            : "Não adquirido"
                                    }
                                </Badge>
                                {!isFree(sermon.price_in_cents) && !sermon.hasAccess && (
                                    <span className="text-lg font-bold text-primary">
                                        {formatPrice(sermon.price_in_cents)}
                                    </span>
                                )}
                            </div>
                            <CardTitle className="text-xl line-clamp-2">{sermon.title}</CardTitle>
                            <p className="text-sm text-muted-foreground font-medium">{sermon.theme}</p>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Objetivo:</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {sermon.objective}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-sm mb-1">Versículo Principal:</h4>
                                <p className="text-sm font-medium text-primary">{sermon.mainVerse}</p>
                            </div>

                            {sermon.description && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Descrição:</h4>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {sermon.description}
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                {isFree(sermon.price_in_cents) || sermon.hasAccess ? (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDownload(sermon.id, "pdf")}
                                            disabled={downloading === `${sermon.id}-pdf`}
                                            className="flex-1"
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            {downloading === `${sermon.id}-pdf` ? "Baixando..." : "PDF"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDownload(sermon.id, "json")}
                                            disabled={downloading === `${sermon.id}-json`}
                                            className="flex-1"
                                        >
                                            <FileJson className="w-4 h-4 mr-2" />
                                            {downloading === `${sermon.id}-json` ? "Baixando..." : "JSON"}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => handlePurchase(sermon)}
                                        className="w-full"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Comprar por {formatPrice(sermon.price_in_cents)}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {sermons.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                        Nenhum sermão disponível no momento.
                    </p>
                </div>
            )}
        </div>
    );
}
