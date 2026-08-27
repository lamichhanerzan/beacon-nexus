import React from 'react';
import { Check } from 'lucide-react';

interface ChipOption {
  label: string;
  value: string;
}

interface ChipMultiProps {
  options: ChipOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
  columns?: 1 | 2 | 3;
}

export const ChipMulti: React.FC<ChipMultiProps> = ({ options, selected, onChange, max, columns = 2 }) => {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      if (max && selected.length >= max) return;
      onChange([...selected, value]);
    }
  };

  const gridClass = columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1';

  return (
    <div className={`grid ${gridClass} gap-3`}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        const atMax = !!(max && selected.length >= max && !isSelected);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => !atMax && toggle(opt.value)}
            className={`min-h-12 px-4 py-3 rounded-xl border-2 font-sans text-sm font-medium text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2F5D50] flex items-center space-x-2.5 ${
              isSelected
                ? 'bg-[#2F5D50] text-white border-[#2F5D50]'
                : atMax
                ? 'bg-white text-[#5A5751]/50 border-[#E4E1DA] cursor-not-allowed'
                : 'bg-white text-[#1C1B19] border-[#E4E1DA] hover:border-[#2F5D50]/40'
            }`}
            aria-pressed={isSelected}
          >
            {isSelected && <Check className="w-4 h-4 shrink-0" />}
            <span>{opt.label}</span>
          </button>
        );
      })}
      {max && (
        <p className="text-sm text-[#5A5751]/70 col-span-full mt-1">Select up to {max}</p>
      )}
    </div>
  );
};
