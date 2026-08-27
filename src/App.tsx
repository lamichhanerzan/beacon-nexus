import { useState, useEffect } from 'react';
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
import { BeaconLogo } from './components/BeaconLogo';
import { CalendarView } from './components/CalendarView';
import { AppointmentForm, type UserAppointment } from './components/AppointmentForm';
import { AppointmentPrepSheet } from './components/AppointmentPrepSheet';
import { APPOINTMENT_TYPES } from './content/appointments';
import { ArrowRight, Search, Activity, Calendar as CalendarIcon } from 'lucide-react';

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

  const [activeModule, setActiveModule] = useState<'landing' | 'screening' | 'spine' | 'appointments'>('landing');
  const [mode, setMode] = useState<'patient' | 'caregiver'>('patient');

  // Spine state
  const [stageId, setStageId] = useState<string>('finding');
  const [dateEntered, setDateEntered] = useState<string>('');
  const [stageDates, setStageDates] = useState<Record<string, string>>({});
  const [parishSlug, setParishSlug] = useState<string>('');

  // Screening state
  const [screeningInput, setScreeningInput] = useState<ScreeningInput | null>(null);
  const [screeningStep, setScreeningStep] = useState<'form' | 'results'>('form');

  // Appointments state
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<UserAppointment | null>(null);
  const [isApptFormOpen, setIsApptFormOpen] = useState<boolean>(false);
  const [apptFormInitialDate, setApptFormInitialDate] = useState<string | undefined>(undefined);

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

  // Parse URL query parameters and routes on load
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

    // 1. Check Appointment Route or Shared Appointment params (?t=typeId&d=date)
    if (pathname.includes('/appointments') || searchParams.has('t')) {
      setActiveModule('appointments');
      const t = searchParams.get('t');
      const d = searchParams.get('d') || new Date().toISOString().split('T')[0];

      if (t && APPOINTMENT_TYPES.some((apt) => apt.id === t)) {
        const sharedAppt: UserAppointment = {
          id: `shared_${t}_${d}`,
          typeId: t,
          date: d
        };
        setSelectedAppointment(sharedAppt);
      }
    }

    // 2. Check Screening route / params
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

    // 3. Check Journey / Diagnostic Spine route / params
    if (pathname.includes('/journey') || pathname.includes('/c') || searchParams.has('s')) {
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

  const handleAddAppointment = (newAppt: UserAppointment) => {
    setAppointments((prev) => [...prev, newAppt]);
    setSelectedAppointment(newAppt);
    setActiveModule('appointments');
  };

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

  // Sorted upcoming appointments
  const upcomingAppointments = [...appointments]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .filter((a) => new Date(a.date + 'T00:00:00') >= new Date(new Date().toDateString()));

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

        {/* Global Persistent Footer Disclaimer */}
        <footer className="mt-auto border-t border-rule bg-paper">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <Disclaimer variant="footer" />
            <p className="text-center font-clinical text-xs text-ink-soft mt-3 m-0">
              BEACON Diagnostic Limbo Companion • Built for Nexus Louisiana DevDays
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Standard BEACON App View
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-signal-light selection:text-signal">
      {/* Header tab bar with persistent Patient/Caregiver mode toggle */}
      <Header
        mode={mode}
        onModeChange={(newMode) => setMode(newMode)}
        onOpenAtlas={() => setIsAtlasModalOpen(true)}
        onGoHome={() => {
          setActiveModule('landing');
          setSelectedAppointment(null);
        }}
      />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-5 sm:px-8 py-4">
        {activeModule === 'landing' ? (
          /* RESTRUCTURED TWO-COLUMN LANDING PAGE (≥1024px) & SINGLE COLUMN (<1024px) */
          <div className="space-y-8 animate-in fade-in duration-300">
            
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12 items-start">
              
              {/* LEFT COLUMN (~55% DESKTOP) */}
              <div className="space-y-6">
                
                {/* Logo & Tagline (Logo sits directly on paper, no colored container) */}
                <div className="space-y-2 text-left">
                  <BeaconLogo size="lg" showWordmark={true} />
                  <p className="font-display italic text-xl sm:text-2xl text-ink-soft m-0 pt-1">
                    "Cancer care starts before the diagnosis."
                  </p>
                </div>

                {/* TWO PRIMARY CARDS (STACKED VERTICALLY FOR STRONG PRESENCE) */}
                <div className="space-y-5 pt-2">
                  
                  {/* CARD A — "I haven't been screened yet" (--manila fill, higher visual weight) */}
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

                      <p className="text-base text-ink-soft leading-relaxed m-0 italic">
                        "Find out which tests you're due for and where to get them near you."
                      </p>
                    </div>

                    <div className="pt-6 flex items-center text-signal font-sans font-bold text-base group-hover:translate-x-1 transition-transform">
                      <span>Check Screening Eligibility</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </div>
                  </div>

                  {/* CARD B — "I've been screened" (--paper fill with --rule border) */}
                  <div
                    onClick={() => setActiveModule('spine')}
                    className="bg-paper border-2 border-rule rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group hover:border-manila-deep"
                  >
                    <div className="space-y-3">
                      <div className="p-3 rounded-full bg-manila/30 text-ink-soft inline-block border border-rule">
                        <Activity className="w-6 h-6" />
                      </div>

                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink group-hover:text-signal transition-colors m-0">
                        I've been screened
                      </h2>

                      <p className="text-base text-ink-soft leading-relaxed m-0 italic">
                        "Something was found, or you're waiting on results."
                      </p>
                    </div>

                    <div className="pt-6 flex items-center text-ink-soft font-sans font-bold text-base group-hover:text-ink group-hover:translate-x-1 transition-all">
                      <span>Open Diagnostic Journey</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </div>
                  </div>

                </div>

                {/* QUIET ROW OF THREE FACTS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-rule/60">
                  <div className="p-4 rounded-xl border border-rule bg-paper space-y-1">
                    <span className="font-clinical text-xs font-bold text-signal uppercase tracking-wider block">
                      Most screenings are free
                    </span>
                    <p className="text-xs text-ink-soft m-0 leading-relaxed">
                      Under the Affordable Care Act, most insurance covers preventive cancer screening with no copay.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-rule bg-paper space-y-1">
                    <span className="font-clinical text-xs font-bold text-signal uppercase tracking-wider block">
                      Colon screening starts at 45
                    </span>
                    <p className="text-xs text-ink-soft m-0 leading-relaxed">
                      This changed in 2021. Many people still think it's 50.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-rule bg-paper space-y-1">
                    <span className="font-clinical text-xs font-bold text-signal uppercase tracking-wider block">
                      Some tests are done at home
                    </span>
                    <p className="text-xs text-ink-soft m-0 leading-relaxed">
                      Stool-based colorectal tests are mailed to you.
                    </p>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN (~45% DESKTOP): CALENDAR & UPCOMING APPOINTMENTS */}
              <div className="space-y-6">
                <CalendarView
                  appointments={appointments}
                  onSelectAppointment={(appt) => {
                    setSelectedAppointment(appt);
                    setActiveModule('appointments');
                  }}
                  onOpenAddModal={(dateStr) => {
                    setApptFormInitialDate(dateStr);
                    setIsApptFormOpen(true);
                  }}
                />

                {/* UPCOMING APPOINTMENTS COMPACT LIST */}
                {upcomingAppointments.length > 0 && (
                  <div className="p-5 rounded-2xl border border-rule bg-paper shadow-xs space-y-3">
                    <h4 className="font-display font-bold text-lg text-ink m-0 flex items-center space-x-2">
                      <CalendarIcon className="w-5 h-5 text-signal" />
                      <span>Upcoming Appointments ({upcomingAppointments.length})</span>
                    </h4>

                    <div className="space-y-2">
                      {upcomingAppointments.slice(0, 3).map((appt) => {
                        const typeObj = APPOINTMENT_TYPES.find((t) => t.id === appt.typeId);
                        return (
                          <div
                            key={appt.id}
                            onClick={() => {
                              setSelectedAppointment(appt);
                              setActiveModule('appointments');
                            }}
                            className="p-3.5 rounded-xl border border-rule bg-manila/20 hover:bg-manila/50 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                          >
                            <div className="space-y-0.5">
                              <div className="font-sans font-bold text-sm text-ink group-hover:text-signal transition-colors">
                                {typeObj?.label || 'Appointment'}
                              </div>
                              <div className="font-clinical text-xs text-ink-soft flex items-center space-x-2">
                                <span>{new Date(appt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                {appt.time && <span>• {appt.time}</span>}
                              </div>
                            </div>

                            <div className="inline-flex items-center space-x-1 font-sans text-xs font-bold text-signal group-hover:translate-x-1 transition-transform">
                              <span>Prep Sheet</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : activeModule === 'appointments' ? (
          /* APPOINTMENT PREP SHEET MODULE */
          <div className="animate-in fade-in duration-300">
            {selectedAppointment ? (
              <AppointmentPrepSheet
                appointment={selectedAppointment}
                mode={mode}
                onBack={() => {
                  setActiveModule('landing');
                  setSelectedAppointment(null);
                }}
              />
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-lg text-ink-soft italic">No appointment selected.</p>
                <button
                  onClick={() => setActiveModule('landing')}
                  className="px-5 py-2.5 rounded-lg font-sans font-bold bg-signal text-paper"
                >
                  Return to Home
                </button>
              </div>
            )}
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
          /* DIAGNOSTIC JOURNEY MODULE */
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

      {/* Persistent Global Footer Disclaimer */}
      <footer className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 pb-8">
        <Disclaimer variant="footer" />
        <p className="text-center font-clinical text-xs text-ink-soft mt-4 m-0">
          BEACON Diagnostic Limbo Companion • Built for Nexus Louisiana DevDays
        </p>
      </footer>

      {/* Appointment Form Modal */}
      <AppointmentForm
        isOpen={isApptFormOpen}
        onClose={() => setIsApptFormOpen(false)}
        onSave={handleAddAppointment}
        initialDate={apptFormInitialDate}
      />

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
