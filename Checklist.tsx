import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Trash2, Plus, RotateCcw } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistProps {
  title?: string;
  initialItems?: ChecklistItem[];
}

export function Checklist({ title = "Meu Checklist", initialItems = [] }: ChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('checklist-items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialItems;
      }
    }
    return initialItems.length > 0 ? initialItems : [
      { id: '1', text: 'Exemplo de tarefa 1', completed: false },
      { id: '2', text: 'Exemplo de tarefa 2', completed: false },
      { id: '3', text: 'Exemplo de tarefa 3', completed: true },
    ];
  });
  
  const [newItemText, setNewItemText] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const checkboxRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Salvar no localStorage sempre que items mudarem
  useEffect(() => {
    localStorage.setItem('checklist-items', JSON.stringify(items));
  }, [items]);

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const addItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newItemText.trim(),
        completed: false
      };
      setItems([...items, newItem]);
      setNewItemText('');
      inputRef.current?.focus();
    }
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const resetAll = () => {
    setItems(items.map(item => ({ ...item, completed: false })));
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(index + 1, items.length - 1);
      setFocusedIndex(nextIndex);
      checkboxRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(index - 1, 0);
      setFocusedIndex(prevIndex);
      checkboxRefs.current[prevIndex]?.focus();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">
              {completedCount}/{totalCount}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAll}
              className="h-6 w-6 p-0"
              title="Resetar todos (Alt+R)"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-1" />
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Lista de itens */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded hover:bg-accent group transition-colors"
            >
              <Checkbox
                ref={(el) => (checkboxRefs.current[index] = el)}
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="flex-shrink-0"
              />
              <span
                className={`flex-1 text-sm ${
                  item.completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {item.text}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remover item (Delete)"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Adicionar novo item */}
        <div className="flex gap-2 pt-2 border-t">
          <Input
            ref={inputRef}
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Nova tarefa..."
            className="flex-1"
          />
          <Button
            onClick={addItem}
            disabled={!newItemText.trim()}
            size="sm"
            title="Adicionar (Enter)"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Instruções de teclado */}
        <div className="text-xs text-muted-foreground pt-2 border-t space-y-1">
          <div>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Tab</kbd> navegar</div>
          <div>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd> marcar/desmarcar</div>
          <div>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">↑↓</kbd> mover entre itens</div>
          <div>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> adicionar tarefa</div>
        </div>
      </CardContent>
    </Card>
  );
}