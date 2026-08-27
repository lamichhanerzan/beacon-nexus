import React from 'react';
import type { Stage } from '../../content/stages';

interface Props {
  stages: Stage[];
  currentStageId: string;
  onSelectStage: (id: string) => void;
  onToggleNav?: () => void;
}

export const StageStepper: React.FC<Props> = ({
  stages, currentStageId, onSelectStage, onToggleNav,
}) => {
  const current = stages.find((s) => s.id === currentStageId);
  return (
    <div className="bg-manila border-2 border-manila-deep rounded-2xl px-5 py-4.5 mb-6">
      <div className="flex items-center justify-between">
        <span className="font-clinical text-[10px] uppercase tracking-[0.12em] text-ink-soft font-bold">
          Your file
        </span>
        {onToggleNav && (
          <button
            onClick={onToggleNav}
            className="font-clinical text-[10px] uppercase tracking-[0.08em] text-ink-soft cursor-pointer bg-transparent border-0"
          >
            Switch to side rail
          </button>
        )}
      </div>
      <div className="flex gap-1.5 mt-3.5">
        {stages.map((s) => {
          const isCurrent = s.id === currentStageId;
          const isPast = !!current && s.order < current.order;
          return (
            <button
              key={s.id}
              onClick={() => onSelectStage(s.id)}
              className="flex-1 text-left cursor-pointer bg-transparent border-0 p-0"
            >
              <span
                className={`block h-1.5 rounded-sm ${
                  isCurrent ? 'bg-signal' : isPast ? 'bg-manila-deep' : 'bg-transparent'
                }`}
              />
              <span
                className={`block text-xs leading-snug mt-2 ${
                  isCurrent ? 'font-bold text-ink' : 'font-medium text-ink-soft'
                }`}
              >
                {s.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
