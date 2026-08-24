import React, { useState } from 'react';
import type { Question } from '../content/stages';
import { CheckCircle2, Circle } from 'lucide-react';

interface QuestionsListProps {
  questions: Question[];
  tappedQuestions?: Record<number, boolean>;
  onToggleQuestion?: (index: number) => void;
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  tappedQuestions,
  onToggleQuestion
}) => {
  const [internalChecked, setInternalChecked] = useState<Record<number, boolean>>({});

  const checkedIndices = tappedQuestions ?? internalChecked;

  const toggleCheck = (index: number) => {
    if (onToggleQuestion) {
      onToggleQuestion(index);
    } else {
      setInternalChecked((prev) => ({
        ...prev,
        [index]: !prev[index]
      }));
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'NCI':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'ASCO':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'ACS':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'NCCN':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft m-0">
        Tap a question to mark it as asked during your appointment:
      </p>

      <ul className="space-y-2.5 p-0 m-0 list-none">
        {questions.map((q, idx) => {
          const isChecked = !!checkedIndices[idx];
          return (
            <li
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={`group flex items-start space-x-3 p-3.5 rounded-lg border transition-all cursor-pointer ${
                isChecked
                  ? 'bg-paper/50 border-rule opacity-60 line-through'
                  : 'bg-paper border-rule hover:border-manila-deep shadow-xs'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-full cursor-pointer"
                aria-label={isChecked ? "Mark question as unasked" : "Mark question as asked"}
              >
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-signal" />
                ) : (
                  <Circle className="w-5 h-5 text-ink-soft group-hover:text-signal" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <span className="text-base sm:text-lg text-ink leading-snug block">
                  {q.text}
                </span>
              </div>

              <span
                className={`font-clinical text-xs font-semibold px-2 py-0.5 rounded border shrink-0 ${getSourceBadgeColor(
                  q.source
                )}`}
              >
                {q.source}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
