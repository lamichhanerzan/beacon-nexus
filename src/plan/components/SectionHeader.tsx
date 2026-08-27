import React from 'react';

interface SectionHeaderProps {
  title: string;
  description: string;
  answered: number;
  total: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, answered, total }) => (
  <div className="pb-6 border-b border-[#E4E1DA] mb-8">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#1C1B19] m-0 leading-tight" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          {title}
        </h1>
        <p className="text-base text-[#5A5751] mt-2 m-0 leading-relaxed">{description}</p>
      </div>
      {total > 0 && (
        <span className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold font-sans whitespace-nowrap ${
          answered === total
            ? 'bg-[#2F5D50]/10 text-[#2F5D50]'
            : 'bg-[#E4E1DA]/50 text-[#5A5751]'
        }`}>
          {answered} of {total}
        </span>
      )}
    </div>
  </div>
);
