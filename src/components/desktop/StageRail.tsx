import React from 'react';
import type { Stage } from '../../content/stages';
import { rangeLabel, pad2 } from '../../lib/stageTiming';

interface Props {
  stages: Stage[];
  currentStageId: string;
  onSelectStage: (id: string) => void;
  onToggleNav?: () => void;
}

export const StageRail: React.FC<Props> = ({
  stages, currentStageId, onSelectStage, onToggleNav,
}) => {
  const current = stages.find((s) => s.id === currentStageId);
  return (
    <div className="sticky top-[104px] bg-manila border-2 border-manila-deep rounded-2xl p-2">
      <div className="font-clinical text-[10px] uppercase tracking-[0.12em] text-ink-soft font-bold px-3 pt-2.5 pb-3">
        Your file
      </div>
      {stages.map((s) => {
        const isCurrent = s.id === currentStageId;
        const isPast = !!current && s.order < current.order;
        return (
          <button
            key={s.id}
            onClick={() => onSelectStage(s.id)}
            className={`w-full text-left flex items-start gap-2.5 px-3 py-3 rounded-[9px] cursor-pointer mb-0.5 border-l-[3px] ${
              isCurrent
                ? 'bg-paper border-l-signal'
                : `bg-transparent hover:bg-paper/40 ${isPast ? 'border-l-manila-deep' : 'border-l-transparent'}`
            }`}
          >
            <span
              className={`font-clinical text-[11px] font-bold pt-0.5 ${isCurrent ? 'text-signal' : 'text-ink-soft'}`}
            >
              {pad2(s.order)}
            </span>
            <span className="flex-1">
              <span
                className={`block text-sm leading-snug ${isCurrent ? 'font-bold text-ink' : 'font-medium text-ink-soft'}`}
              >
                {s.shortLabel}
              </span>
              <span className="block font-clinical text-[10px] text-ink-soft/80 mt-0.5">
                {rangeLabel(s)}
              </span>
            </span>
          </button>
        );
      })}
      {onToggleNav && (
        <button
          onClick={onToggleNav}
          className="w-full mt-2 mx-1 py-2.5 text-center font-clinical text-[10px] uppercase tracking-[0.08em] text-ink-soft cursor-pointer border-t border-manila-deep bg-transparent"
        >
          Switch to top stepper
        </button>
      )}
    </div>
  );
};
