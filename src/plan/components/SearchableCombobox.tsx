import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';

interface ComboboxOption {
  label: string;
  value: string;
}

interface SearchableComboboxProps {
  options: ComboboxOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({ options, value, onChange, placeholder = 'Search...' }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const selectedLabel = options.find((o) => o.value === value)?.label;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-center border-2 rounded-xl px-4 py-3 bg-white transition-colors ${
          isOpen ? 'border-[#2F5D50]' : 'border-[#E4E1DA]'
        }`}
      >
        <Search className="w-4 h-4 text-[#5A5751] shrink-0 mr-2" />
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? query : selectedLabel || ''}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => { setIsOpen(true); setQuery(''); }}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none font-sans text-base text-[#1C1B19] placeholder:text-[#5A5751]/50"
        />
        {value && (
          <button
            onClick={() => { onChange(''); setQuery(''); }}
            className="p-1 text-[#5A5751] hover:text-[#1C1B19] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-20 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border-2 border-[#E4E1DA] rounded-xl shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[#5A5751] italic">No matches</div>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); setQuery(''); }}
                className={`w-full text-left px-4 py-3 font-sans text-sm transition-colors cursor-pointer flex items-center justify-between ${
                  value === opt.value
                    ? 'bg-[#2F5D50]/10 text-[#2F5D50] font-semibold'
                    : 'text-[#1C1B19] hover:bg-[#FAF9F6]'
                }`}
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check className="w-4 h-4" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
