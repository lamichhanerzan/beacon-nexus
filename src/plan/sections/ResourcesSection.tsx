import React from 'react';
import { usePlanStore } from '../store';
import { SectionHeader } from '../components/SectionHeader';
import { GuidanceCard } from '../components/GuidanceCard';
import { RESOURCE_DIRECTORY } from '../content/resourcesContent';

export const ResourcesSection: React.FC = () => {
  const { profile } = usePlanStore();
  
  const filtered = RESOURCE_DIRECTORY.filter((r) => {
    if (r.forInsurance && profile.insuranceType && !r.forInsurance.includes(profile.insuranceType)) return false;
    if (r.forTransport && profile.transport && !r.forTransport.includes(profile.transport)) return false;
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <SectionHeader
        title="Resources"
        description="Real organizations that can help, filtered by your situation."
        answered={0}
        total={0}
      />

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((r, i) => (
          <GuidanceCard key={i} title={r.name} source={r.source} className={!r.verified ? 'border-dashed' : ''}>
            <p className="m-0">{r.whatItDoes}</p>
            <p className="m-0 text-sm"><strong>Who qualifies:</strong> {r.whoQualifies}</p>
            <p className="m-0 text-sm"><strong>How to start:</strong> {r.howToStart}</p>
            {!r.verified && <p className="m-0 text-xs italic text-[#A66A21]">This entry has not been independently verified for 2026.</p>}
          </GuidanceCard>
        ))}
      </div>
    </div>
  );
};
