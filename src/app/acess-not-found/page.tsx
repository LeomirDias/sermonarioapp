import { Mail, Phone, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AcessNotFoundPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-28 h-28 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
                        <ShieldAlert className="w-16 h-16 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Acesso Negado
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="text-center space-y-4">
                        <p className="text-gray-700">
                            O token de acesso vitalício fornecido no link não foi encontrado em nosso sistema ou não está ativo.
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

                        <p className="text-gray-700">
                            Clique no botão abaixo para buscar seu token de acesso.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button asChild className="w-full text-white">
                            <Link href="/">
                                Buscar meu token de acesso
                            </Link>
                        </Button>

                        <div className="text-center mt-4 border-t pt-4 border-gray-200">
                            <p className="text-sm text-gray-600 mb-3">
                                Precisa de ajuda? Entre em contato:
                            </p>

                            <div className="space-y-2">
                                <Button variant="outline" size="sm" asChild className="w-full hover:bg-primary hover:text-white">
                                    <a href="https://wa.me/64992834346" target="_blank" rel="noopener noreferrer">
                                        <Phone className="w-4 h-4 mr-2" />
                                        WhatsApp
                                    </a>
                                </Button>

                                <Button variant="outline" size="sm" asChild className="w-full hover:bg-primary hover:text-white">
                                    <a href="mailto:sermonario@gmail.com">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Email
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>
            <div className="text-center absolute bottom-0 w-full mb-4">
                <p className="text-xs text-gray-500">
                    © 2025 Sermonário. Todos os direitos reservados. Desenvolvido por <a href="#" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Synqia</a>
                </p>
            </div>
        </div>
    );
}
