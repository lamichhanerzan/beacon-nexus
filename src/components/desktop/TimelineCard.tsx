import React from 'react';
import type { Stage } from '../../content/stages';
import { barGeometry } from '../../lib/stageTiming';

interface Props {
  stage: Stage;
  daysElapsed: number | null;
  view: 'bar' | 'dots';
  onToggleView: () => void;
}

export const TimelineCard: React.FC<Props> = ({ stage, daysElapsed, view, onToggleView }) => {
  const tl = stage.timeline;
  const geo = barGeometry(stage, daysElapsed);

  const milestones = tl
    ? [
        { day: 'day 0', label: 'The clock starts', tone: 'bg-manila-deep' },
        { day: `day ${tl.minDays}`, label: 'Earliest typical answer', tone: 'bg-signal' },
        { day: `day ${tl.maxDays}`, label: 'Most people have heard by now', tone: 'bg-signal' },
        {
          day: `day ${stage.escalateAfterDays ?? tl.maxDays + 5}`,
          label: 'Time to call and ask',
          tone: 'bg-flag',
        },
      ]
    : [];

  return (
    <div className="bg-paper border border-rule rounded-2xl p-5.5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-clinical text-[10px] uppercase tracking-[0.12em] text-ink-soft font-bold">
          How long this usually takes
        </span>
        {tl && (
          <button
            onClick={onToggleView}
            className="font-clinical text-[10px] uppercase tracking-[0.06em] text-signal cursor-pointer bg-transparent border-0 border-b border-rule"
          >
            {view === 'bar' ? 'Show as milestones' : 'Show as a range bar'}
          </button>
        )}
      </div>

      {!tl && (
        <p className="mt-3.5 text-[15px] leading-relaxed text-ink-soft mb-0">
          There is no published benchmark for this stage &mdash; it depends on your care team and
          your situation. Use the questions instead of a clock.
        </p>
      )}

      {tl && (
        <>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="font-display text-[40px] font-bold leading-none text-signal whitespace-nowrap">
              {tl.minDays}&ndash;{tl.maxDays}
            </span>
            <span className="text-base text-ink-soft font-semibold whitespace-nowrap">
              days, typically
            </span>
          </div>

          {view === 'bar' && geo && (
            <div className="mt-5">
              <div className="relative h-3.5 rounded-md bg-manila overflow-hidden">
                <span
                  className="absolute top-0 bottom-0 bg-signal/30"
                  style={{ left: geo.bandLeft, width: geo.bandWidth }}
                />
                <span
                  className="absolute top-0 bottom-0 w-[3px] bg-flag"
                  style={{ left: geo.nowLeft }}
                />
              </div>
              <div className="flex justify-between font-clinical text-[10px] text-ink-soft mt-2">
                <span>day 0</span>
                <span>{geo.scaleMid}</span>
                <span>{geo.scaleMax}</span>
              </div>
              <p className="text-[13px] text-ink-soft mt-2.5 leading-relaxed mb-0">
                Shaded band is the published benchmark. The red mark is where you are.
              </p>
            </div>
          )}

          {view === 'dots' && (
            <div className="mt-4.5 flex flex-col gap-2">
              {milestones.map((m) => (
                <div key={m.day} className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${m.tone}`} />
                  <span className="font-clinical text-xs text-ink-soft w-16">{m.day}</span>
                  <span className="text-[13px] text-ink">{m.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4.5 pt-3.5 border-t border-rule/50">
            <div className="font-clinical text-[11px] text-signal font-semibold">
              Source: {tl.sourceLabel}
            </div>
            {tl.note && (
              <div className="text-[13px] text-ink-soft mt-2 leading-relaxed">{tl.note}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
