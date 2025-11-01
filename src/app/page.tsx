"use client";

import { Mail } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      const res = await fetch("/api/auth/exchange", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
        redirect: "follow",
      });

      if (res.redirected) {
        window.location.href = res.url;
        return;
      }

      if (res.ok) {
        window.location.href = "/workspace";
        return;
      }

      const data = await res.json().catch(() => ({}));
      toast.error(data?.error || "Não foi possível autenticar");
    } catch {
      toast.error("Erro ao autenticar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-100">
            <Image
              src="/LogoIcon.png"
              alt="Sermonário"
              className="h-16 w-16"
              width={64}
              height={64}
            />
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

          <div className="mt-4 border-t border-gray-200 pt-4 text-center">
            <p className="mb-3 text-sm text-gray-600">
              Precisa de ajuda? Entre em contato:
            </p>

            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hover:bg-primary w-full hover:text-white"
              >
                <a href="mailto:sermonarioapp@gmail.com">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="absolute bottom-0 mb-4 w-full text-center">
        <p className="text-xs text-gray-500">
          © 2025 Sermonário. Todos os direitos reservados. Desenvolvido por{" "}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            Synqia
          </a>
        </p>
      </div>
    </div>
  );
}
