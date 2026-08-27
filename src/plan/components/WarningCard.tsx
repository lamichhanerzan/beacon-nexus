import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WarningCardProps {
  headline: string;
  explanation: string;
  action: string;
  source: string;
  severity?: number;
}

export const WarningCard: React.FC<WarningCardProps> = ({ headline, explanation, action, source }) => (
  <div className="bg-white border border-[#E4E1DA] rounded-xl overflow-hidden flex">
    {/* Signature caution left rule */}
    <div className="w-1.5 bg-[#A66A21] shrink-0" />
    <div className="p-5 space-y-3 flex-1">
      <div className="flex items-start space-x-2">
        <AlertTriangle className="w-5 h-5 text-[#A66A21] shrink-0 mt-0.5" />
        <h4 className="font-serif text-base font-bold text-[#1C1B19] m-0 leading-snug" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          {headline}
        </h4>
      </div>
      <p className="text-sm text-[#1C1B19] leading-relaxed m-0">{explanation}</p>
      <div className="bg-[#A66A21]/8 border border-[#A66A21]/20 rounded-lg px-4 py-2.5">
        <p className="text-sm text-[#1C1B19] font-medium m-0 leading-relaxed">
          <span className="font-bold">Action:</span> {action}
        </p>
      </div>
      <span className="text-xs text-[#5A5751]/60 font-mono block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        {source}
      </span>
    </div>
  </div>
);
