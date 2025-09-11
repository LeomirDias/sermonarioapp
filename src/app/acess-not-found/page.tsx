import { AlertCircle, Home, Mail, Phone } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AcessNotFoundPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Acesso Negado
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Token de acesso não encontrado ou inválido
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="text-center space-y-4">
                        <p className="text-gray-700">
                            O token de acesso vitalício fornecido não foi encontrado em nosso sistema ou não está ativo.
                        </p>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800">
                                <strong>Possíveis causas:</strong>
                            </p>
                            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                                <li>• Token inválido ou inativo</li>
                                <li>• Link de acesso incorreto</li>
                                <li>• Erro de sistema</li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button asChild className="w-full">
                            <Link href="/">
                                <Home className="w-4 h-4 mr-2" />
                                Voltar ao início e tentar novamente
                            </Link>
                        </Button>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-3">
                                Precisa de ajuda? Entre em contato:
                            </p>

                            <div className="space-y-2">
                                <Button variant="outline" size="sm" asChild className="w-full">
                                    <a href="https://wa.me/64992834346" target="_blank" rel="noopener noreferrer">
                                        <Phone className="w-4 h-4 mr-2" />
                                        WhatsApp
                                    </a>
                                </Button>

                                <Button variant="outline" size="sm" asChild className="w-full">
                                    <a href="mailto:sermonario@gmail.com">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Email
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="text-center pt-4 border-t">
                        <p className="text-xs text-gray-500">
                            © 2025 Sermonário. Todos os direitos reservados.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
