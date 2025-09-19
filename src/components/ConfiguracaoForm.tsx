import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Save, RotateCcw, Download, Upload, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Template {
  id: string;
  name: string;
  conditions: { [key: string]: string };
  code: string;
  comment: string;
}

interface ConfigData {
  userSettings: {
    nome: string;
  };
  checklistSettings: {
    autoSave: boolean;
    showProgress: boolean;
    requireAllFields: boolean;
    enableKeyboardNav: boolean;
  };
  outputSettings: {
    codePrefix: string;
    codeFormat: string;
    defaultComment: string;
  };
  templates: Template[];
}

const DEFAULT_CONFIG: ConfigData = {
  userSettings: {
    nome: ''
  },
  checklistSettings: {
    autoSave: true,
    showProgress: true,
    requireAllFields: false,
    enableKeyboardNav: true
  },
  outputSettings: {
    codePrefix: 'CHK',
    codeFormat: '{prefix}_{status}_{timestamp}',
    defaultComment: 'Checklist concluído'
  },
  templates: [
    {
      id: '1',
      name: 'Hotline Aprovado',
      conditions: { fase: 'Hotline', card_aprovado: 'Sim', temos_hotline: 'Sim' },
      code: 'HTSPT1',
      comment: 'Enviar ciclo 1 de hotline'
    }
  ]
};

const AVAILABLE_FIELDS = [
  { id: 'fase', label: 'Fase' },
  { id: 'card_aprovado', label: 'Card foi aprovado pelo cliente?' },
  { id: 'nova_tentativa', label: 'É uma nova tentativa?' },
  { id: 'outro_card', label: 'Existe outro card desse concorrente em fluxo?' },
  { id: 'possui_etiqueta', label: 'Possui etiqueta especial?' },
  { id: 'qual_etiqueta', label: 'Qual etiqueta?' },
  { id: 'temos_hotline', label: 'Temos hotline?' },
  { id: 'site_remete_cliente', label: 'Site remete a algum cliente?' },
  { id: 'conferido_lista', label: 'Conferido na Lista de Clientes?' },
  { id: 'lideranca_liberou', label: 'Liderança liberou a tratativa?' },
  { id: 'concorrente_lista_nao_contato', label: 'Concorrente na lista de não contato?' },
  { id: 'agencias_parceiras', label: 'Concorrente na lista de Agências Parceiras?' },
  { id: 'possui_print', label: 'Possui print?' }
];

export function ConfiguracaoForm() {
  const [config, setConfig] = useState<ConfigData>(DEFAULT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    name: '',
    conditions: {},
    code: '',
    comment: ''
  });
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  // Carrega configurações salvas
  useEffect(() => {
    const saved = localStorage.getItem('checklist-config');
    const savedTemplates = localStorage.getItem('checklist-templates');
    
    let loadedConfig = DEFAULT_CONFIG;
    
    if (saved) {
      try {
        const parsedConfig = JSON.parse(saved);
        loadedConfig = { ...DEFAULT_CONFIG, ...parsedConfig };
      } catch (e) {
        console.error('Erro ao carregar configurações:', e);
      }
    }
    
    if (savedTemplates) {
      try {
        const parsedTemplates = JSON.parse(savedTemplates);
        loadedConfig.templates = parsedTemplates;
      } catch (e) {
        console.error('Erro ao carregar templates:', e);
      }
    }
    
    setConfig(loadedConfig);
  }, []);

  const saveConfig = () => {
    localStorage.setItem('checklist-config', JSON.stringify(config));
    localStorage.setItem('checklist-templates', JSON.stringify(config.templates));
    setHasChanges(false);
    toast.success('Configurações salvas');
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem('checklist-config');
    localStorage.removeItem('checklist-templates');
    setHasChanges(true);
    toast.success('Configurações resetadas');
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `checklist-config-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Configuração exportada');
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        setConfig({ ...DEFAULT_CONFIG, ...importedConfig });
        setHasChanges(true);
        toast.success('Configuração importada');
      } catch (error) {
        toast.error('Erro ao importar configuração');
      }
    };
    reader.readAsText(file);
  };

  const updateConfig = (section: keyof ConfigData, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const addTemplate = () => {
    if (!newTemplate.name || !newTemplate.code) {
      toast.error('Nome e código são obrigatórios');
      return;
    }

    const template: Template = {
      id: Date.now().toString(),
      name: newTemplate.name,
      conditions: newTemplate.conditions || {},
      code: newTemplate.code,
      comment: newTemplate.comment || ''
    };

    setConfig(prev => ({
      ...prev,
      templates: [...prev.templates, template]
    }));

    setNewTemplate({ name: '', conditions: {}, code: '', comment: '' });
    setShowTemplateForm(false);
    setHasChanges(true);
    toast.success('Template adicionado');
  };

  const updateTemplate = () => {
    if (!editingTemplate || !editingTemplate.name || !editingTemplate.code) {
      toast.error('Nome e código são obrigatórios');
      return;
    }

    setConfig(prev => ({
      ...prev,
      templates: prev.templates.map(t => 
        t.id === editingTemplate.id ? editingTemplate : t
      )
    }));

    setEditingTemplate(null);
    setHasChanges(true);
    toast.success('Template atualizado');
  };

  const removeTemplate = (id: string) => {
    setConfig(prev => ({
      ...prev,
      templates: prev.templates.filter(t => t.id !== id)
    }));
    setHasChanges(true);
    toast.success('Template removido');
  };

  const addConditionToTemplate = (template: Partial<Template>, field: string, value: string) => {
    const updatedConditions = { ...template.conditions, [field]: value };
    
    if (editingTemplate) {
      setEditingTemplate({ ...editingTemplate, conditions: updatedConditions });
    } else {
      setNewTemplate({ ...template, conditions: updatedConditions });
    }
  };

  const removeConditionFromTemplate = (template: Partial<Template>, field: string) => {
    const updatedConditions = { ...template.conditions };
    delete updatedConditions[field];
    
    if (editingTemplate) {
      setEditingTemplate({ ...editingTemplate, conditions: updatedConditions });
    } else {
      setNewTemplate({ ...template, conditions: updatedConditions });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Configurações</CardTitle>
            <div className="flex gap-2">
              {hasChanges && (
                <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  Alterações não salvas
                </span>
              )}
              <Button onClick={saveConfig} disabled={!hasChanges} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configurações do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={config.userSettings.nome}
              onChange={(e) => updateConfig('userSettings', 'nome', e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Templates de Códigos</CardTitle>
            <Button
              onClick={() => setShowTemplateForm(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de templates */}
          <div className="space-y-3">
            {config.templates.map((template) => (
              <div key={template.id} className="border rounded p-3 bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Código:</strong> {template.code}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Comentário:</strong> {template.comment || 'Nenhum'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Condições:</strong> {
                        Object.entries(template.conditions).length > 0 
                          ? Object.entries(template.conditions).map(([key, value]) => `${key}=${value}`).join(', ')
                          : 'Nenhuma'
                      }
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTemplate(template.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Formulário para novo template */}
          {(showTemplateForm || editingTemplate) && (
            <div className="border rounded p-4 bg-background">
              <h4 className="font-medium mb-4">
                {editingTemplate ? 'Editar Template' : 'Novo Template'}
              </h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Template</Label>
                    <Input
                      value={editingTemplate ? editingTemplate.name : newTemplate.name || ''}
                      onChange={(e) => {
                        if (editingTemplate) {
                          setEditingTemplate({ ...editingTemplate, name: e.target.value });
                        } else {
                          setNewTemplate({ ...newTemplate, name: e.target.value });
                        }
                      }}
                      placeholder="Ex: Hotline Aprovado"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Código</Label>
                    <Input
                      value={editingTemplate ? editingTemplate.code : newTemplate.code || ''}
                      onChange={(e) => {
                        if (editingTemplate) {
                          setEditingTemplate({ ...editingTemplate, code: e.target.value });
                        } else {
                          setNewTemplate({ ...newTemplate, code: e.target.value });
                        }
                      }}
                      placeholder="Ex: HTSPT1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Comentário</Label>
                  <Textarea
                    value={editingTemplate ? editingTemplate.comment : newTemplate.comment || ''}
                    onChange={(e) => {
                      if (editingTemplate) {
                        setEditingTemplate({ ...editingTemplate, comment: e.target.value });
                      } else {
                        setNewTemplate({ ...newTemplate, comment: e.target.value });
                      }
                    }}
                    placeholder="Ex: Enviar ciclo 1 de hotline"
                    className="min-h-[60px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Condições (quando usar este template)</Label>
                  <div className="space-y-2">
                    {AVAILABLE_FIELDS.map((field) => {
                      const currentTemplate = editingTemplate || newTemplate;
                      const hasCondition = currentTemplate.conditions && currentTemplate.conditions[field.id];
                      
                      return (
                        <div key={field.id} className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label className="text-sm">{field.label}</Label>
                          </div>
                          <div className="flex-1">
                            <Input
                              value={hasCondition ? currentTemplate.conditions![field.id] : ''}
                              onChange={(e) => {
                                if (e.target.value.trim()) {
                                  addConditionToTemplate(currentTemplate, field.id, e.target.value);
                                } else {
                                  removeConditionFromTemplate(currentTemplate, field.id);
                                }
                              }}
                              placeholder="Valor esperado"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={editingTemplate ? updateTemplate : addTemplate}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {editingTemplate ? 'Atualizar' : 'Adicionar'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingTemplate(null);
                      setShowTemplateForm(false);
                      setNewTemplate({ name: '', conditions: {}, code: '', comment: '' });
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações do Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Comportamento do Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Salvamento Automático</Label>
              <p className="text-sm text-muted-foreground">
                Salva automaticamente as respostas enquanto você preenche
              </p>
            </div>
            <Switch
              checked={config.checklistSettings.autoSave}
              onCheckedChange={(checked) => updateConfig('checklistSettings', 'autoSave', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Mostrar Progresso</Label>
              <p className="text-sm text-muted-foreground">
                Exibe barra de progresso e contador de campos preenchidos
              </p>
            </div>
            <Switch
              checked={config.checklistSettings.showProgress}
              onCheckedChange={(checked) => updateConfig('checklistSettings', 'showProgress', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Navegação por Teclado</Label>
              <p className="text-sm text-muted-foreground">
                Permite usar Enter para navegar entre campos
              </p>
            </div>
            <Switch
              checked={config.checklistSettings.enableKeyboardNav}
              onCheckedChange={(checked) => updateConfig('checklistSettings', 'enableKeyboardNav', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Backup e Restauração */}
      <Card>
        <CardHeader>
          <CardTitle>Backup e Restauração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={exportConfig} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar Configuração
            </Button>
            
            <div>
              <input
                type="file"
                accept=".json"
                onChange={importConfig}
                style={{ display: 'none' }}
                id="import-config"
              />
              <Button 
                onClick={() => document.getElementById('import-config')?.click()}
                variant="outline" 
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Importar Configuração
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-center">
            <Button
              variant="destructive"
              onClick={resetConfig}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar para Padrão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}