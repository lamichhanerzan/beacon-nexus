import React from 'react';
import { STAGES } from '../content/stages';
import { Clock, Calendar, AlertCircle, X, Printer } from 'lucide-react';

interface JourneyTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageDates: Record<string, string>;
}

export interface TimelineGap {
  fromStageLabel: string;
  toStageLabel: string;
  gapDays: number;
  typicalMin?: number;
  typicalMax?: number;
  escalateMax?: number;
  isExceeded: boolean;
  flagText?: string;
}

export function computeJourneyTimeline(stageDates: Record<string, string>) {
  // Filter stages that have a recorded date and sort by order
  const recorded = STAGES.filter((s) => !!stageDates[s.id])
    .map((s) => ({
      stage: s,
      date: new Date(stageDates[s.id]),
      dateStr: stageDates[s.id]
    }))
    .sort((a, b) => a.stage.order - b.stage.order);

  if (recorded.length === 0) {
    return {
      recorded: [],
      gaps: [],
      totalDays: 0,
      flaggedGaps: []
    };
  }

  const firstDate = recorded[0].date;
  const now = new Date();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const firstMidnight = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate());

  const totalDiff = nowMidnight.getTime() - firstMidnight.getTime();
  const totalDays = Math.max(0, Math.floor(totalDiff / (1000 * 60 * 60 * 24)));

  const gaps: TimelineGap[] = [];
  const flaggedGaps: string[] = [];

  for (let i = 0; i < recorded.length - 1; i++) {
    const current = recorded[i];
    const next = recorded[i + 1];

    const dCurr = new Date(current.dateStr);
    const dNext = new Date(next.dateStr);

    const currMidnight = new Date(dCurr.getFullYear(), dCurr.getMonth(), dCurr.getDate());
    const nextMidnight = new Date(dNext.getFullYear(), dNext.getMonth(), dNext.getDate());

    const gapDiff = nextMidnight.getTime() - currMidnight.getTime();
    const gapDays = Math.max(0, Math.floor(gapDiff / (1000 * 60 * 60 * 24)));

    const maxAllowed = current.stage.timeline?.maxDays ?? current.stage.escalateAfterDays;
    const isExceeded = maxAllowed !== null && gapDays > maxAllowed;

    let flagText = '';
    if (isExceeded && maxAllowed !== null) {
      const rangeStr = current.stage.timeline
        ? `${current.stage.timeline.minDays}-${current.stage.timeline.maxDays}`
        : `under ${maxAllowed}`;
      flagText = `${current.stage.shortLabel} to ${next.stage.shortLabel}: ${gapDays} days (typical ${rangeStr})`;
      flaggedGaps.push(flagText);
    }

    gaps.push({
      fromStageLabel: current.stage.shortLabel,
      toStageLabel: next.stage.shortLabel,
      gapDays,
      typicalMin: current.stage.timeline?.minDays,
      typicalMax: current.stage.timeline?.maxDays,
      escalateMax: current.stage.escalateAfterDays ?? undefined,
      isExceeded,
      flagText
    });
  }

  return {
    recorded,
    gaps,
    totalDays,
    flaggedGaps
  };
}

export const JourneyTimelineModal: React.FC<JourneyTimelineModalProps> = ({
  isOpen,
  onClose,
  stageDates
}) => {
  if (!isOpen) return null;

  const { recorded, gaps, totalDays, flaggedGaps } = computeJourneyTimeline(stageDates);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-paper border-2 border-rule rounded-xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-auto print:border-none print:shadow-none print:p-0 print:max-w-none print:bg-white text-ink font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-rule print:hidden">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-6 h-6 text-signal" />
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-ink m-0">
                My Diagnostic Limbo Journey
              </h3>
              <p className="text-xs font-clinical text-ink-soft m-0">
                Fact-based timeline of your care steps and duration
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-md font-sans text-xs font-semibold bg-signal text-paper hover:bg-signal/90 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Timeline</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-ink-soft hover:text-ink rounded-full hover:bg-manila/50 transition-colors"
              aria-label="Close journey timeline"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {recorded.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <Calendar className="w-10 h-10 text-ink-soft mx-auto" />
            <p className="text-base text-ink m-0 font-medium">
              No step start dates recorded yet.
            </p>
            <p className="text-sm text-ink-soft m-0 max-w-md mx-auto">
              Enter dates as you move through each step (e.g. "When did this step start?") to build your full diagnostic timeline.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Total Time Summary Banner */}
            <div className="p-4 rounded-xl border border-rule bg-manila/30 font-clinical text-base sm:text-lg font-bold text-ink">
              Total time since your first step: {totalDays} days
            </div>

            {/* Horizontal / Sequential Journey Steps */}
            <div className="space-y-4">
              <h4 className="font-display text-base font-bold text-ink uppercase tracking-wider m-0">
                Recorded Care Milestones
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recorded.map((item) => (
                  <div
                    key={item.stage.id}
                    className="p-3.5 rounded-lg border border-rule bg-paper space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-clinical text-xs font-bold text-signal">
                        Step 0{item.stage.order}
                      </span>
                      <span className="font-clinical text-xs text-ink-soft">
                        {new Date(item.dateStr).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <h5 className="font-display font-semibold text-base text-ink m-0">
                      {item.stage.label}
                    </h5>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Gaps & Benchmarks */}
            {gaps.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-display text-base font-bold text-ink uppercase tracking-wider m-0">
                  Duration Between Steps
                </h4>

                <div className="space-y-2">
                  {gaps.map((gap, gIdx) => (
                    <div
                      key={gIdx}
                      className={`p-3 rounded-md border font-clinical text-xs sm:text-sm flex items-center justify-between gap-3 ${
                        gap.isExceeded
                          ? 'border-amber-300 bg-amber-50/80 text-amber-950 font-semibold'
                          : 'border-rule bg-paper text-ink'
                      }`}
                    >
                      <div>
                        <span>
                          {gap.fromStageLabel} $\rightarrow$ {gap.toStageLabel}
                        </span>
                        {gap.isExceeded && (
                          <span className="block text-xs font-sans font-semibold text-amber-900 mt-0.5">
                            {gap.flagText}
                          </span>
                        )}
                      </div>

                      <div className="shrink-0 font-bold">
                        {gap.gapDays} days
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flagged Gaps Highlight */}
            {flaggedGaps.length > 0 && (
              <div className="p-4 rounded-lg border border-amber-300 bg-amber-50 space-y-2">
                <div className="flex items-center space-x-2 text-amber-900 font-semibold text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Timeline Variances (Exceeding Published Benchmarks):</span>
                </div>
                <ul className="list-disc list-inside text-xs sm:text-sm text-amber-950 space-y-1 m-0">
                  {flaggedGaps.map((flag, fIdx) => (
                    <li key={fIdx}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-ink-soft italic font-clinical text-center m-0 pt-2">
              Timeline data is generated strictly from your input dates. No clinical evaluation or diagnosis.
            </p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-rule flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md font-sans text-sm font-semibold bg-signal text-paper hover:bg-signal/90 transition-colors cursor-pointer"
          >
            Close Timeline
          </button>
        </div>

      </div>
    </div>
  );
};
