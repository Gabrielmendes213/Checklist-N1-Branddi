import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Check, ChevronDown } from 'lucide-react';

interface EditableSelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
}

export const EditableSelect = forwardRef<HTMLInputElement, EditableSelectProps>(({ 
  value, 
  options, 
  onChange, 
  onKeyDown, 
  placeholder = "Digite ou selecione...",
  className = ""
}, forwardedRef) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Combina as refs
  const combinedRef = (el: HTMLInputElement) => {
    inputRef.current = el;
    if (typeof forwardedRef === 'function') {
      forwardedRef(el);
    } else if (forwardedRef) {
      forwardedRef.current = el;
    }
  };

  // Atualiza o input quando o value externo muda
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Fecha dropdown quando clica fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Se o valor digitado não está nas opções, mantém o que foi digitado
        if (inputValue && !options.includes(inputValue)) {
          onChange(inputValue);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue, options, onChange]);

  // Filtra opções baseado no que foi digitado
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    
    // Se encontrou uma correspondência exata, seleciona automaticamente
    const exactMatch = options.find(option => 
      option.toLowerCase() === newValue.toLowerCase()
    );
    if (exactMatch) {
      onChange(exactMatch);
    } else {
      // Permite valores customizados
      onChange(newValue);
    }
  };

  const handleOptionSelect = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && filteredOptions.length > 0) {
        handleOptionSelect(filteredOptions[0]);
      } else {
        setIsOpen(false);
        // Chama o onKeyDown externo para navegação
        if (onKeyDown) {
          onKeyDown(e);
        }
      }
    } else if (onKeyDown && !isOpen) {
      onKeyDown(e);
    }
  };

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      inputRef.current?.focus();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex">
        <Input
          ref={combinedRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="flex-1 pr-8"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3"
          onClick={handleToggleDropdown}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-40 overflow-auto bg-background border border-border rounded-md shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-muted flex items-center justify-between text-sm"
                onClick={() => handleOptionSelect(option)}
              >
                {option}
                {value === option && <Check className="h-4 w-4" />}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Nenhuma opção encontrada
            </div>
          )}
        </div>
      )}
    </div>
  );
});

EditableSelect.displayName = 'EditableSelect';