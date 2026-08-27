import React from 'react';
import { ArrowRight, User, HeartHandshake } from 'lucide-react';
import { STAGES } from '../../content/stages';
import { rangeLabel, pad2 } from '../../lib/stageTiming';

interface Props {
  onStart: (mode: 'patient' | 'caregiver') => void;
}

const HIGHLIGHTS = [
  { kicker: 'Sourced', title: 'Evidence benchmarks', body: 'Every timeline claim carries published sources \u2014 CAP, ASCO, NCI, NCCN.' },
  { kicker: 'Private', title: 'Zero health data stored', body: 'No accounts, no EHR connection, no personal health information. Ever.' },
  { kicker: 'Local', title: 'Louisiana navigation', body: 'Resources mapped across all 64 parishes, no search required.' },
];

export const LandingHero: React.FC<Props> = ({ onStart }) => (
  <div className="max-w-6xl mx-auto px-8 pt-16 pb-10 w-full">
    <div className="grid grid-cols-[1.15fr_0.85fr] gap-14 items-start">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-signal-light border border-rule font-clinical text-[11px] font-semibold tracking-[0.06em] uppercase text-signal">
          Ochsner Health &amp; Nexus LA Innovation Companion
        </div>

        <h1 className="font-display text-[60px] leading-[1.04] tracking-[-0.025em] font-bold mt-6 mb-0 text-balance">
          You're waiting on answers. Here's what's happening, and what to ask.
        </h1>

        <p className="text-[21px] leading-relaxed text-ink-soft max-w-[60ch] mt-6 mb-0 text-pretty">
          The stretch between "something suspicious was found" and "I have a treatment plan" is
          confusing and quiet. BEACON makes that window visible and survivable.
        </p>

        <div className="flex gap-4 mt-9">
          <button
            onClick={() => onStart('patient')}
            className="flex-1 flex items-center justify-center gap-2.5 px-6 py-5 rounded-xl bg-signal text-paper text-lg font-bold cursor-pointer hover:bg-signal/90 transition-colors shadow-sm"
          >
            <User className="w-5 h-5" /> I'm the Patient <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => onStart('caregiver')}
            className="flex-1 flex items-center justify-center gap-2.5 px-6 py-5 rounded-xl bg-paper border-2 border-rule text-ink text-lg font-bold cursor-pointer hover:bg-manila/40 transition-colors"
          >
            <HeartHandshake className="w-5 h-5 text-signal" /> I'm Helping Someone
            <ArrowRight className="w-5 h-5 text-ink-soft" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-10">
          {HIGHLIGHTS.map((h) => (
            <div key={h.kicker} className="p-4.5 border border-rule rounded-xl bg-paper">
              <div className="font-clinical text-[10px] uppercase tracking-[0.1em] text-signal font-bold">
                {h.kicker}
              </div>
              <div className="font-bold text-[17px] mt-2">{h.title}</div>
              <div className="text-sm text-ink-soft mt-1.5 leading-relaxed">{h.body}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-manila border-2 border-manila-deep rounded-2xl p-2 pb-5">
        <div className="bg-paper border border-rule rounded-xl p-5.5">
          <div className="font-clinical text-[10px] uppercase tracking-[0.12em] text-ink-soft font-bold">
            The nine stages of the wait
          </div>
          <div className="flex flex-col mt-4">
            {STAGES.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2.5 border-b border-rule/40">
                <span
                  className={`w-[22px] h-[22px] rounded-full border border-rule shrink-0 flex items-center justify-center font-clinical text-[10px] font-bold ${
                    s.id === 'path_wait' ? 'bg-signal text-paper' : 'bg-paper text-ink-soft'
                  }`}
                >
                  {pad2(s.order)}
                </span>
                <span className="text-[15px] font-medium">{s.shortLabel}</span>
                <span className="ml-auto font-clinical text-[11px] text-ink-soft whitespace-nowrap">
                  {rangeLabel(s)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4.5 p-3.5 bg-signal-light rounded-lg text-[13px] leading-relaxed text-signal">
            Median time from an abnormal finding to a treatment plan spans weeks, not days.
            Knowing which week you're in is the whole point.
          </div>
        </div>
      </div>
    </div>

    <div className="mt-12 px-6 py-5 border border-rule border-l-4 border-l-flag rounded-[10px] bg-flag-bg max-w-[900px]">
      <div className="font-clinical text-[11px] font-bold tracking-[0.1em] uppercase text-flag">
        Not medical advice
      </div>
      <div className="text-[15px] leading-relaxed text-ink-soft mt-2 text-pretty">
        BEACON explains typical processes and timeframes. It does not diagnose, interpret your
        results, or replace your care team. If you have severe symptoms, call your clinician or 911.
      </div>
    </div>
  </div>
);
