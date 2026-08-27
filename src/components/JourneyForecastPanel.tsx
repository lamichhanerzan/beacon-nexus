import React, { useState } from 'react';
import { computeForecast, computeDrift } from '../lib/forecast';
import { formatCaregiverText } from '../lib/caregiverGrammar';
import { Info, HelpCircle, X } from 'lucide-react';

interface JourneyForecastPanelProps {
  stageDates: Record<string, string>;
  currentStageId: string;
  dateEntered: string;
  mode: 'patient' | 'caregiver';
}

export const JourneyForecastPanel: React.FC<JourneyForecastPanelProps> = ({
  stageDates,
  dateEntered,
  mode
}) => {
  const isCaregiver = mode === 'caregiver';
  const [showCalculationModal, setShowCalculationModal] = useState(false);

  const forecast = computeForecast(stageDates, dateEntered);
  const drift = computeDrift(stageDates);

  // Calculate current overall day counter (from earliest logged date or dateEntered)
  const loggedStageValues = Object.values(stageDates).filter(Boolean);
  let totalDaysElapsed = 1;
  if (loggedStageValues.length > 0) {
    const earliestDate = new Date(
      [...loggedStageValues].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0] +
        'T00:00:00'
    );
    const today = new Date();
    totalDaysElapsed = Math.max(1, Math.round((today.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)));
  }

  // Find projected final plan date node
  const planNode = forecast.nodes.find((n) => n.stageId === 'treatment_plan');

  return (
    <div className="bg-paper border border-rule rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-rule/60 pb-3">
        <div>
          <span className="font-clinical text-[10px] font-bold text-signal uppercase tracking-widest block">
            Schedule Projection
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-ink m-0">
            Where this usually goes
          </h3>
        </div>

        <button
          onClick={() => setShowCalculationModal(true)}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md font-clinical text-xs font-semibold bg-manila hover:bg-manila-deep text-ink transition-colors border border-rule cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-signal" />
          <span>How is this calculated?</span>
        </button>
      </div>

      {/* Main Headline */}
      <p className="text-base sm:text-lg text-ink font-medium leading-relaxed m-0">
        {isCaregiver ? 'They are' : 'You are'} on day <strong>{totalDaysElapsed}</strong> of a path that typically runs <strong>6 to 9 weeks</strong>.
      </p>

      {/* TIMELINE VISUALIZATION (Solid Logged Nodes vs Hollow Projected Nodes) */}
      <div className="py-3 px-2 overflow-x-auto">
        <div className="min-w-[650px] relative flex items-center justify-between pt-4 pb-2">
          
          {/* Connector Line Background */}
          <div className="absolute top-7 left-6 right-6 h-1 bg-rule/70 z-0" />

          {forecast.nodes.map((node) => {
            return (
              <div key={node.stageId} className="relative z-10 flex flex-col items-center text-center w-24">
                
                {/* Node Circle */}
                {node.isLogged ? (
                  <div className="w-6 h-6 rounded-full bg-signal text-paper border-2 border-paper ring-2 ring-signal flex items-center justify-center font-clinical text-[10px] font-bold shadow-xs">
                    ✓
                  </div>
                ) : node.isProjected ? (
                  <div className="w-6 h-6 rounded-full bg-paper border-2 border-dashed border-signal text-signal flex items-center justify-center font-clinical text-[10px] font-bold">
                    ○
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-paper border-2 border-rule text-ink-soft flex items-center justify-center" />
                )}

                {/* Stage Short Label */}
                <span className={`font-sans text-xs font-bold mt-2 ${node.isLogged ? 'text-ink' : node.isProjected ? 'text-signal' : 'text-ink-soft'}`}>
                  {node.shortLabel}
                </span>

                {/* Date / Projected Range Label */}
                {node.isLogged && node.formattedLoggedDate && (
                  <span className="font-clinical text-[11px] font-semibold text-ink-soft mt-0.5">
                    {node.formattedLoggedDate}
                  </span>
                )}

                {node.isProjected && node.projectedRangeLabel && (
                  <div className="mt-0.5">
                    <span className="font-clinical text-[10px] font-semibold text-signal bg-signal-light/40 px-1.5 py-0.5 rounded border border-signal/20 block">
                      {node.projectedRangeLabel}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Projection Sentence */}
      {planNode && planNode.isProjected && (
        <div className="p-4 rounded-xl bg-manila/30 border border-rule text-sm sm:text-base text-ink leading-relaxed font-medium">
          If things move at typical speed, {isCaregiver ? 'they' : 'you'}'d expect a treatment plan between{' '}
          <strong className="text-signal font-bold">{planNode.projectedMedianDateStr}</strong> and{' '}
          <strong className="text-signal font-bold">{planNode.projectedP75DateStr}</strong>.
        </div>
      )}

      {/* FACTUAL UNEMOTIONAL DRIFT STATEMENT */}
      <div className="p-4 rounded-xl bg-paper border border-rule/80 text-sm sm:text-base text-ink leading-relaxed">
        <strong className="font-clinical text-xs font-bold uppercase tracking-wider text-ink-soft block mb-1">
          Path Drift Status:
        </strong>
        {formatCaregiverText(drift.summaryText, isCaregiver)}
      </div>

      {/* Schedule Projection Disclaimer */}
      <div className="flex items-start space-x-2 text-xs text-ink-soft italic pt-1 border-t border-rule/50">
        <Info className="w-4 h-4 text-ink-soft shrink-0 mt-0.5" />
        <span>
          This is a schedule projection based on published national timelines. It is not a medical prediction and says nothing about {isCaregiver ? 'their' : 'your'} diagnosis.
        </span>
      </div>

      {/* HOW IS THIS CALCULATED MODAL */}
      {showCalculationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-paper border-2 border-rule rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-rule/60 pb-3">
              <h3 className="font-display text-xl font-bold text-ink m-0">
                How Journey Projections Are Calculated
              </h3>
              <button
                onClick={() => setShowCalculationModal(false)}
                className="p-1 rounded text-ink-soft hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-ink leading-relaxed font-sans">
              <p className="m-0">
                BEACON projections are based entirely on published national medians from clinical guidelines:
              </p>

              <ul className="list-disc list-inside space-y-1.5 text-xs text-ink-soft">
                <li><strong>Abnormal finding → Imaging:</strong> 7 days (NQMBC)</li>
                <li><strong>Imaging → Biopsy:</strong> 6 days (NQMBC)</li>
                <li><strong>Biopsy → Pathology result:</strong> 4 days (College of American Pathologists)</li>
                <li><strong>Diagnosis → Staging scans:</strong> 14 days (CAP / IASLC / AMP)</li>
                <li><strong>Diagnosis → Treatment start:</strong> 27 days (National Cancer Database)</li>
              </ul>

              <p className="m-0 text-xs italic text-ink-soft">
                Projections combine your logged dates with these benchmarks. Projections render as ranges (median to 75th percentile) rather than exact dates to reflect normal clinical variation.
              </p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowCalculationModal(false)}
                className="px-4 py-2 rounded-lg font-sans text-sm font-bold bg-signal text-paper"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
