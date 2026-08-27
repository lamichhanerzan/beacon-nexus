import React, { useState } from 'react';
import type { Stage } from '../../content/stages';
import { daysSince, isOverdue, pad2 } from '../../lib/stageTiming';
import { StageRail } from './StageRail';
import { StageStepper } from './StageStepper';
import { TimelineCard } from './TimelineCard';

interface Props {
  stage: Stage;
  stages: Stage[];
  dateEntered: string;
  onSelectStage: (id: string) => void;
  nav: 'rail' | 'stepper';
  onToggleNav: () => void;
  timelineView: 'bar' | 'dots';
  onToggleTimelineView: () => void;
  onOpenQuestions: () => void;
  onOpenCaregiver: () => void;
  questionCount: number;
}

export const StageDetail: React.FC<Props> = ({
  stage, stages, dateEntered, onSelectStage, nav, onToggleNav,
  timelineView, onToggleTimelineView, onOpenQuestions, onOpenCaregiver, questionCount,
}) => {
  const [copied, setCopied] = useState(false);
  const days = daysSince(dateEntered);
  const overdue = isOverdue(stage, days);

  const copyScript = () => {
    if (stage.callScript && navigator.clipboard) {
      navigator.clipboard.writeText(stage.callScript).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className={`max-w-6xl mx-auto px-8 py-8 w-full grid gap-8 items-start ${
        nav === 'rail' ? 'grid-cols-[272px_1fr]' : 'grid-cols-1'
      }`}
    >
      {nav === 'rail' && (
        <StageRail
          stages={stages}
          currentStageId={stage.id}
          onSelectStage={onSelectStage}
          onToggleNav={onToggleNav}
        />
      )}

      <div>
        {nav === 'stepper' && (
          <StageStepper
            stages={stages}
            currentStageId={stage.id}
            onSelectStage={onSelectStage}
            onToggleNav={onToggleNav}
          />
        )}

        <div className="flex items-baseline gap-3.5">
          <span className="font-clinical text-xs font-bold tracking-[0.1em] uppercase text-signal whitespace-nowrap">
            Stage {pad2(stage.order)} of {pad2(stages.length)}
          </span>
          <span className="font-clinical text-xs text-ink-soft whitespace-nowrap">
            {days == null ? 'no date entered' : `day ${days} of this wait`}
          </span>
        </div>

        <h2 className="font-display text-[44px] leading-[1.08] tracking-[-0.02em] mt-3 mb-0 text-balance">
          {stage.label}
        </h2>

        <div className="grid grid-cols-[1.4fr_1fr] gap-6 mt-7 items-start">
          <div>
            <div className="bg-paper border border-rule rounded-2xl p-6.5">
              <div className="font-clinical text-[10px] uppercase tracking-[0.12em] text-ink-soft font-bold">
                What's actually happening
              </div>
              <p className="text-[19px] leading-relaxed mt-3.5 mb-0 text-pretty">
                {stage.whatsHappening}
              </p>
              <div className="mt-5 pt-4.5 border-t border-rule/50 text-[15px] text-ink-soft leading-relaxed">
                <span className="font-bold text-ink">Who is doing it: </span>
                {stage.whoIsDoing}
              </div>
            </div>

            <div className="bg-paper border border-rule border-l-4 border-l-signal rounded-xl px-6 py-5.5 mt-5">
              <div className="font-clinical text-[10px] uppercase tracking-[0.12em] text-signal font-bold">
                Common misconception
              </div>
              <p className="text-[17px] leading-relaxed mt-2.5 mb-0 text-pretty">
                {stage.misconception}
              </p>
            </div>

            {stage.callScript && (
              <div className="bg-manila border-2 border-manila-deep rounded-xl px-6 py-5.5 mt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-clinical text-[10px] uppercase tracking-[0.12em] text-ink-soft font-bold">
                    If you need to call &mdash; read this out
                  </span>
                  <button
                    onClick={copyScript}
                    className="font-clinical text-[11px] font-bold px-3 py-2 rounded-[7px] bg-paper border border-rule cursor-pointer text-signal"
                  >
                    {copied ? 'Copied' : 'Copy script'}
                  </button>
                </div>
                <p className="font-clinical text-base leading-relaxed mt-3.5 mb-0 p-4.5 bg-paper rounded-[9px] text-ink">
                  {stage.callScript}
                </p>
              </div>
            )}

            {overdue && (
              <div className="bg-flag-bg border border-rule border-l-4 border-l-flag rounded-xl px-6 py-5.5 mt-5">
                <div className="font-clinical text-[10px] uppercase tracking-[0.12em] text-flag font-bold">
                  This wait has run long
                </div>
                <p className="text-[17px] leading-relaxed mt-2.5 mb-0">
                  It has been {days} days. Published guidance for this stage points to roughly{' '}
                  {stage.escalateAfterDays}. That does not mean something is wrong &mdash; but it is
                  a reasonable moment to call and ask where things stand.
                  {stage.callScript ? ' Use the script above.' : ''}
                </p>
              </div>
            )}
          </div>

          <div>
            <TimelineCard
              stage={stage}
              daysElapsed={days}
              view={timelineView}
              onToggleView={onToggleTimelineView}
            />

            <div className="bg-signal-light border border-rule rounded-2xl p-5.5 mt-5">
              <div className="font-clinical text-[10px] uppercase tracking-[0.12em] text-signal font-bold">
                Take this to your appointment
              </div>
              <p className="text-base leading-relaxed mt-2.5 mb-0 text-ink">
                {questionCount} questions for this stage, drawn from NCI, ASCO, ACS and NCCN
                patient guidance.
              </p>
              <button
                onClick={onOpenQuestions}
                className="w-full mt-4 py-3.5 rounded-[10px] bg-signal text-paper text-base font-bold cursor-pointer hover:bg-signal/90 transition-colors"
              >
                Open the question list &rarr;
              </button>
              <button
                onClick={onOpenCaregiver}
                className="w-full mt-2.5 py-3.5 rounded-[10px] bg-paper border border-rule text-[15px] font-semibold cursor-pointer text-ink hover:bg-manila/40 transition-colors"
              >
                What a helper should do
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
