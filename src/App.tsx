import { useState, useEffect } from 'react';
import { STAGES } from './content/stages';
import { Header } from './components/Header';
import { SpineView } from './components/SpineView';
import { Disclaimer } from './components/Disclaimer';
import { ShareLinkModal } from './components/ShareLinkModal';
import { AtlasModal } from './components/AtlasModal';
import { HeartHandshake, User, ArrowRight, ShieldCheck, Clock, MapPin } from 'lucide-react';

export function App() {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [mode, setMode] = useState<'patient' | 'caregiver'>('patient');
  const [stageId, setStageId] = useState<string>('finding');
  const [dateEntered, setDateEntered] = useState<string>('');
  const [parishSlug, setParishSlug] = useState<string>('');

  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isAtlasModalOpen, setIsAtlasModalOpen] = useState<boolean>(false);

  // Parse URL query parameters on load (e.g. /c?s=path_wait&d=2026-08-03&p=franklin or ?s=...)
  useEffect(() => {
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    const s = searchParams.get('s');
    const d = searchParams.get('d');
    const p = searchParams.get('p');

    if (pathname.includes('/c') || searchParams.has('s')) {
      if (pathname.includes('/c')) {
        setMode('caregiver');
      }

      if (s && STAGES.some((st) => st.id === s)) {
        setStageId(s);
        setHasStarted(true);
      }
      if (d) {
        setDateEntered(d);
      }
      if (p) {
        setParishSlug(p);
      }
    }
  }, []);

  const handleStart = (selectedMode: 'patient' | 'caregiver') => {
    setMode(selectedMode);
    setHasStarted(true);
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-signal-light selection:text-signal">
      {/* Top Header tab bar */}
      <Header
        mode={mode}
        onModeChange={(newMode) => setMode(newMode)}
        onOpenAtlas={() => setIsAtlasModalOpen(true)}
      />

      <main className="flex-1 w-full max-w-(--breakpoint-sm) mx-auto px-4 py-2">
        {!hasStarted ? (
          /* SCREEN A: LANDING PAGE */
          <div className="space-y-8 py-4 sm:py-8 animate-in fade-in duration-300">
            
            {/* Hero Card */}
            <div className="bg-manila border-2 border-manila-deep rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-paper/80 border border-rule text-ink-soft font-clinical text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-signal" />
                <span>Ochsner Health & Nexus LA Innovation Companion</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink leading-tight m-0">
                You're waiting on answers. Here's what's happening, and what to ask.
              </h1>

              <p className="text-lg sm:text-xl text-ink-soft leading-relaxed m-0">
                The stretch between "something suspicious was found" and "I have a treatment plan" is confusing and quiet. BEACON makes that window visible and survivable.
              </p>

              {/* Entry Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleStart('patient')}
                  className="flex-1 inline-flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-sans text-lg font-bold bg-signal text-paper hover:bg-signal/90 transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  <User className="w-5 h-5" />
                  <span>I'm the Patient</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </button>

                <button
                  onClick={() => handleStart('caregiver')}
                  className="flex-1 inline-flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-sans text-lg font-bold bg-paper border-2 border-rule text-ink hover:bg-manila/40 transition-all shadow-xs cursor-pointer"
                >
                  <HeartHandshake className="w-5 h-5 text-signal" />
                  <span>I'm Helping Someone</span>
                  <ArrowRight className="w-5 h-5 ml-1 text-ink-soft" />
                </button>
              </div>
            </div>

            {/* Core Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-rule bg-paper space-y-1">
                <div className="flex items-center space-x-2 text-signal">
                  <Clock className="w-4 h-4" />
                  <h3 className="font-sans font-semibold text-base text-ink m-0">
                    Evidence Benchmarks
                  </h3>
                </div>
                <p className="text-sm text-ink-soft m-0">
                  Every timeline claim carries published sources (CAP, ASCO, NCI, NCCN).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-rule bg-paper space-y-1">
                <div className="flex items-center space-x-2 text-signal">
                  <ShieldCheck className="w-4 h-4" />
                  <h3 className="font-sans font-semibold text-base text-ink m-0">
                    Zero Health Data Stored
                  </h3>
                </div>
                <p className="text-sm text-ink-soft m-0">
                  No accounts, no EHR, no personal health info collected. Ever.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-rule bg-paper space-y-1">
                <div className="flex items-center space-x-2 text-signal">
                  <MapPin className="w-4 h-4" />
                  <h3 className="font-sans font-semibold text-base text-ink m-0">
                    Louisiana Navigation
                  </h3>
                </div>
                <p className="text-sm text-ink-soft m-0">
                  Hardcoded local resources across all 64 Louisiana parishes.
                </p>
              </div>
            </div>

            {/* Mandatory Landing Disclaimer */}
            <Disclaimer variant="landing" />
          </div>
        ) : (
          /* SCREEN B, C, D: SPINE FOLDER VIEW */
          <div className="animate-in fade-in duration-300">
            <SpineView
              currentStageId={stageId}
              onSelectStage={(id) => setStageId(id)}
              dateEntered={dateEntered}
              onDateChange={(d) => setDateEntered(d)}
              parishSlug={parishSlug}
              onParishChange={(p) => setParishSlug(p)}
              mode={mode}
              onOpenShareModal={() => setIsShareModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Persistent Footer Disclaimer */}
      <footer className="w-full max-w-(--breakpoint-sm) mx-auto px-4 pb-8">
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
        parishSlug={parishSlug}
      />

      {/* Atlas Placeholder Modal */}
      <AtlasModal
        isOpen={isAtlasModalOpen}
        onClose={() => setIsAtlasModalOpen(false)}
      />
    </div>
  );
}
