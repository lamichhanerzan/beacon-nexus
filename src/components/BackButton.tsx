import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label = 'Go Back' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-base font-bold text-ink bg-paper border border-rule hover:border-signal hover:text-signal shadow-xs hover:shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal group"
    >
      <ArrowLeft className="w-5 h-5 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
      <span>{label}</span>
    </button>
  );
};
