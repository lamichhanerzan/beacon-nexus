import React from 'react';
import { ArrowRight } from 'lucide-react';

interface InlinePromptProps {
  message: string;
  onAction?: () => void;
  actionLabel?: string;
}

export const InlinePrompt: React.FC<InlinePromptProps> = ({ message, onAction, actionLabel }) => (
  <div className="bg-[#FAF9F6] border border-dashed border-[#E4E1DA] rounded-xl px-5 py-4 flex items-center justify-between gap-4">
    <p className="text-sm text-[#5A5751] m-0 leading-relaxed italic">{message}</p>
    {onAction && actionLabel && (
      <button
        onClick={onAction}
        className="shrink-0 inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg font-sans text-sm font-semibold text-[#2F5D50] bg-[#2F5D50]/10 hover:bg-[#2F5D50]/20 transition-colors cursor-pointer"
      >
        <span>{actionLabel}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);
