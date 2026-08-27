import React from 'react';
import { Check } from 'lucide-react';
import type { Stage } from '../../content/stages';

interface Props {
  stage: Stage;
  done: Record<number, boolean>;
  onToggle: (index: number) => void;
  onBack: () => void;
}

export const CaregiverPanel: React.FC<Props> = ({ stage, done, onToggle, onBack }) => {
  const cg = stage.caregiver;
  return (
    <div className="max-w-[1100px] mx-auto px-8 pt-12 pb-16 w-full">
      <div className="font-clinical text-[11px] uppercase tracking-[0.12em] text-ink-soft font-bold">
        Helper view &middot; {stage.label}
      </div>
      <h2 className="font-display text-[42px] leading-tight tracking-[-0.02em] mt-3 mb-0 max-w-[24ch] text-balance">
        What they need from you this week
      </h2>

      <div className="bg-signal-light border border-rule rounded-2xl p-6.5 mt-7">
        <div className="font-clinical text-[10px] uppercase tracking-[0.12em] text-signal font-bold">
          Where they are
        </div>
        <p className="text-xl leading-relaxed mt-3 mb-0 text-pretty">{cg.situation}</p>
      </div>

      <div className="grid grid-cols-[1.3fr_1fr] gap-6 mt-6 items-start">
        <div className="bg-paper border border-rule rounded-2xl p-6.5">
          <div className="font-clinical text-[10px] uppercase tracking-[0.12em] text-ink-soft font-bold">
            Useful things to do
          </div>
          <ul className="list-none p-0 m-0 mt-3.5">
            {cg.actions.map((a, i) => {
              const isDone = !!done[i];
              return (
                <li key={a} className="border-b border-rule/50 last:border-b-0">
                  <button
                    onClick={() => onToggle(i)}
                    className="w-full text-left flex items-start gap-3.5 py-3.5 cursor-pointer bg-transparent border-0"
                  >
                    <span
                      className={`w-[22px] h-[22px] rounded-md shrink-0 border-2 flex items-center justify-center ${
                        isDone ? 'bg-signal border-signal' : 'bg-transparent border-rule'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 text-paper" />}
                    </span>
                    <span
                      className={`text-[17px] leading-relaxed ${isDone ? 'line-through opacity-55' : ''}`}
                    >
                      {a}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="bg-manila border-2 border-manila-deep rounded-2xl p-5.5">
            <div className="font-clinical text-[10px] uppercase tracking-[0.12em] text-ink-soft font-bold">
              In the room
            </div>
            <p className="text-base leading-relaxed mt-2.5 mb-0">{cg.atAppointment}</p>
          </div>

          <div className="bg-flag-bg border border-rule border-l-4 border-l-flag rounded-xl p-5.5 mt-5">
            <div className="font-clinical text-[10px] uppercase tracking-[0.12em] text-flag font-bold">
              Stop doing this
            </div>
            <p className="text-base leading-relaxed mt-2.5 mb-0">{cg.stopDoing}</p>
          </div>

          <button
            onClick={onBack}
            className="w-full mt-5 py-3.5 rounded-[10px] bg-paper border border-rule text-[15px] font-semibold cursor-pointer text-ink hover:bg-manila/40 transition-colors"
          >
            &larr; Back to the stage detail
          </button>
        </div>
      </div>
    </div>
  );
};
