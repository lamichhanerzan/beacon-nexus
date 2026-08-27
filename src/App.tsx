import React, { useState, useEffect } from 'react';
import { STAGES } from './content/stages';
import type { ScreeningInput } from './lib/screening';
import { evaluateScreenings } from './lib/screening';
import { Header } from './components/Header';
import { SpineView } from './components/SpineView';
import { ScreeningForm } from './components/ScreeningForm';
import { ScreeningResults } from './components/ScreeningResults';
import { Disclaimer } from './components/Disclaimer';
import { ShareLinkModal } from './components/ShareLinkModal';
import { AtlasModal } from './components/AtlasModal';
import { JourneyTimelineModal } from './components/JourneyTimelineModal';
import { ArrowRight, ShieldCheck, Search, Activity, Home } from 'lucide-react';

// Desktop handoff shell components
import { DesktopHeader, type DesktopScreen } from './components/desktop/DesktopHeader';
import { LandingHero } from './components/desktop/LandingHero';
import { Onboarding } from './components/desktop/Onboarding';
import { StageDetail } from './components/desktop/StageDetail';
import { QuestionsPanel } from './components/desktop/QuestionsPanel';
import { CaregiverPanel } from './components/desktop/CaregiverPanel';

type Marks = Record<string, Record<number, boolean>>;

export function App() {
  const isDesktopShell = new URLSearchParams(window.location.search).has('desktop');

  const [activeModule, setActiveModule] = useState<'landing' | 'screening' | 'spine'>('landing');
  const [mode, setMode] = useState<'patient' | 'caregiver'>('patient');

  // Spine state
  const [stageId, setStageId] = useState<string>('finding');
  const [dateEntered, setDateEntered] = useState<string>('');
  const [stageDates, setStageDates] = useState<Record<string, string>>({});
  const [parishSlug, setParishSlug] = useState<string>('');

  // Screening state
  const [screeningInput, setScreeningInput] = useState<ScreeningInput | null>(null);
  const [screeningStep, setScreeningStep] = useState<'form' | 'results'>('form');

  // Desktop Shell specific state
  const [desktopScreen, setDesktopScreen] = useState<DesktopScreen>('landing');
  const [checked, setChecked] = useState<Marks>({});
  const [done, setDone] = useState<Marks>({});
  const [custom, setCustom] = useState<Record<string, string[]>>({});
  const [nav, setNav] = useState<'rail' | 'stepper'>('rail');
  const [timelineView, setTimelineView] = useState<'bar' | 'dots'>('bar');

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isAtlasModalOpen, setIsAtlasModalOpen] = useState<boolean>(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState<boolean>(false);

  // Parse URL query parameters on load
  useEffect(() => {
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.has('desktop')) {
      const s = searchParams.get('s');
      if (s && STAGES.some((st) => st.id === s)) {
        setStageId(s);
        setDesktopScreen('stage');
      }
    }

    // 1. Check Screening route / params
    if (pathname.includes('/screening') || searchParams.has('a')) {
      setActiveModule('screening');

      const aStr = searchParams.get('a');
      if (aStr) {
        const age = parseInt(aStr) || 50;
        const sex = (searchParams.get('s') as any) || 'female';
        const smokingStatus = (searchParams.get('sm') as any) || 'never';
        const packYears = parseFloat(searchParams.get('py') || '0');
        const yearsSinceQuit = parseInt(searchParams.get('yq') || '0');
        const familyHistory = (searchParams.get('fh') || '').split(',').filter(Boolean);
        const zip = searchParams.get('z') || undefined;
        const pSlug = searchParams.get('p') || undefined;

        setScreeningInput({
          age,
          sex,
          smokingStatus,
          packYears,
          yearsSinceQuit,
          familyHistory,
          priorScreenings: [],
          zip,
          parishSlug: pSlug
        });
        setScreeningStep('results');
      }
    }

    // 2. Check Diagnostic Spine route / params
    if (pathname.includes('/c') || searchParams.has('s')) {
      setActiveModule('spine');
      if (pathname.includes('/c')) {
        setMode('caregiver');
      }

      const s = searchParams.get('s');
      const d = searchParams.get('d');
      const p = searchParams.get('p');
      const datesRaw = searchParams.get('dates');

      if (s && STAGES.some((st) => st.id === s)) {
        setStageId(s);
      }
      if (d) {
        setDateEntered(d);
      }
      if (p) {
        setParishSlug(p);
      }

      if (datesRaw) {
        const parsedDates: Record<string, string> = {};
        datesRaw.split(',').forEach((pair) => {
          const [id, dateVal] = pair.split(':');
          if (id && dateVal && STAGES.some((st) => st.id === id)) {
            parsedDates[id] = dateVal;
          }
        });
        setStageDates(parsedDates);
      }
    }
  }, []);

  const handleStageDateChange = (targetStageId: string, newDate: string) => {
    setStageDates((prev) => {
      const updated = { ...prev };
      if (newDate) {
        updated[targetStageId] = newDate;
      } else {
        delete updated[targetStageId];
      }
      return updated;
    });
  };

  const handleSelectStage = (newStageId: string) => {
    setStageId(newStageId);
    if (stageDates[newStageId]) {
      setDateEntered(stageDates[newStageId]);
    }
  };

  const handleScreeningFormSubmit = (input: ScreeningInput) => {
    setScreeningInput(input);
    setScreeningStep('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function for toggling check marks in Desktop shell
  const toggleMarks = (
    setter: React.Dispatch<React.SetStateAction<Marks>>,
    index: number
  ) =>
    setter((prev) => ({
      ...prev,
      [stageId]: { ...(prev[stageId] ?? {}), [index]: !(prev[stageId] ?? {})[index] }
    }));

  const changeDesktopMode = (m: 'patient' | 'caregiver') => {
    setMode(m);
    if (desktopScreen === 'landing') return;
    setDesktopScreen(m === 'caregiver' ? 'caregiver' : 'stage');
  };

  const currentStage = STAGES.find((s) => s.id === stageId) ?? STAGES[0];
  const questionCount = currentStage.questions.length + (custom[stageId]?.length ?? 0);

  // If ?desktop flag is present in URL, render desktop handoff shell
  if (isDesktopShell) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-signal-light selection:text-signal">
        <DesktopHeader
          screen={desktopScreen}
          onScreenChange={setDesktopScreen}
          mode={mode}
          onModeChange={changeDesktopMode}
          started={desktopScreen !== 'landing'}
        />

        {desktopScreen === 'landing' && (
          <LandingHero
            onStart={(m) => {
              setMode(m);
              setDesktopScreen('onboard');
            }}
          />
        )}

        {desktopScreen === 'onboard' && (
          <Onboarding
            stageId={stageId}
            onSelectStage={handleSelectStage}
            date={dateEntered}
            onDateChange={(d) => {
              setDateEntered(d);
              handleStageDateChange(stageId, d);
            }}
            onContinue={() => setDesktopScreen('stage')}
          />
        )}

        {desktopScreen === 'stage' && (
          <StageDetail
            stage={currentStage}
            stages={STAGES}
            dateEntered={dateEntered}
            onSelectStage={handleSelectStage}
            nav={nav}
            onToggleNav={() => setNav(nav === 'rail' ? 'stepper' : 'rail')}
            timelineView={timelineView}
            onToggleTimelineView={() => setTimelineView(timelineView === 'bar' ? 'dots' : 'bar')}
            onOpenQuestions={() => setDesktopScreen('questions')}
            onOpenCaregiver={() => {
              setMode('caregiver');
              setDesktopScreen('caregiver');
            }}
            questionCount={questionCount}
          />
        )}

        {desktopScreen === 'questions' && (
          <QuestionsPanel
            stage={currentStage}
            checked={checked[stageId] ?? {}}
            onToggle={(i) => toggleMarks(setChecked, i)}
            custom={custom[stageId] ?? []}
            onAddCustom={(t) =>
              setCustom((prev) => ({ ...prev, [stageId]: [...(prev[stageId] ?? []), t] }))
            }
            onClear={() => setChecked((prev) => ({ ...prev, [stageId]: {} }))}
            onBack={() => setDesktopScreen('stage')}
          />
        )}

        {desktopScreen === 'caregiver' && (
          <CaregiverPanel
            stage={currentStage}
            done={done[stageId] ?? {}}
            onToggle={(i) => toggleMarks(setDone, i)}
            onBack={() => {
              setMode('patient');
              setDesktopScreen('stage');
            }}
          />
        )}

        <footer className="mt-auto border-t border-rule bg-paper">
          <div className="max-w-6xl mx-auto px-8 py-6 flex items-center gap-5">
            <p className="text-[13px] text-ink-soft leading-relaxed max-w-[80ch] m-0">
              BEACON explains typical processes and timeframes. It is not medical advice and cannot
              interpret your results. Call your care team with anything urgent.
            </p>
            <span className="ml-auto font-clinical text-[11px] text-ink-soft whitespace-nowrap">
              Built for Nexus Louisiana DevDays
            </span>
          </div>
        </footer>
      </div>
    );
  }

  // Standard BEACON App View
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-signal-light selection:text-signal">
      {/* Top Header tab bar */}
      <Header
        mode={mode}
        onModeChange={(newMode) => setMode(newMode)}
        onOpenAtlas={() => setIsAtlasModalOpen(true)}
      />

      {/* Module Navigation Breadcrumb when inside screening or spine */}
      {activeModule !== 'landing' && (
        <div className="w-full max-w-6xl mx-auto px-4 pt-2">
          <button
            onClick={() => setActiveModule('landing')}
            className="inline-flex items-center space-x-1.5 font-clinical text-xs font-semibold text-signal hover:underline cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to BEACON Home</span>
          </button>
        </div>
      )}

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-2">
        {activeModule === 'landing' ? (
          /* REVAMPED LANDING PAGE */
          <div className="space-y-10 py-4 sm:py-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
            
            {/* Headline & Subhead */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-manila border border-manila-deep text-ink-soft font-clinical text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-signal" />
                <span>Nexus LA Innovation & Ochsner Health Companion</span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-ink leading-tight m-0">
                Cancer care starts before the diagnosis.
              </h1>

              <p className="text-lg sm:text-xl text-ink-soft leading-relaxed max-w-2xl mx-auto m-0">
                Find out what screenings you're due for, or get your bearings if something's already been found.
              </p>
            </div>

            {/* TWO LARGE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* CARD A — I haven't been screened yet (Slightly more visual weight: --manila fill) */}
              <div
                onClick={() => {
                  setActiveModule('screening');
                  setScreeningStep('form');
                }}
                className="bg-manila border-2 border-manila-deep rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="p-3 rounded-full bg-paper/80 text-signal inline-block border border-rule">
                    <Search className="w-6 h-6" />
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink group-hover:text-signal transition-colors m-0">
                    I haven't been screened yet
                  </h2>

                  <p className="text-base sm:text-lg text-ink-soft leading-relaxed m-0 italic">
                    "Find out which tests you're eligible for and where to get them."
                  </p>
                </div>

                <div className="pt-6 flex items-center text-signal font-sans font-bold text-base group-hover:translate-x-1 transition-transform">
                  <span>Check Screening Eligibility</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </div>

              {/* CARD B — Something was found (--paper fill with --rule border) */}
              <div
                onClick={() => setActiveModule('spine')}
                className="bg-paper border-2 border-rule rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group hover:border-manila-deep"
              >
                <div className="space-y-3">
                  <div className="p-3 rounded-full bg-manila/30 text-ink-soft inline-block border border-rule">
                    <Activity className="w-6 h-6" />
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink group-hover:text-signal transition-colors m-0">
                    Something was found
                  </h2>

                  <p className="text-base sm:text-lg text-ink-soft leading-relaxed m-0 italic">
                    "Understand where you are, what's next, and what to ask."
                  </p>
                </div>

                <div className="pt-6 flex items-center text-ink-soft font-sans font-bold text-base group-hover:text-ink group-hover:translate-x-1 transition-all">
                  <span>Open Diagnostic Companion</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </div>

            </div>

            {/* QUIET ROW OF THREE FACTS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-rule/60">
              <div className="p-4 rounded-xl border border-rule bg-paper space-y-1">
                <span className="font-clinical text-xs font-bold text-signal uppercase tracking-wider block">
                  Most Screenings Are Free
                </span>
                <p className="text-sm text-ink-soft m-0 leading-relaxed">
                  Under the Affordable Care Act, most insurance covers preventive cancer screening with no copay.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-rule bg-paper space-y-1">
                <span className="font-clinical text-xs font-bold text-signal uppercase tracking-wider block">
                  Colon Screening Starts at 45
                </span>
                <p className="text-sm text-ink-soft m-0 leading-relaxed">
                  This changed in 2021. Many people still think it's 50.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-rule bg-paper space-y-1">
                <span className="font-clinical text-xs font-bold text-signal uppercase tracking-wider block">
                  Some Tests Done at Home
                </span>
                <p className="text-sm text-ink-soft m-0 leading-relaxed">
                  Stool-based colorectal tests are mailed to your home and mailed back.
                </p>
              </div>
            </div>

            {/* Mandatory Landing Disclaimer */}
            <Disclaimer variant="landing" />
          </div>
        ) : activeModule === 'screening' ? (
          /* SCREENING MODULE */
          <div className="animate-in fade-in duration-300">
            {screeningStep === 'form' || !screeningInput ? (
              <ScreeningForm
                mode={mode}
                initialValues={screeningInput || undefined}
                onSubmit={handleScreeningFormSubmit}
              />
            ) : (
              <ScreeningResults
                input={screeningInput}
                results={evaluateScreenings(screeningInput)}
                mode={mode}
                onEditInputs={() => setScreeningStep('form')}
              />
            )}
          </div>
        ) : (
          /* DIAGNOSTIC SPINE MODULE */
          <div className="animate-in fade-in duration-300">
            <SpineView
              currentStageId={stageId}
              onSelectStage={handleSelectStage}
              dateEntered={dateEntered}
              onDateChange={(d) => {
                setDateEntered(d);
                handleStageDateChange(stageId, d);
              }}
              stageDates={stageDates}
              onStageDateChange={handleStageDateChange}
              parishSlug={parishSlug}
              onParishChange={(p) => setParishSlug(p)}
              mode={mode}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onOpenTimelineModal={() => setIsTimelineModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Persistent Footer Disclaimer */}
      <footer className="w-full max-w-4xl mx-auto px-4 pb-8">
        <Disclaimer variant="footer" />
        <p className="text-center font-clinical text-xs text-ink-soft mt-4 m-0">
          BEACON Diagnostic Limbo Companion • Built for Nexus Louisiana DevDays
        </p>
      </footer>

      {/* Share Link Modal */}
      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        stageId={stageId}
        dateEntered={dateEntered}
        stageDates={stageDates}
        parishSlug={parishSlug}
      />

      {/* Atlas Placeholder Modal */}
      <AtlasModal
        isOpen={isAtlasModalOpen}
        onClose={() => setIsAtlasModalOpen(false)}
      />

      {/* Journey Timeline Modal */}
      <JourneyTimelineModal
        isOpen={isTimelineModalOpen}
        onClose={() => setIsTimelineModalOpen(false)}
        stageDates={stageDates}
      />
    </div>
  );
}
