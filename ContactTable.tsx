import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Copy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ContactRow {
  columns: string[];
  shouldIgnore: boolean;
  name: string;
  email: string;
}

interface ContactTableProps {
  rawData: string;
  onDataChange: (data: string) => void;
  onContactsExtracted: (contacts: {name: string, email: string}[]) => void;
}

export function ContactTable({ rawData, onDataChange, onContactsExtracted }: ContactTableProps) {
  const [parsedData, setParsedData] = useState<ContactRow[]>([]);

  useEffect(() => {
    parseRawData(rawData);
  }, [rawData]);

  const parseRawData = (data: string) => {
    if (!data.trim()) {
      setParsedData([]);
      onContactsExtracted([]);
      return;
    }

    const lines = data.split('\n').filter(line => line.trim());
    const rows: ContactRow[] = [];
    const validContacts: {name: string, email: string}[] = [];

    for (const line of lines) {
      // Divide a linha em colunas (tab ou múltiplos espaços)
      const columns = line.split(/\t|\s{2,}/).map(col => col.trim());
      
      // Preenche até 8 colunas se necessário
      while (columns.length < 8) {
        columns.push('');
      }

      const shouldIgnore = columns[7]?.toLowerCase() === 'sim';
      const name = columns[2] || '';
      const email = columns[3] || '';

      const row: ContactRow = {
        columns,
        shouldIgnore,
        name,
        email
      };

      rows.push(row);

      // Adiciona aos contatos válidos se não deve ignorar e tem email válido
      if (!shouldIgnore && name && email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (emailRegex.test(email)) {
          validContacts.push({ name, email });
        }
      }
    }

    setParsedData(rows);
    onContactsExtracted(validContacts);
  };

  const copyValidEmails = async () => {
    const validContacts = parsedData
      .filter(row => !row.shouldIgnore && row.email)
      .map(row => row.email);
    
    const emailString = validContacts.join('; ');
    
    try {
      await navigator.clipboard.writeText(emailString);
      toast.success(`${validContacts.length} emails copiados!`);
    } catch (err) {
      toast.error('Erro ao copiar emails');
    }
  };

  const copyValidContacts = async () => {
    const validContacts = parsedData
      .filter(row => !row.shouldIgnore && row.email && row.name)
      .map(row => `${row.name} - ${row.email}`);
    
    const contactString = validContacts.join('\n');
    
    try {
      await navigator.clipboard.writeText(contactString);
      toast.success(`${validContacts.length} contatos copiados!`);
    } catch (err) {
      toast.error('Erro ao copiar contatos');
    }
  };

  const clearData = () => {
    onDataChange('');
    setParsedData([]);
    onContactsExtracted([]);
    toast.success('Dados limpos');
  };

  const validCount = parsedData.filter(row => !row.shouldIgnore && row.email).length;
  const ignoredCount = parsedData.filter(row => row.shouldIgnore).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Extração de Contatos</CardTitle>
          <div className="flex gap-2">
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
              ✓ {validCount} válidos
            </span>
            <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
              ⚠ {ignoredCount} ignorados
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Dados brutos (formato: 8 colunas)</Label>
          <Textarea
            value={rawData}
            onChange={(e) => onDataChange(e.target.value)}
            placeholder="Cole aqui os dados em formato tabular (8 colunas separadas por tab ou espaços)..."
            className="min-h-[100px] font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>Formato esperado:</strong></p>
            <p>• <strong>Coluna 3:</strong> Nome do contato</p>
            <p>• <strong>Coluna 4:</strong> Email do contato</p>
            <p>• <strong>Coluna 8:</strong> "Sim" para ignorar linha, qualquer outro valor para processar</p>
          </div>
        </div>

        {parsedData.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tabela processada</Label>
              <div className="max-h-64 overflow-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Col 1</th>
                      <th className="p-2 text-left">Col 2</th>
                      <th className="p-2 text-left">Nome (Col 3)</th>
                      <th className="p-2 text-left">Email (Col 4)</th>
                      <th className="p-2 text-left">Col 5</th>
                      <th className="p-2 text-left">Col 6</th>
                      <th className="p-2 text-left">Col 7</th>
                      <th className="p-2 text-left">Ignorar (Col 8)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row, index) => (
                      <tr 
                        key={index} 
                        className={`border-b ${row.shouldIgnore ? 'bg-red-50 text-red-700' : 
                          (row.name && row.email ? 'bg-green-50' : 'bg-yellow-50')}`}
                      >
                        <td className="p-2">
                          {row.shouldIgnore ? '❌' : (row.name && row.email ? '✅' : '⚠️')}
                        </td>
                        {row.columns.map((col, colIndex) => (
                          <td key={colIndex} className="p-2 max-w-32 truncate" title={col}>
                            {col}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={copyValidEmails} disabled={validCount === 0} className="gap-2">
                <Copy className="h-4 w-4" />
                Copiar Emails ({validCount})
              </Button>
              <Button onClick={copyValidContacts} disabled={validCount === 0} variant="outline" className="gap-2">
                <Copy className="h-4 w-4" />
                Copiar Contatos ({validCount})
              </Button>
              <Button onClick={clearData} variant="destructive" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}