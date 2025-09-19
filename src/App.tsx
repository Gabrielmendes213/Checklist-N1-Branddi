import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { ChecklistForm } from './components/ChecklistForm';
import { ClienteXClienteForm } from './components/ClienteXClienteForm';
import { ConfiguracaoForm } from './components/ConfiguracaoForm';
import { CheckSquare, Users, Settings, FileText, Keyboard } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState('checklist');

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Sistema de Checklist</h1>
              <p className="text-sm text-muted-foreground">
                Verificação completa de aprovações e validações
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="checklist" className="gap-2">
              <FileText className="h-4 w-4" />
              Checklist Principal
            </TabsTrigger>
            <TabsTrigger value="cliente-x-cliente" className="gap-2">
              <Users className="h-4 w-4" />
              Cliente X Cliente
            </TabsTrigger>
            <TabsTrigger value="configuracao" className="gap-2">
              <Settings className="h-4 w-4" />
              Configuração
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checklist" className="space-y-6">
            <ChecklistForm />
          </TabsContent>

          <TabsContent value="cliente-x-cliente" className="space-y-6">
            <ClienteXClienteForm />
          </TabsContent>

          <TabsContent value="configuracao" className="space-y-6">
            <ConfiguracaoForm />
          </TabsContent>
        </Tabs>

        {/* Instruções de teclado (fixo no canto) */}
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="w-64 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Atalhos de Teclado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Navegar:</span>
                <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd>
              </div>
              <div className="flex justify-between">
                <span>Buscar campo:</span>
                <kbd className="px-1 py-0.5 bg-muted rounded">Tab</kbd>
              </div>
              <div className="flex justify-between">
                <span>Selecionar:</span>
                <kbd className="px-1 py-0.5 bg-muted rounded">Space</kbd>
              </div>
              <div className="flex justify-between">
                <span>Copiar:</span>
                <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+C</kbd>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-8 py-4 text-center text-sm text-muted-foreground">
        <p>Sistema de Checklist - Navegação otimizada por teclado ⌨️</p>
      </footer>
    </div>
  );
}