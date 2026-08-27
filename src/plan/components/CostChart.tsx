import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import type { CostProjection } from '../types';

interface CostChartProps {
  projection: CostProjection;
}

const MONO = { fontFamily: 'JetBrains Mono, monospace' };
const SERIF = { fontFamily: 'Fraunces, Georgia, serif' };

export const CostChart: React.FC<CostChartProps> = ({ projection }) => {
  const { ceiling, ceilingIsUncapped, alreadyPaidLow, remainingExposureLow } = projection;

  // Medigap/Medicaid land here with a near-zero ceiling — spec says skip the math,
  // the driver card already explains why, so no bar is drawn.
  if (!ceilingIsUncapped && (ceiling === null || ceiling <= 0)) return null;

  if (ceilingIsUncapped) {
    // No ceiling exists, so there is nothing to scale a real bar against — the
    // paid-so-far segment is real, the rest is drawn open-ended with no number.
    const referenceScale = 10600; // visual anchor only, never shown to the user
    const paidPct = Math.min(60, Math.max(8, Math.round((alreadyPaidLow / referenceScale) * 100)));
    return (
      <div className="bg-white border border-[#E4E1DA] rounded-xl p-5 space-y-4">
        <div>
          <span className="text-xs text-[#5A5751]/60 font-mono block" style={MONO}>Already paid</span>
          <span className="font-mono text-lg font-bold text-[#1C1B19]" style={{ ...MONO, fontVariantNumeric: 'tabular-nums' }}>
            ${alreadyPaidLow.toLocaleString()}
          </span>
        </div>

        <div
          className="h-12 rounded-l-lg overflow-hidden flex"
          role="img"
          aria-label={`Already paid $${alreadyPaidLow.toLocaleString()}. No annual out-of-pocket limit after that — costs can continue with no ceiling.`}
        >
          <div className="bg-[#2F5D50] shrink-0" style={{ width: `${paidPct}%` }} />
          <div
            className="flex-1 border-r-2 border-dashed border-[#A66A21]/60"
            style={{
              backgroundImage: 'repeating-linear-gradient(135deg, rgba(166,106,33,0.10), rgba(166,106,33,0.10) 6px, transparent 6px, transparent 12px)',
            }}
          />
        </div>

        <p className="text-xs text-[#5A5751] m-0 leading-relaxed">No annual limit past this point — costs can keep going.</p>
        <p className="text-xs text-[#5A5751]/60 font-mono m-0" style={MONO}>2026 plan year</p>
      </div>
    );
  }

  if (ceiling === null) return null; // unreachable given the guards above; narrows the type below

  const data = [{ name: 'exposure', paid: alreadyPaidLow, remaining: remainingExposureLow }];

  return (
    <div className="bg-white border border-[#E4E1DA] rounded-xl p-5 space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-xs text-[#5A5751]/60 font-mono block" style={MONO}>Annual ceiling</span>
          <span className="font-serif text-4xl font-bold text-[#1C1B19]" style={{ ...SERIF, fontVariantNumeric: 'tabular-nums' }}>
            ${ceiling.toLocaleString()}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-[#5A5751]/60 font-mono block" style={MONO}>Already paid</span>
          <span className="font-mono text-lg font-bold text-[#1C1B19]" style={{ ...MONO, fontVariantNumeric: 'tabular-nums' }}>
            ${alreadyPaidLow.toLocaleString()}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={48}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <XAxis type="number" domain={[0, ceiling]} hide />
          <YAxis type="category" dataKey="name" hide />
          <Bar dataKey="paid" stackId="a" radius={[8, 0, 0, 8]} fill="#2F5D50" name="Already paid" />
          <Bar dataKey="remaining" stackId="a" radius={[0, 8, 8, 0]} fill="#A66A21" name="Remaining exposure" />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center space-x-6 text-xs text-[#5A5751]">
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#2F5D50]" />
          <span>Paid so far</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#A66A21]" />
          <span>Remaining exposure</span>
        </div>
      </div>

      <p className="text-xs text-[#5A5751]/60 font-mono m-0" style={MONO}>2026 plan year • Your plan may set a lower maximum</p>
    </div>
  );
};
