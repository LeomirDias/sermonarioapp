"use client";

import { Download, Eye, FileEdit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { deleteSermon } from "@/actions/sermons/delete-sermon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exportSermonToPDF } from "@/lib/pdf-export";

import SermonDetailDialog from "./sermon-detail-dialog";

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

interface SermonCardProps {
  sermon: Sermon;
  onDelete: () => void;
}

export default function SermonCard({ sermon, onDelete }: SermonCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSermon(sermon.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Sermão excluído com sucesso!");
        onDelete();
      }
    } catch (error) {
      console.error("Erro ao excluir sermão:", error);
      toast.error("Erro ao excluir sermão");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleExportPDF = () => {
    try {
      // Parse do sermon_json
      const sermonJson = JSON.parse(sermon.sermon_json);

      // Mapear para o formato esperado pela função de exportação
      const sermonData = {
        title: sermon.title,
        date: sermon.date || "",
        theme: sermon.theme,
        mainVerse: sermon.main_verse,
        verseText: sermon.verse_text,
        objective: sermon.objective,
        introduction: {
          greeting: sermonJson.estrutura?.introducao?.abertura || "",
          context: sermonJson.estrutura?.introducao?.contexto || "",
          hook: sermonJson.estrutura?.introducao?.gancho || "",
        },
        exposition: {
          historicalContext:
            sermonJson.estrutura?.exposicaoBiblica?.contextoHistorico || "",
          culturalContext:
            sermonJson.estrutura?.exposicaoBiblica?.contextoCultural || "",
          textAnalysis:
            sermonJson.estrutura?.exposicaoBiblica?.analiseTexto || "",
          supportVerses: Array.isArray(
            sermonJson.estrutura?.exposicaoBiblica?.versiculosApoio,
          )
            ? sermonJson.estrutura.exposicaoBiblica.versiculosApoio.join("\n")
            : sermonJson.estrutura?.exposicaoBiblica?.versiculosApoio || "",
        },
        mainPoints: Array.isArray(sermonJson.estrutura?.pontosPrincipais)
          ? sermonJson.estrutura.pontosPrincipais.filter(
              (point: string) =>
                point && typeof point === "string" && point.trim() !== "",
            )
          : [],
        application: {
          personal: sermonJson.estrutura?.aplicacaoPratica?.vidaPessoal || "",
          family: sermonJson.estrutura?.aplicacaoPratica?.familia || "",
          church: sermonJson.estrutura?.aplicacaoPratica?.igreja || "",
          society: sermonJson.estrutura?.aplicacaoPratica?.sociedade || "",
        },
        conclusion: {
          summary: sermonJson.estrutura?.conclusao?.resumo || "",
          callToAction: sermonJson.estrutura?.conclusao?.chamadaAcao || "",
          finalPrayer: sermonJson.estrutura?.conclusao?.oracaoFinal || "",
        },
        notes: {
          illustrations: sermonJson.estrutura?.anotacoes?.ilustracoes || "",
          statistics: sermonJson.estrutura?.anotacoes?.estatisticas || "",
          quotes: sermonJson.estrutura?.anotacoes?.citacoes || "",
          general: sermonJson.estrutura?.anotacoes?.observacoes || "",
        },
      };

      exportSermonToPDF(sermonData);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Erro ao exportar PDF do sermão");
    }
  };

  return (
    <>
      <Card className="transition-shadow hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-primary line-clamp-2 text-lg">
            {sermon.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div>
              <p className="text-foreground text-sm font-medium">Tema</p>
              <p className="text-muted-foreground text-sm">{sermon.theme}</p>
            </div>
            <div>
              <p className="text-foreground text-sm font-medium">
                Versículo Principal
              </p>
              <p className="text-muted-foreground text-sm">
                {sermon.main_verse}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailDialog(true)}
              className="flex-1"
            >
              <Eye className="size-4" />
              <span className="hidden sm:inline">Expandir</span>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href={`/edit-sermon/${sermon.id}`}>
                <FileEdit className="size-4" />
                <span className="hidden sm:inline">Editar</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="flex-1"
            >
              <Download className="size-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="flex-1"
            >
              <Trash2 className="size-4" />
              <span className="hidden sm:inline">Excluir</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir sermão</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              Tem certeza que deseja excluir o sermão &quot;{sermon.title}
              &quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 cursor-pointer text-white"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SermonDetailDialog
        sermon={sermon}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />
    </>
  );
}
