import { useState, useRef, useEffect } from 'react';
import { STAGES } from '../content/stages';
import { PARISHES } from '../content/resources';
import { computeDwell } from '../lib/dwell';
import { formatCaregiverText } from '../lib/caregiverGrammar';
import { JourneyForecastPanel } from './JourneyForecastPanel';
import { MomentumCheckCard } from './MomentumCheckCard';
import { CallScriptCard } from './CallScriptCard';
import { QuestionsList } from './QuestionsList';
import { RedFlagPanel } from './RedFlagPanel';
import { ResourcesSection } from './ResourcesSection';
import { ParishContextPanel } from './ParishContextPanel';
import { VisitSummaryModal } from './VisitSummaryModal';
import { Calendar, ChevronDown, Share2, Info, Clock, Building2, ShieldCheck, FileText } from 'lucide-react';

interface SpineViewProps {
  currentStageId: string;
  onSelectStage: (stageId: string) => void;
  dateEntered: string;
  onDateChange: (date: string) => void;
  stageDates: Record<string, string>;
  onStageDateChange: (stageId: string, date: string) => void;
  parishSlug: string;
  onParishChange: (slug: string) => void;
  mode: 'patient' | 'caregiver';
  onOpenShareModal: () => void;
  onOpenTimelineModal: () => void;
  upcomingAppointments?: Array<{ date: string; typeId: string }>;
}

export const SpineView: React.FC<SpineViewProps> = ({
  currentStageId,
  onSelectStage,
  dateEntered,
  onDateChange,
  stageDates,
  onStageDateChange,
  parishSlug,
  onParishChange,
  mode,
  onOpenShareModal,
  onOpenTimelineModal,
  upcomingAppointments = []
}) => {
  const [isVisitSummaryOpen, setIsVisitSummaryOpen] = useState(false);
  const [tappedQuestions, setTappedQuestions] = useState<Record<number, boolean>>({});
  const [isFading, setIsFading] = useState(false);

  const rightPanelRef = useRef<HTMLDivElement>(null);

  const isCaregiver = mode === 'caregiver';
  const currentStageIndex = STAGES.findIndex((s) => s.id === currentStageId);
  const activeStage = STAGES[currentStageIndex] || STAGES[0];

  const dwell = computeDwell(activeStage, dateEntered);

  // Smooth opacity fade and scroll top on stage change for desktop right panel
  useEffect(() => {
    setIsFading(true);
    const timer = setTimeout(() => {
      setIsFading(false);
    }, 200);

    if (rightPanelRef.current) {
      rightPanelRef.current.scrollTop = 0;
    }

    return () => clearTimeout(timer);
  }, [currentStageId]);

  const handleToggleQuestion = (index: number) => {
    setTappedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleDateInputChange = (newDate: string) => {
    onDateChange(newDate);
    onStageDateChange(activeStage.id, newDate);
  };

  const handleStageClick = (stageId: string) => {
    if (stageId === currentStageId) {
      onSelectStage(stageId);
    } else {
      onSelectStage(stageId);
    }
  };

  return (
    <div className="w-[95vw] max-w-[95vw] mx-auto px-3 sm:px-4 pb-16">
      
      {/* DESKTOP 2-PANEL LAYOUT (>= 1024px) & MOBILE STACKED ACCORDION (< 1024px) */}
      <div className="lg:flex lg:items-start lg:gap-8">
        
        {/* ======================================================== */}
        {/* LEFT RAIL — FIXED ~280px ON DESKTOP (lg:block), HIDDEN MOBILE */}
        {/* ======================================================== */}
        <aside className="hidden lg:block lg:w-[280px] lg:shrink-0 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto pr-2 scrollbar-thin">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-ink m-0">
              Diagnostic Journey
            </h2>
            <p className="text-xs text-ink-soft m-0">
              {isCaregiver ? "Select a step to view their chart" : "Select a step to view your chart"}
            </p>
          </div>

          <div className="relative border-l-2 border-manila-deep pl-4 space-y-2">
            {STAGES.map((stage, idx) => {
              const isCurrent = stage.id === currentStageId;
              const isCompleted = idx < currentStageIndex || !!stageDates[stage.id];
              const recordedDate = stageDates[stage.id];

              return (
                <button
                  key={stage.id}
                  type="button"
                  aria-expanded={isCurrent}
                  onClick={() => handleStageClick(stage.id)}
                  className={`w-full relative group p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal ${
                    isCurrent
                      ? 'bg-manila/80 border-l-4 border-l-signal border-rule shadow-xs font-semibold'
                      : isCompleted
                      ? 'bg-paper hover:bg-manila/30 border-rule text-ink-soft'
                      : 'bg-paper/40 hover:bg-paper border-rule/60 text-ink-soft/70'
                  }`}
                >
                  {/* Left Rail Node Marker */}
                  <div className="absolute -left-[calc(1rem+7px)] top-3.5 z-10 flex items-center justify-center">
                    {isCurrent ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-signal ring-3 ring-signal-light border border-paper pulse-signal" />
                    ) : isCompleted ? (
                      <div className="w-3 h-3 rounded-full bg-signal border border-paper" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-paper border border-rule" />
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-clinical text-[11px] font-bold text-ink-soft">
                      0{stage.order}
                    </span>
                    <span className={`font-sans text-sm leading-snug truncate ${isCurrent ? 'text-ink font-bold' : 'text-ink'}`}>
                      {stage.shortLabel}
                    </span>
                  </div>

                  {/* Recorded Mono Date Label if available */}
                  {recordedDate && (
                    <div className="font-clinical text-[10px] text-ink-soft mt-1 flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-signal inline" />
                      <span>{new Date(recordedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ======================================================== */}
        {/* RIGHT PANEL (DESKTOP) & MAIN CONTAINER (MOBILE) */}
        {/* ======================================================== */}
        <div ref={rightPanelRef} className="flex-1 min-w-0 w-full">
          
          {/* MOBILE ACCORDION STACK (< 1024px) */}
          <div className="lg:hidden">
            <div className="mb-6 text-center sm:text-left">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink m-0">
                This is what the road usually looks like.
              </h2>
              <p className="text-base text-ink-soft m-0 mt-1">
                {isCaregiver ? "Tap a step to open their chart folder." : "Tap a step to open your chart folder."}
              </p>
            </div>

            {/* Mobile Stacked Accordion List with Collapsible Animation */}
            <div className="relative border-l-2 border-manila-deep pl-4 sm:pl-6 space-y-4">
              {STAGES.map((stage, idx) => {
                const isCurrent = stage.id === currentStageId;
                const isCompleted = idx < currentStageIndex || !!stageDates[stage.id];
                const recordedDate = stageDates[stage.id];

                return (
                  <div key={stage.id} className="relative group">
                    <div className="absolute -left-[calc(1rem+9px)] sm:-left-[calc(1.5rem+9px)] top-4 z-10 flex items-center justify-center">
                      {isCurrent ? (
                        <div className="w-5 h-5 rounded-full bg-signal ring-4 ring-signal-light border-2 border-paper pulse-signal" />
                      ) : isCompleted ? (
                        <div className="w-4 h-4 rounded-full bg-signal border-2 border-paper" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-paper border-2 border-rule" />
                      )}
                    </div>

                    <div
                      className={`rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                        isCurrent
                          ? 'border-signal bg-paper shadow-md translate-x-1'
                          : isCompleted
                          ? 'border-rule/80 bg-manila/30 hover:bg-manila/50 text-ink-soft'
                          : 'border-rule/60 bg-paper/60 hover:bg-paper text-ink-soft/80'
                      }`}
                    >
                      <button
                        type="button"
                        aria-expanded={isCurrent}
                        onClick={() => handleStageClick(stage.id)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-clinical text-xs font-bold px-2 py-0.5 rounded bg-manila-deep/40 text-ink">
                            0{stage.order}
                          </span>
                          <div>
                            <h3 className={`font-display text-lg sm:text-xl font-bold m-0 ${isCurrent ? 'text-ink' : 'text-ink-soft'}`}>
                              {stage.label}
                            </h3>
                            {recordedDate && (
                              <span className="font-clinical text-xs text-ink-soft block mt-0.5">
                                Started: {new Date(recordedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronDown className={`w-5 h-5 text-ink-soft transition-transform duration-200 ease-out ${isCurrent ? 'rotate-180 text-signal' : ''}`} />
                      </button>

                      {/* Mobile Collapsible Panel */}
                      <div
                        className={`transition-all duration-200 ease-out overflow-hidden ${
                          isCurrent ? 'max-h-[3500px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        {isCurrent && (
                          <div className="px-4 pb-6 sm:px-6 sm:pb-8 border-t border-rule/60 pt-4 space-y-6">
                            <FullStageContent
                              stage={activeStage}
                              stageDates={stageDates}
                              dateEntered={dateEntered}
                              onDateInputChange={handleDateInputChange}
                              parishSlug={parishSlug}
                              onParishChange={onParishChange}
                              dwell={dwell}
                              mode={mode}
                              tappedQuestions={tappedQuestions}
                              handleToggleQuestion={handleToggleQuestion}
                              onOpenShareModal={onOpenShareModal}
                              onOpenTimelineModal={onOpenTimelineModal}
                              setIsVisitSummaryOpen={setIsVisitSummaryOpen}
                              upcomingAppointments={upcomingAppointments}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DESKTOP FULL CONTENT PANEL (>= 1024px) */}
          <div className={`hidden lg:block transition-opacity duration-200 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            <FullStageContent
              stage={activeStage}
              stageDates={stageDates}
              dateEntered={dateEntered}
              onDateInputChange={handleDateInputChange}
              parishSlug={parishSlug}
              onParishChange={onParishChange}
              dwell={dwell}
              mode={mode}
              tappedQuestions={tappedQuestions}
              handleToggleQuestion={handleToggleQuestion}
              onOpenShareModal={onOpenShareModal}
              onOpenTimelineModal={onOpenTimelineModal}
              setIsVisitSummaryOpen={setIsVisitSummaryOpen}
              upcomingAppointments={upcomingAppointments}
            />
          </div>

        </div>
      </div>

      {/* VISIT PREPARATION WORKSHEET MODAL */}
      <VisitSummaryModal
        isOpen={isVisitSummaryOpen}
        onClose={() => setIsVisitSummaryOpen(false)}
        stage={activeStage}
        dateEntered={dateEntered}
        daysElapsed={dwell.daysElapsed}
        questions={activeStage.questions}
        tappedQuestions={tappedQuestions}
        stageDates={stageDates}
      />
    </div>
  );
};

/* REUSABLE FULL STAGE CONTENT COMPONENT WITH JOURNEY FORECAST & MOMENTUM CHECK */
interface FullStageContentProps {
  stage: typeof STAGES[0];
  stageDates: Record<string, string>;
  dateEntered: string;
  onDateInputChange: (date: string) => void;
  parishSlug: string;
  onParishChange: (slug: string) => void;
  dwell: ReturnType<typeof computeDwell>;
  mode: 'patient' | 'caregiver';
  tappedQuestions: Record<number, boolean>;
  handleToggleQuestion: (idx: number) => void;
  onOpenShareModal: () => void;
  onOpenTimelineModal: () => void;
  setIsVisitSummaryOpen: (open: boolean) => void;
  upcomingAppointments: Array<{ date: string; typeId: string }>;
}

const FullStageContent: React.FC<FullStageContentProps> = ({
  stage,
  stageDates,
  dateEntered,
  onDateInputChange,
  parishSlug,
  onParishChange,
  dwell,
  mode,
  tappedQuestions,
  handleToggleQuestion,
  onOpenShareModal,
  onOpenTimelineModal,
  setIsVisitSummaryOpen,
  upcomingAppointments
}) => {
  const isCaregiver = mode === 'caregiver';

  return (
    <div className="space-y-6">
      {/* Top Header Card Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rule">
        <div>
          <span className="font-clinical text-xs font-bold text-signal uppercase tracking-wider">
            Step 0{stage.order} of 09
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink m-0">
            {stage.label}
          </h2>
        </div>

        <button
          onClick={onOpenTimelineModal}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-md font-clinical text-xs font-semibold bg-manila hover:bg-manila-deep text-ink transition-colors cursor-pointer self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-signal"
        >
          <Clock className="w-4 h-4 text-signal" />
          <span>{isCaregiver ? "Their Timeline" : "My Timeline"}</span>
        </button>
      </div>

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
            onChange={(e) => onDateInputChange(e.target.value)}
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

      {/* MOMENTUM CHECK CARD */}
      <MomentumCheckCard
        currentStageId={stage.id}
        daysAtCurrentStage={dwell.daysElapsed}
        upcomingAppointments={upcomingAppointments}
        callScript={stage.callScript || undefined}
        dateEntered={dateEntered}
        mode={mode}
      />

      {/* JOURNEY FORECAST PROJECTION PANEL */}
      <JourneyForecastPanel
        stageDates={stageDates}
        currentStageId={stage.id}
        dateEntered={dateEntered}
        mode={mode}
      />

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
                Stall risk describes how long {isCaregiver ? "they have" : "you have"} been waiting at this step compared to published timelines. It is not a medical assessment.
              </div>
            </div>
          </div>

          <p className="text-base sm:text-lg font-medium text-ink m-0 pt-1">
            {formatCaregiverText(dwell.verdict, isCaregiver)}
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
      {!isCaregiver ? (
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
            <QuestionsList
              questions={stage.questions}
              tappedQuestions={tappedQuestions}
              onToggleQuestion={handleToggleQuestion}
            />

            {/* PREPARE FOR MY APPOINTMENT BUTTON */}
            <div className="pt-3">
              <button
                onClick={() => setIsVisitSummaryOpen(true)}
                className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 rounded-lg font-sans text-base font-semibold bg-manila hover:bg-manila-deep text-ink transition-colors border border-rule cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal"
              >
                <FileText className="w-5 h-5 text-signal" />
                <span>Prepare for appointment</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* CAREGIVER MODE CONTENT WITH STRICT THIRD-PERSON GRAMMAR */
        <div className="space-y-6">
          {/* Situation */}
          <div className="p-4 rounded-lg bg-manila/30 border border-rule space-y-1">
            <h4 className="font-display font-semibold text-lg text-ink m-0">
              Where they are
            </h4>
            <p className="text-base text-ink m-0 leading-relaxed">
              {formatCaregiverText(stage.caregiver.situation, true)}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-lg text-ink m-0">
              Useful things to do this week
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
                  <span>{formatCaregiverText(act, true)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* At Appointment & Stop Doing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-paper border border-rule space-y-1">
              <h5 className="font-sans font-semibold text-sm text-ink m-0">
                In the room
              </h5>
              <p className="text-sm text-ink-soft m-0 leading-relaxed">
                {formatCaregiverText(stage.caregiver.atAppointment, true)}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-flag-bg border border-flag/30 space-y-1">
              <h5 className="font-sans font-semibold text-sm text-flag m-0">
                Stop doing this
              </h5>
              <p className="text-sm text-ink-soft m-0 leading-relaxed">
                {formatCaregiverText(stage.caregiver.stopDoing, true)}
              </p>
            </div>
          </div>

          {/* Questions to ask for Caregiver */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-lg text-ink m-0">
              Questions to ask their care team
            </h4>
            <QuestionsList
              questions={stage.questions}
              tappedQuestions={tappedQuestions}
              onToggleQuestion={handleToggleQuestion}
            />

            {/* PREPARE FOR THEIR APPOINTMENT BUTTON */}
            <div className="pt-3">
              <button
                onClick={() => setIsVisitSummaryOpen(true)}
                className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 rounded-lg font-sans text-base font-semibold bg-manila hover:bg-manila-deep text-ink transition-colors border border-rule cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal"
              >
                <FileText className="w-5 h-5 text-signal" />
                <span>Prepare for their appointment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Critical Red Flag Panel */}
      <RedFlagPanel />

      {/* Louisiana Help Near You */}
      <ResourcesSection />

      {/* Louisiana Parish Context Panel (When Selected) */}
      <ParishContextPanel parishSlug={parishSlug} />

      {/* Share Link Action Button */}
      <div className="pt-4 border-t border-rule/60 text-center">
        <button
          onClick={onOpenShareModal}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-lg font-sans text-base font-semibold bg-signal text-paper hover:bg-signal/90 transition-colors shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal"
        >
          <Share2 className="w-5 h-5" />
          <span>{isCaregiver ? "Share this summary with them" : "Share with someone helping me"}</span>
        </button>
      </div>
    </div>
  );
};
