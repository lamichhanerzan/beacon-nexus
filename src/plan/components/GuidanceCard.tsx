import React from 'react';

interface GuidanceCardProps {
  title?: string;
  children: React.ReactNode;
  source: string;
  className?: string;
}

export const GuidanceCard: React.FC<GuidanceCardProps> = ({ title, children, source, className = '' }) => {
  if (!source) return null;
  return (
    <div
      className={`bg-white border border-[#E4E1DA] rounded-xl p-5 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${className}`}
      style={{ animationFillMode: 'backwards' }}
    >
      {title && <h3 className="font-serif text-lg font-bold text-[#1C1B19] m-0" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{title}</h3>}
      <div className="text-sm text-[#1C1B19] leading-relaxed space-y-2">{children}</div>
      <div className="pt-2 border-t border-[#E4E1DA]/60">
        <span className="text-xs text-[#5A5751]/60 font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {source}
        </span>
      </div>
    </div>
  );
};
