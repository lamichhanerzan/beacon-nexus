import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import type { Stage, Question } from '../../content/stages';

interface Props {
  stage: Stage;
  checked: Record<number, boolean>;
  onToggle: (index: number) => void;
  custom: string[];
  onAddCustom: (text: string) => void;
  onClear: () => void;
  onBack: () => void;
}

const BADGE: Record<string, string> = {
  NCI: 'bg-blue-100 text-blue-900 border-blue-300',
  ASCO: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  ACS: 'bg-amber-100 text-amber-900 border-amber-300',
  NCCN: 'bg-purple-100 text-purple-900 border-purple-300',
  Mine: 'bg-manila text-ink-soft border-manila-deep',
};

export const QuestionsPanel: React.FC<Props> = ({
  stage, checked, onToggle, custom, onAddCustom, onClear, onBack,
}) => {
  const [mode, setMode] = useState<'list' | 'focus'>('list');
  const [draft, setDraft] = useState('');
  const [focusIdx, setFocusIdx] = useState(0);

  const questions: (Question | { text: string; source: 'Mine' })[] = [
    ...stage.questions,
    ...custom.map((t) => ({ text: t, source: 'Mine' as const })),
  ];
  const asked = questions.filter((_, i) => checked[i]).length;
  const idx = Math.min(focusIdx, Math.max(0, questions.length - 1));

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    onAddCustom(t);
    setDraft('');
  };

  return (
    <div className="max-w-[900px] mx-auto px-8 pt-12 pb-16 w-full">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="font-clinical text-[11px] uppercase tracking-[0.12em] text-ink-soft font-bold">
            {stage.label}
          </div>
          <h2 className="font-display text-[40px] leading-tight tracking-[-0.02em] mt-3 mb-0">
            Questions worth asking now
          </h2>
        </div>
        <div className="flex gap-1 bg-paper border border-rule rounded-[10px] p-1 shrink-0">
          {(['list', 'focus'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3.5 py-2.5 rounded-[7px] text-[13px] font-bold cursor-pointer whitespace-nowrap ${
                mode === m ? 'bg-signal text-paper' : 'bg-transparent text-ink-soft hover:text-ink'
              }`}
            >
              {m === 'list' ? 'Checklist' : 'One at a time'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3.5 mt-6">
        <div className="flex-1 h-2 rounded bg-manila overflow-hidden">
          <div
            className="h-full bg-signal transition-[width]"
            style={{ width: questions.length ? `${Math.round((asked / questions.length) * 100)}%` : '0%' }}
          />
        </div>
        <span className="font-clinical text-xs text-ink-soft font-semibold whitespace-nowrap">
          {asked} of {questions.length} asked
        </span>
      </div>

      {mode === 'list' && (
        <>
          <ul className="list-none p-0 mt-6 flex flex-col gap-2.5">
            {questions.map((q, i) => {
              const isChecked = !!checked[i];
              return (
                <li key={`${q.text}-${i}`}>
                  <button
                    onClick={() => onToggle(i)}
                    className={`w-full text-left flex items-start gap-3.5 px-5 py-4.5 rounded-xl bg-paper border border-rule cursor-pointer transition-all hover:border-manila-deep ${
                      isChecked ? 'opacity-55' : ''
                    }`}
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-6 h-6 text-signal shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-6 h-6 text-ink-soft shrink-0 mt-0.5" />
                    )}
                    <span className={`flex-1 text-lg leading-snug text-ink ${isChecked ? 'line-through' : ''}`}>
                      {q.text}
                    </span>
                    <span
                      className={`shrink-0 font-clinical text-[11px] font-bold px-2 py-1 rounded border ${
                        BADGE[q.source] ?? BADGE.Mine
                      }`}
                    >
                      {q.source}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 p-5 border border-dashed border-rule rounded-xl bg-paper">
            <div className="text-[15px] font-bold">Add your own question</div>
            <div className="flex gap-3 mt-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
                placeholder="Something you keep meaning to ask&hellip;"
                className="flex-1 px-3.5 py-3.5 text-base border border-rule rounded-[9px] bg-paper text-ink"
              />
              <button
                onClick={add}
                className="px-5.5 rounded-[9px] bg-signal text-paper font-bold text-[15px] cursor-pointer hover:bg-signal/90 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </>
      )}

      {mode === 'focus' && questions.length > 0 && (
        <div className="mt-7 bg-paper border border-rule rounded-2xl p-3">
          <div className="bg-paper border border-rule rounded-xl px-10 py-11 min-h-[260px] flex flex-col">
            <div className="font-clinical text-[11px] uppercase tracking-[0.1em] text-ink-soft font-bold">
              Question {idx + 1} of {questions.length}
            </div>
            <div className="font-display text-[34px] leading-[1.25] tracking-[-0.015em] mt-5 text-pretty">
              {questions[idx].text}
            </div>
            <div className="mt-auto pt-8 flex items-center gap-3">
              <button
                onClick={() => setFocusIdx((idx - 1 + questions.length) % questions.length)}
                className="px-5 py-3.5 rounded-[9px] border border-rule bg-paper font-semibold text-[15px] cursor-pointer"
              >
                &larr; Back
              </button>
              <button
                onClick={() => onToggle(idx)}
                className={`px-5.5 py-3.5 rounded-[9px] border border-signal font-bold text-[15px] cursor-pointer ${
                  checked[idx] ? 'bg-signal text-paper' : 'bg-paper text-signal'
                }`}
              >
                {checked[idx] ? '\u2713 Marked as asked' : 'Mark as asked'}
              </button>
              <button
                onClick={() => setFocusIdx((idx + 1) % questions.length)}
                className="ml-auto px-6 py-3.5 rounded-[9px] bg-signal text-paper font-bold text-[15px] cursor-pointer hover:bg-signal/90 transition-colors"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-7 flex items-center gap-3.5">
        <button
          onClick={onBack}
          className="px-5.5 py-3.5 rounded-[10px] border border-rule bg-paper font-semibold text-[15px] cursor-pointer"
        >
          &larr; Back to this stage
        </button>
        <button
          onClick={onClear}
          className="font-clinical text-[11px] uppercase tracking-[0.08em] text-ink-soft cursor-pointer bg-transparent border-0 border-b border-rule"
        >
          Clear marks
        </button>
        <span className="ml-auto text-[13px] text-ink-soft">Nothing here is stored on a server.</span>
      </div>
    </div>
  );
};
