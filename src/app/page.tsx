"use client";

import { Mail } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { searchTokenByEmail } from "@/actions/search-token";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export default function Home() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Por favor, digite seu email");
      return;
    }

    setIsLoading(true);

    try {
      const result = await searchTokenByEmail(email);

      if (result.success && result.token) {
        // Redireciona para a página com o token
        window.location.href = `/${result.token}`;
      } else {
        toast.error(result.message || "Token não encontrado para este email");
      }
    } catch {
      toast.error("Erro ao buscar token. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-28 h-28 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
            <Image src="/LogoIcon.png" alt="Sermonário" className="w-16 h-16" width={64} height={64} />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sermonário App
          </CardTitle>
          <CardDescription className="text-gray-600">
            Digite seu email para acessar seu link de acesso
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white"
              disabled={isLoading}
            >
              {isLoading ? "Buscando..." : "Acessar link exclusivo"}
            </Button>
          </form>

          <div className="text-center mt-4 border-t pt-4 border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Precisa de ajuda? Entre em contato:
            </p>

            <div className="space-y-2">

              <Button variant="outline" size="sm" asChild className="w-full hover:bg-primary hover:text-white">
                <a href="mailto:sermonarioapp@gmail.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </a>
              </Button>
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
