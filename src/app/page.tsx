"use client";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sermonário
          </CardTitle>
          <CardDescription className="text-gray-600">
            Digite seu email para acessar seu sermão
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
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Buscando..." : "Acessar Sermão"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Não tem acesso? Entre em contato conosco
            </p>
            <div className="mt-2 space-x-4">
              <a
                href="https://wa.me/64992834346"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                WhatsApp
              </a>
              <a
                href="mailto:suporteigenda@gmail.com"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Email
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
