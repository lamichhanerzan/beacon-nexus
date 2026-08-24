import React from 'react';
import type { Stage, Question } from '../content/stages';
import { computeJourneyTimeline } from './JourneyTimelineModal';
import { Printer, X, FileText } from 'lucide-react';

interface VisitSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: Stage;
  dateEntered: string;
  daysElapsed: number;
  questions: Question[];
  tappedQuestions: Record<number, boolean>;
  stageDates: Record<string, string>;
}

export const VisitSummaryModal: React.FC<VisitSummaryModalProps> = ({
  isOpen,
  onClose,
  stage,
  dateEntered,
  daysElapsed,
  questions,
  tappedQuestions,
  stageDates = {}
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const startDateFormatted = dateEntered
    ? new Date(dateEntered).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Not specified';

  // Filter questions: if user tapped specific questions, highlight/include them;
  // otherwise, include all questions for the stage so the printable sheet is complete.
  const activeQuestions = questions.filter((_, idx) => tappedQuestions[idx]);
  const displayQuestions = activeQuestions.length > 0 ? activeQuestions : questions;

  const handlePrint = () => {
    window.print();
  };

  const { recorded, totalDays, flaggedGaps } = computeJourneyTimeline(stageDates);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-ink/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-paper border-2 border-rule rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-auto print:border-none print:shadow-none print:p-0 print:max-w-none print:bg-white text-ink font-sans">
        
        {/* Screen Chrome Action Header (hidden on print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-rule print:hidden">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-signal" />
            <h3 className="font-display text-xl font-bold text-ink m-0">
              Clinical Visit Preparation Summary
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-md font-sans text-sm font-semibold bg-signal text-paper hover:bg-signal/90 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-ink-soft hover:text-ink rounded-full hover:bg-manila/50 transition-colors"
              aria-label="Close summary modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CLINICAL SUMMARY CONTENT */}
        <div className="space-y-6 text-black print:text-black print:font-sans">
          
          {/* Document Header */}
          <div className="border-b-2 border-black pb-4 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold font-serif uppercase tracking-tight m-0">
                BEACON — Clinical Visit Worksheet
              </h1>
              <p className="text-xs font-mono text-gray-700 m-0 mt-0.5">
                Patient & Caregiver Diagnostic Limbo Organizer
              </p>
            </div>
            <div className="text-right font-mono text-sm">
              <div><strong>Date Prepared:</strong> {todayStr}</div>
            </div>
          </div>

          {/* Current Step Summary Box */}
          <div className="p-4 border border-black rounded-sm bg-gray-50 print:bg-white text-sm space-y-1">
            <div className="flex justify-between items-center font-bold text-base border-b border-gray-300 pb-1">
              <span>Current Step: {stage.label}</span>
              <span className="font-mono text-sm">{daysElapsed} days at this step</span>
            </div>
            <div className="pt-1 grid grid-cols-2 gap-4 text-xs font-mono">
              <div><strong>Step Start Date:</strong> {startDateFormatted}</div>
              <div><strong>Expected Window:</strong> {stage.timeline ? `${stage.timeline.minDays}–${stage.timeline.maxDays} days` : 'No published standard'}</div>
            </div>
          </div>

          {/* Printable Journey Timeline Summary Block */}
          {recorded.length > 0 && (
            <div className="p-3 border border-black rounded-sm text-xs font-mono space-y-1.5 break-inside-avoid">
              <div className="font-bold uppercase border-b border-gray-400 pb-1 flex justify-between">
                <span>Journey Timeline Summary</span>
                <span>Total elapsed: {totalDays} days</span>
              </div>

              <div className="space-y-1 pt-1">
                {recorded.map((rec, rIdx) => (
                  <div key={rIdx} className="flex justify-between">
                    <span>• Step 0{rec.stage.order}: {rec.stage.shortLabel}</span>
                    <span>{new Date(rec.dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                ))}
              </div>

              {flaggedGaps.length > 0 && (
                <div className="pt-1.5 border-t border-gray-300">
                  <div className="font-semibold text-gray-900">Timeline Variances:</div>
                  {flaggedGaps.map((fg, fgIdx) => (
                    <div key={fgIdx} className="text-[11px] text-gray-800">• {fg}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Questions & Ruled Lines for Answers */}
          <div className="space-y-5">
            <h2 className="text-base font-bold uppercase tracking-wider border-b border-black pb-1 m-0">
              Questions to Ask Your Care Team
            </h2>

            <div className="space-y-4">
              {displayQuestions.map((q, idx) => (
                <div key={idx} className="space-y-1.5 break-inside-avoid">
                  <div className="font-semibold text-sm flex items-start space-x-2">
                    <span className="font-mono text-xs text-gray-600 font-normal">[{q.source}]</span>
                    <span>{idx + 1}. {q.text}</span>
                  </div>

                  {/* Blank Ruled Lines for Written Notes */}
                  <div className="space-y-2 pt-1 pl-4">
                    <div className="border-b border-gray-400 h-4 w-full" />
                    <div className="border-b border-gray-400 h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blank Ruled Notes Area for Additional Notes */}
          <div className="space-y-2 pt-2 break-inside-avoid">
            <h3 className="text-xs font-bold uppercase text-gray-700 m-0">
              Additional Notes / Clinician Instructions:
            </h3>
            <div className="border-b border-gray-400 h-4 w-full" />
            <div className="border-b border-gray-400 h-4 w-full" />
          </div>

          {/* Mandatory Footer Block */}
          <div className="pt-4 border-t-2 border-black font-mono text-xs space-y-3 break-inside-avoid">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <strong>Next step:</strong> <span className="inline-block border-b border-black w-32 sm:w-full min-h-[16px]" />
              </div>
              <div>
                <strong>Date:</strong> <span className="inline-block border-b border-black w-24 sm:w-full min-h-[16px]" />
              </div>
              <div>
                <strong>Who to call:</strong> <span className="inline-block border-b border-black w-32 sm:w-full min-h-[16px]" />
              </div>
            </div>

            <div className="text-[10px] text-gray-600 text-center italic pt-1">
              This worksheet is for educational preparation only. Not medical advice. No patient health information stored.
            </div>
          </div>

        </div>

        {/* Screen Bottom Action Footer */}
        <div className="mt-6 pt-4 border-t border-rule flex justify-end space-x-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-sans text-sm font-medium bg-manila hover:bg-manila-deep text-ink transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-md font-sans text-sm font-semibold bg-signal text-paper hover:bg-signal/90 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Worksheet</span>
          </button>
        </div>

      </div>
    </div>
  );
};
