"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import SermonCard from "./sermon-card";

interface Sermon {
  id: string;
  user_id: string;
  title: string;
  theme: string;
  main_verse: string;
  verse_text: string;
  objective: string;
  date: string | null;
  sermon_json: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface SermonHistoryGridProps {
  initialSermons: Sermon[];
}

export default function SermonHistoryGrid({
  initialSermons,
}: SermonHistoryGridProps) {
  const [sermons, setSermons] = useState<Sermon[]>(initialSermons);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    // Recarregar a lista de sermões
    setIsLoading(true);
    try {
      const response = await fetch("/api/sermons");
      if (response.ok) {
        const updatedSermons = await response.json();
        setSermons(updatedSermons);
      }
    } catch (error) {
      console.error("Erro ao recarregar sermões:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Botão Voltar */}
      <div>
        <Link href="/workspace">
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4" />
            Voltar
          </Button>
        </Link>
      </div>

      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold">Histórico de Sermões</h1>
        <p className="text-muted-foreground mt-2">
          {sermons.length === 0
            ? "Nenhum sermão encontrado"
            : `${sermons.length} sermão${sermons.length !== 1 ? "s" : ""} encontrado${sermons.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Grid de Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : sermons.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            Você ainda não criou nenhum sermão.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sermons.map((sermon) => (
            <SermonCard
              key={sermon.id}
              sermon={sermon}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
