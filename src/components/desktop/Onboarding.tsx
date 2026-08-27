import React from 'react';
import { STAGES } from '../../content/stages';
import { rangeLabel, pad2 } from '../../lib/stageTiming';

interface Props {
  stageId: string;
  onSelectStage: (id: string) => void;
  date: string;
  onDateChange: (d: string) => void;
  onContinue: () => void;
}

export const Onboarding: React.FC<Props> = ({
  stageId, onSelectStage, date, onDateChange, onContinue,
}) => (
  <div className="max-w-[1000px] mx-auto px-8 py-14 w-full">
    <div className="font-clinical text-[11px] uppercase tracking-[0.12em] text-ink-soft font-bold">
      Step 1 of 2 &middot; nothing is saved or sent
    </div>
    <h2 className="font-display text-[42px] leading-tight tracking-[-0.02em] mt-3.5 mb-0">
      Where are you right now?
    </h2>
    <p className="text-lg text-ink-soft mt-3 mb-0 max-w-[60ch]">
      Pick the last thing that happened. You can change this at any time, and you can be wrong
      &mdash; it only decides what we show first.
    </p>

    <div className="grid grid-cols-3 gap-3.5 mt-8">
      {STAGES.map((s) => {
        const selected = s.id === stageId;
        return (
          <button
            key={s.id}
            onClick={() => onSelectStage(s.id)}
            className={`text-left p-4.5 rounded-xl border-2 cursor-pointer transition-colors ${
              selected ? 'bg-signal-light border-signal' : 'bg-paper border-rule hover:border-manila-deep'
            }`}
          >
            <span
              className={`block font-clinical text-[11px] font-bold ${selected ? 'text-signal' : 'text-ink-soft'}`}
            >
              Stage {pad2(s.order)}
            </span>
            <span className="block text-[17px] font-bold mt-2.5 leading-snug text-ink">{s.label}</span>
            <span className="block text-[13px] mt-2 leading-relaxed text-ink-soft">{rangeLabel(s)}</span>
          </button>
        );
      })}
    </div>

    <div className="mt-8 p-6 border border-rule rounded-xl bg-paper">
      <div className="text-[17px] font-bold">When did that happen?</div>
      <div className="text-sm text-ink-soft mt-1.5">
        Optional. A date lets us count the days and tell you when a wait has gone longer than
        published benchmarks.
      </div>
      <div className="flex items-center gap-4 mt-4">
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="px-3.5 py-3 font-clinical text-[15px] border border-rule rounded-[9px] bg-paper text-ink"
        />
        <button
          onClick={onContinue}
          className="ml-auto px-7 py-4 rounded-xl bg-signal text-paper text-[17px] font-bold cursor-pointer hover:bg-signal/90 transition-colors"
        >
          Show me what's happening &rarr;
        </button>
      </div>
    </div>
  </div>
);
