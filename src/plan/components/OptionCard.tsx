import React from 'react';

interface OptionCardProps {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
  helperText?: string;
  disabled?: boolean;
}

export const OptionCard: React.FC<OptionCardProps> = ({ label, value, selected, onSelect, helperText, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onSelect(value)}
    disabled={disabled}
    className={`w-full min-h-14 px-5 py-3.5 rounded-xl border-2 text-left font-sans text-base transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2F5D50] ${
      selected
        ? 'bg-[#2F5D50] text-white border-[#2F5D50] shadow-sm'
        : 'bg-white text-[#1C1B19] border-[#E4E1DA] hover:border-[#2F5D50]/40 hover:bg-[#2F5D50]/5'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    aria-pressed={selected}
  >
    <span className="font-medium">{label}</span>
    {helperText && (
      <span className={`block text-sm mt-1 leading-relaxed ${selected ? 'text-white/80' : 'text-[#5A5751]'}`}>
        {helperText}
      </span>
    )}
  </button>
);
