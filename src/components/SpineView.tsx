import { STAGES } from '../content/stages';
import { PARISHES } from '../content/resources';
import { computeDwell } from '../lib/dwell';
import { CallScriptCard } from './CallScriptCard';
import { QuestionsList } from './QuestionsList';
import { RedFlagPanel } from './RedFlagPanel';
import { ResourcesSection } from './ResourcesSection';
import { Calendar, ChevronDown, Share2, Info, Clock, Building2, ShieldCheck } from 'lucide-react';

interface SpineViewProps {
  currentStageId: string;
  onSelectStage: (stageId: string) => void;
  dateEntered: string;
  onDateChange: (date: string) => void;
  parishSlug: string;
  onParishChange: (slug: string) => void;
  mode: 'patient' | 'caregiver';
  onOpenShareModal: () => void;
}

export const SpineView: React.FC<SpineViewProps> = ({
  currentStageId,
  onSelectStage,
  dateEntered,
  onDateChange,
  parishSlug,
  onParishChange,
  mode,
  onOpenShareModal
}) => {
  const currentStageIndex = STAGES.findIndex((s) => s.id === currentStageId);
  const activeStage = STAGES[currentStageIndex] || STAGES[0];

  const dwell = computeDwell(activeStage, dateEntered);

  return (
    <div className="w-full max-w-(--breakpoint-sm) mx-auto px-3 sm:px-0 pb-16">
      {/* Spine Prompt Header */}
      <div className="mb-6 text-center sm:text-left">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-ink m-0">
          This is what the road usually looks like.
        </h2>
        <p className="text-base text-ink-soft m-0 mt-1">
          Tap where you are to open your personal chart folder.
        </p>
      </div>

      {/* Manila Folder Spine Container */}
      <div className="relative border-l-2 border-manila-deep pl-4 sm:pl-6 space-y-4">
        {STAGES.map((stage, idx) => {
          const isCurrent = stage.id === currentStageId;
          const isCompleted = idx < currentStageIndex;
          const isAhead = idx > currentStageIndex;

          return (
            <div key={stage.id} className="relative group">
              {/* Spine Node Marker */}
              <div className="absolute -left-[calc(1rem+9px)] sm:-left-[calc(1.5rem+9px)] top-4 z-10 flex items-center justify-center">
                {isCompleted && (
                  <div className="w-4 h-4 rounded-full bg-ink-soft/40 border-2 border-paper" title="Completed step" />
                )}
                {isCurrent && (
                  <div className="w-5 h-5 rounded-full bg-signal ring-4 ring-signal-light border-2 border-paper pulse-signal" title="Current step" />
                )}
                {isAhead && (
                  <div className="w-4 h-4 rounded-full bg-paper border-2 border-rule" title="Upcoming step" />
                )}
              </div>

              {/* Stage Card Tab */}
              <div
                onClick={() => onSelectStage(stage.id)}
                className={`rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                  isCurrent
                    ? 'border-signal bg-paper shadow-md translate-x-1'
                    : isCompleted
                    ? 'border-rule/80 bg-manila/30 hover:bg-manila/50 text-ink-soft'
                    : 'border-rule/60 bg-paper/60 hover:bg-paper text-ink-soft/80'
                }`}
              >
                {/* Stage Header Tab Button */}
                <div className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-clinical text-xs font-bold px-2 py-0.5 rounded bg-manila-deep/40 text-ink">
                      0{stage.order}
                    </span>
                    <h3
                      className={`font-display text-lg sm:text-xl font-bold m-0 ${
                        isCurrent
                          ? 'text-ink'
                          : isCompleted
                          ? 'text-ink-soft'
                          : 'text-ink-soft/70'
                      }`}
                    >
                      {stage.label}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isCurrent && (
                      <span className="hidden sm:inline-block font-clinical text-xs font-semibold px-2.5 py-1 rounded bg-signal text-paper uppercase">
                        Current Step
                      </span>
                    )}
                    <ChevronDown
                      className={`w-5 h-5 text-ink-soft transition-transform duration-280 ${
                        isCurrent ? 'rotate-180 text-signal' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Manila Folder Contents (Only when active/selected) */}
                {isCurrent && (
                  <div className="px-4 pb-6 sm:px-6 sm:pb-8 border-t border-rule/60 pt-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-280">
                    
                    {/* Date Input & Parish Selector Controls */}
                    <div className="p-4 rounded-lg bg-manila/30 border border-rule space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <label className="flex items-center space-x-2 font-sans font-semibold text-sm text-ink cursor-pointer">
                          <Calendar className="w-4 h-4 text-signal" />
                          <span>When did this step start?</span>
                        </label>
                        <input
                          type="date"
                          value={dateEntered}
                          onChange={(e) => onDateChange(e.target.value)}
                          className="px-3 py-2 rounded border border-rule bg-paper font-clinical text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-rule/40">
                        <label className="flex items-center space-x-2 font-sans text-xs text-ink-soft cursor-pointer">
                          <Building2 className="w-4 h-4 text-ink-soft" />
                          <span>Optional — Louisiana Parish</span>
                        </label>
                        <select
                          value={parishSlug}
                          onChange={(e) => onParishChange(e.target.value)}
                          className="px-3 py-1.5 rounded border border-rule bg-paper font-sans text-xs text-ink focus:outline-none focus:ring-2 focus:ring-signal"
                        >
                          <option value="">Select Parish (helps identify local resources)</option>
                          {PARISHES.map((p) => (
                            <option key={p.slug} value={p.slug}>
                              {p.name} Parish
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* SECTION 1: Day Counter Band & Status Verdict */}
                    <div className="p-5 rounded-xl border border-rule bg-paper shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="font-clinical text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                          DAY {dwell.daysElapsed}
                        </div>

                        {/* STALL RISK INDICATOR LINE */}
                        <div className="flex items-center space-x-2 pt-0.5">
                          <span
                            className={`font-clinical text-xs font-bold tracking-wide uppercase ${
                              dwell.stallRisk === 'elevated'
                                ? 'text-signal'
                                : dwell.stallRisk === 'moderate'
                                ? 'text-[#856828]'
                                : 'text-ink-soft'
                            }`}
                          >
                            {dwell.stallRiskText}
                          </span>

                          <div className="relative group inline-block cursor-help" tabIndex={0}>
                            <Info className="w-3.5 h-3.5 text-ink-soft hover:text-ink transition-colors" />
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block group-focus:block w-64 p-2.5 bg-ink text-paper text-xs rounded-md shadow-lg z-30 font-sans pointer-events-none leading-snug">
                              Stall risk describes how long you have been waiting at this step compared to published timelines. It is not a medical assessment.
                            </div>
                          </div>
                        </div>

                        <p className="text-base sm:text-lg font-medium text-ink m-0 pt-1">
                          {dwell.verdict}
                        </p>
                      </div>

                      <div className="shrink-0 self-start sm:self-auto">
                        <span
                          className={`inline-block font-clinical text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${
                            dwell.status === 'overdue'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : dwell.status === 'typical'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : dwell.status === 'early'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-gray-100 text-gray-800 border border-gray-300'
                          }`}
                        >
                          {dwell.status}
                        </span>
                      </div>
                    </div>

                    {/* SECTION 2 & 5 / Caregiver Guidance depending on Mode */}
                    {mode === 'patient' ? (
                      <>
                        {/* What's Happening */}
                        <div className="space-y-2">
                          <h4 className="font-display font-semibold text-lg text-ink m-0 flex items-center space-x-2">
                            <Info className="w-5 h-5 text-signal" />
                            <span>What's happening right now</span>
                          </h4>
                          <p className="text-base sm:text-lg text-ink leading-relaxed m-0">
                            {stage.whatsHappening}
                          </p>
                          <p className="text-sm text-ink-soft m-0 italic">
                            Professionals involved: {stage.whoIsDoing}
                          </p>
                        </div>

                        {/* How long this usually takes */}
                        <div className="p-4 rounded-lg bg-paper border border-rule/80 space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-signal" />
                            <h5 className="font-sans font-semibold text-sm text-ink m-0">
                              How long this usually takes
                            </h5>
                          </div>
                          {stage.timeline ? (
                            <>
                              <p className="text-base font-semibold text-ink m-0">
                                {stage.timeline.minDays}–{stage.timeline.maxDays} days
                              </p>
                              <p className="text-xs text-ink-soft font-clinical m-0">
                                Source: {stage.timeline.sourceLabel}
                              </p>
                              {stage.timeline.note && (
                                <p className="text-xs text-ink-soft italic m-0 mt-1">
                                  Caveat: {stage.timeline.note}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-ink-soft m-0 italic">
                              There is no published standard for how quickly this step moves. It depends on your clinic and your insurance.
                            </p>
                          )}
                        </div>

                        {/* Is this normal or should I call? */}
                        {stage.callScript && (
                          <CallScriptCard
                            script={stage.callScript}
                            isOverdue={dwell.status === 'overdue'}
                            dateEntered={dateEntered}
                          />
                        )}

                        {/* What people usually get wrong here */}
                        <div className="p-4 rounded-lg bg-manila/20 border border-rule/70 space-y-1">
                          <h5 className="font-display font-semibold text-base text-ink m-0 flex items-center space-x-2">
                            <ShieldCheck className="w-4 h-4 text-signal" />
                            <span>What people usually get wrong here</span>
                          </h5>
                          <p className="text-base text-ink m-0 leading-relaxed">
                            {stage.misconception}
                          </p>
                        </div>

                        {/* Questions to ask */}
                        <div className="space-y-3">
                          <h4 className="font-display font-semibold text-lg text-ink m-0">
                            Questions to ask your care team
                          </h4>
                          <QuestionsList questions={stage.questions} />
                        </div>
                      </>
                    ) : (
                      /* CAREGIVER MODE CONTENT */
                      <div className="space-y-6">
                        {/* Situation */}
                        <div className="p-4 rounded-lg bg-manila/30 border border-rule space-y-1">
                          <h4 className="font-display font-semibold text-lg text-ink m-0">
                            Caregiver Situation
                          </h4>
                          <p className="text-base text-ink m-0 leading-relaxed">
                            {stage.caregiver.situation}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                          <h4 className="font-display font-semibold text-lg text-ink m-0">
                            Concrete Actions You Can Take
                          </h4>
                          <ul className="space-y-2 m-0 p-0 list-none">
                            {stage.caregiver.actions.map((act, aIdx) => (
                              <li
                                key={aIdx}
                                className="p-3 rounded-md bg-paper border border-rule text-base text-ink flex items-start space-x-2.5"
                              >
                                <span className="font-clinical font-bold text-signal text-sm mt-0.5">
                                  ✓
                                </span>
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* At Appointment & Stop Doing */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-paper border border-rule space-y-1">
                            <h5 className="font-sans font-semibold text-sm text-ink m-0">
                              At the Appointment
                            </h5>
                            <p className="text-sm text-ink-soft m-0 leading-relaxed">
                              {stage.caregiver.atAppointment}
                            </p>
                          </div>

                          <div className="p-4 rounded-lg bg-flag-bg border border-flag/30 space-y-1">
                            <h5 className="font-sans font-semibold text-sm text-flag m-0">
                              What to Stop Doing
                            </h5>
                            <p className="text-sm text-ink-soft m-0 leading-relaxed">
                              {stage.caregiver.stopDoing}
                            </p>
                          </div>
                        </div>

                        {/* Questions to ask for Caregiver */}
                        <div className="space-y-3">
                          <h4 className="font-display font-semibold text-lg text-ink m-0">
                            Questions to Ask Together
                          </h4>
                          <QuestionsList questions={stage.questions} />
                        </div>
                      </div>
                    )}

                    {/* Safety Critical Red Flag Panel */}
                    <RedFlagPanel />

                    {/* Louisiana Help Near You */}
                    <ResourcesSection />

                    {/* Share Link Action Button */}
                    <div className="pt-4 border-t border-rule/60 text-center">
                      <button
                        onClick={onOpenShareModal}
                        className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-lg font-sans text-base font-semibold bg-signal text-paper hover:bg-signal/90 transition-colors shadow-xs cursor-pointer"
                      >
                        <Share2 className="w-5 h-5" />
                        <span>Share with someone helping me</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
