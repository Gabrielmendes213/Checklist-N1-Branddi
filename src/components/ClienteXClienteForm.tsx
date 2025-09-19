import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Copy, RotateCcw, Link } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface ClienteTratativa {
  clienteSolicitante: string;
  exClienteNegativar: string;
  plataforma: string;
  printBoaFe: string;
  marcaExcluir: string;
  detalhamento: string;
  codigoForm: string;
}

export function ClienteXClienteForm() {
  const [tratativa, setTratativa] = useState<ClienteTratativa>({
    clienteSolicitante: "",
    exClienteNegativar: "",
    plataforma: "",
    printBoaFe: "Não fornecido",
    marcaExcluir: "",
    detalhamento: "",
    codigoForm: "",
  });

  // Carrega dados salvos
  useEffect(() => {
    const saved = localStorage.getItem(
      "cliente-x-cliente-data",
    );
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setTratativa(parsedData);
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      }
    }
  }, []);

  // Salva dados automaticamente
  useEffect(() => {
    localStorage.setItem(
      "cliente-x-cliente-data",
      JSON.stringify(tratativa),
    );
  }, [tratativa]);

  const updateField = (
    field: keyof ClienteTratativa,
    value: string,
  ) => {
    setTratativa((prev) => ({ ...prev, [field]: value }));
  };

  const generateFormattedText = () => {
    return `Tratativa Cliente x Cliente

Cliente que solicita a negativação: ${tratativa.clienteSolicitante || "[A]"}
Ex-Cliente que precisa negativar: ${tratativa.exClienteNegativar || "[B]"}
Plataforma: ${tratativa.plataforma || "[plataforma de ocorrência]"}
Print de Boa fé: ${tratativa.printBoaFe}

Descrição da solicitação
Solicitar ao ex-cliente ${tratativa.exClienteNegativar || "[B]"} que negative os termos do cliente ${tratativa.clienteSolicitante || "[A]"}
E tambem, realize a Exclusão da marca ${tratativa.marcaExcluir || "[C]"} das campanhas ativas na plataforma mencionada.

Detalhamento:
${tratativa.detalhamento || "[Aguardando detalhamento]"}

Código do form: ${tratativa.codigoForm || "[Código não informado]"}`;
  };

  const generateCommentWithLink = () => {
    const baseText = generateFormattedText();
    const linkCard = tratativa.codigoForm
      ? `https://app.pipefy.com/open-cards/${tratativa.codigoForm}`
      : "https://app.pipefy.com/open-cards/[CÓDIGO]";

    return `${baseText}

Link do card: ${linkCard}`;
  };

  const copyFormattedText = async () => {
    const text = generateFormattedText();
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Texto formatado copiado!");
    } catch (err) {
      toast.error("Erro ao copiar texto");
    }
  };

  const copyCommentWithLink = async () => {
    const comment = generateCommentWithLink();
    try {
      await navigator.clipboard.writeText(comment);
      toast.success("Comentário com link copiado!");
    } catch (err) {
      toast.error("Erro ao copiar comentário");
    }
  };

  const clearAll = () => {
    setTratativa({
      clienteSolicitante: "",
      exClienteNegativar: "",
      plataforma: "",
      printBoaFe: "Não fornecido",
      marcaExcluir: "",
      detalhamento: "",
      codigoForm: "",
    });
    localStorage.removeItem("cliente-x-cliente-data");
    toast.success("Todos os dados foram limpos");
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    nextField?: string,
  ) => {
    if (e.key === "Enter" && nextField) {
      e.preventDefault();
      const nextElement = document.getElementById(nextField);
      nextElement?.focus();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Tratativa Cliente X Cliente</CardTitle>
        </CardHeader>
      </Card>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Tratativa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clienteSolicitante">
                Cliente que solicita a negativação (A) *
              </Label>
              <Input
                id="clienteSolicitante"
                value={tratativa.clienteSolicitante}
                onChange={(e) =>
                  updateField(
                    "clienteSolicitante",
                    e.target.value,
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, "exClienteNegativar")
                }
                placeholder="Nome do cliente solicitante"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exClienteNegativar">
                Ex-Cliente que precisa negativar (B) *
              </Label>
              <Input
                id="exClienteNegativar"
                value={tratativa.exClienteNegativar}
                onChange={(e) =>
                  updateField(
                    "exClienteNegativar",
                    e.target.value,
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, "plataforma")
                }
                placeholder="Nome do ex-cliente"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plataforma">Plataforma</Label>
              <Input
                id="plataforma"
                value={tratativa.plataforma}
                onChange={(e) =>
                  updateField("plataforma", e.target.value)
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, "printBoaFe")
                }
                placeholder="Plataforma de ocorrência"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="printBoaFe">
                Print de Boa fé
              </Label>
              <Select
                value={tratativa.printBoaFe}
                onValueChange={(value) =>
                  updateField("printBoaFe", value)
                }
              >
                <SelectTrigger id="printBoaFe">
                  <SelectValue placeholder="Status do print" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Anexado">
                    Anexado
                  </SelectItem>
                  <SelectItem value="Não fornecido">
                    Não fornecido
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="marcaExcluir">
              Marca para exclusão (C)
            </Label>
            <Input
              id="marcaExcluir"
              value={tratativa.marcaExcluir}
              onChange={(e) =>
                updateField("marcaExcluir", e.target.value)
              }
              onKeyDown={(e) =>
                handleKeyDown(e, "detalhamento")
              }
              placeholder="Nome da marca a ser excluída das campanhas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="detalhamento">Detalhamento</Label>
            <Textarea
              id="detalhamento"
              value={tratativa.detalhamento}
              onChange={(e) =>
                updateField("detalhamento", e.target.value)
              }
              placeholder="Descreva detalhes adicionais da tratativa..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigoForm">Código do form</Label>
            <Input
              id="codigoForm"
              value={tratativa.codigoForm}
              onChange={(e) =>
                updateField("codigoForm", e.target.value)
              }
              placeholder="Código do formulário/card"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview do texto formatado */}
      <Card>
        <CardHeader>
          <CardTitle>Preview do Texto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Texto formatado</Label>
            <Textarea
              value={generateFormattedText()}
              readOnly
              className="min-h-[200px] font-mono text-sm bg-muted"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={copyFormattedText}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar Texto
            </Button>

            <Button
              onClick={copyCommentWithLink}
              variant="outline"
              className="gap-2"
            >
              <Link className="h-4 w-4" />
              Copiar Comentário + Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-center">
        <Button
          variant="destructive"
          onClick={clearAll}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Apagar Tudo
        </Button>
      </div>
    </div>
  );
}