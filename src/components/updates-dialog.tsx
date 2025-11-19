"use client";

import {
  CheckCircle2,
  Eye,
  History,
  Menu,
  Settings,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const VERSION_STORAGE_KEY = "sermonario-last-seen-version";

// Defina suas atualizações aqui
const UPDATES = [
  {
    version: "1.2.0",
    date: "2025-11-20",
    features: [
      {
        type: "new",
        title: "Histórico de Sermões",
        description:
          "Agora você pode visualizar e editar todos os seus sermões anteriores em um só lugar.",
        icon: <History className="h-5 w-5" />,
      },
      {
        type: "improvement",
        title: "Menu interativo",
        description:
          "O menu lateral agora é interativo e você pode acessar todas as funcionalidades do sistema de forma mais fácil e intuitiva.",
        icon: <Menu className="h-5 w-5" />,
      },
      {
        type: "improvement",
        title: "Melhoria na interface",
        description:
          "A interface foi melhorada e agora é mais intuitiva e fácil de usar, com um design mais moderno e responsivo.",
        icon: <Settings className="h-5 w-5" />,
      },
      {
        type: "improvement",
        title: "Prévia de Sermões",
        description:
          "Agora você pode visualizar a prévia de seus sermões com um design mais moderno e responsivo.",
        icon: <Eye className="h-5 w-5" />,
      },
    ],
  },
];

interface UpdatesDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UpdatesDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: UpdatesDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled
    ? controlledOnOpenChange || (() => {})
    : setInternalOpen;

  // Função para verificar se há atualizações não vistas no localStorage
  const checkHasUnseenUpdates = () => {
    const lastSeenVersion = localStorage.getItem(VERSION_STORAGE_KEY);
    const latestUpdate = UPDATES[0];
    return !lastSeenVersion || lastSeenVersion !== latestUpdate.version;
  };

  useEffect(() => {
    if (!isControlled) {
      if (checkHasUnseenUpdates()) {
        const timer = setTimeout(() => {
          setInternalOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isControlled]);

  const handleClose = () => {
    setOpen(false);
    const latestUpdate = UPDATES[0];
    localStorage.setItem(VERSION_STORAGE_KEY, latestUpdate.version);
  };

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case "new":
        return "bg-green-100 text-green-800 border-green-200";
      case "improvement":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "fix":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUpdateTypeLabel = (type: string) => {
    switch (type) {
      case "new":
        return "Novo";
      case "improvement":
        return "Melhoria";
      case "fix":
        return "Correção";
      default:
        return "Atualização";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="mx-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto">
          <DialogHeader>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-2">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  Novidades no Sermonário!
                </DialogTitle>
                <DialogDescription className="mt-1 text-base">
                  Confira as novas funcionalidades e melhorias
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {UPDATES.map((update) => (
              <div
                key={update.version}
                className="space-y-4 border-l-4 border-blue-500 pl-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Versão {update.version}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(update.date).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {update.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-blue-600">
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">
                              {feature.title}
                            </h4>
                            <Badge
                              className={`text-xs ${getUpdateTypeColor(
                                feature.type,
                              )}`}
                            >
                              {getUpdateTypeLabel(feature.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Entendi, obrigado!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Hook para verificar se há atualizações não vistas
export function useHasUnseenUpdates() {
  const [hasUnseen, setHasUnseen] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem(VERSION_STORAGE_KEY);
    const latestUpdate = UPDATES[0];
    setHasUnseen(!lastSeenVersion || lastSeenVersion !== latestUpdate.version);
  }, []);

  return hasUnseen;
}
