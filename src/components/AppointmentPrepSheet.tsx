import React, { useState } from 'react';
import type { UserAppointment } from './AppointmentForm';
import { APPOINTMENT_TYPES } from '../content/appointments';
import { formatCaregiverText } from '../lib/caregiverGrammar';
import { STAGES } from '../content/stages';
import { BackButton } from './BackButton';
import {
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  Printer,
  Share2,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface AppointmentPrepSheetProps {
  appointment: UserAppointment;
  mode: 'patient' | 'caregiver';
  onBack: () => void;
  onOpenStage?: (stageId: string) => void;
}

function getCountdownText(dateStr: string): string {
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffDays === -1) return 'Yesterday';
  return `${Math.abs(diffDays)} days ago`;
}

function getSourceBadgeColor(source: string) {
  switch (source) {
    case 'NCI':
      return 'bg-blue-100 text-blue-900 border-blue-200';
    case 'ASCO':
      return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    case 'ACS':
      return 'bg-amber-100 text-amber-900 border-amber-200';
    case 'NCCN':
      return 'bg-purple-100 text-purple-900 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export const AppointmentPrepSheet: React.FC<AppointmentPrepSheetProps> = ({
  appointment,
  mode,
  onBack,
  onOpenStage
}) => {
  const isCaregiver = mode === 'caregiver';
  const apptType = APPOINTMENT_TYPES.find((t) => t.id === appointment.typeId) || APPOINTMENT_TYPES[0];

  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [askedQuestions, setAskedQuestions] = useState<Record<number, boolean>>({});
  const [expandedWhy, setExpandedWhy] = useState<Record<number, boolean>>({});
  const [visitNotes, setVisitNotes] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const countdownText = getCountdownText(appointment.date);
  const formattedDate = new Date(appointment.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate packed items count
  const totalItems = apptType.bringWith.length;
  const packedCount = Object.values(checkedItems).filter(Boolean).length;

  // Calculate asked questions count
  const totalQuestions = apptType.questions.length;
  const askedCount = Object.values(askedQuestions).filter(Boolean).length;

  // Matching stage context (default to 'path_wait' or biopsy stage if relevant)
  const matchingStage = STAGES.find((s) => s.id === 'path_wait') || STAGES[3];

  const toggleCheckItem = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAskedQuestion = (idx: number) => {
    setAskedQuestions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleExpandWhy = (idx: number) => {
    setExpandedWhy((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleShare = async () => {
    const origin = window.location.origin;
    // Strictly ONLY include typeId and date in share URL (NEVER doctorName or location)
    const shareUrl = `${origin}/appointments?t=${appointment.typeId}&d=${appointment.date}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `BEACON Appointment Prep: ${apptType.label}`,
          text: `Here is the appointment prep sheet for a ${apptType.label} on ${formattedDate}.`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.log('Share canceled or failed:', err);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full py-4 space-y-6 animate-in fade-in duration-300 print:p-0 print:m-0 print:max-w-none print:w-full">
      
      {/* SCREEN BACK NAVIGATION & TOP ACTIONS BAR (Hidden on Print) */}
      <div className="flex items-center justify-between print:hidden border-b border-rule/60 pb-3">
        <BackButton onClick={onBack} label="Go Back" />

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg font-sans text-xs font-semibold bg-manila hover:bg-manila-deep text-ink transition-colors border border-rule cursor-pointer"
          >
            <Printer className="w-4 h-4 text-signal" />
            <span>Print Worksheet</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg font-sans text-xs font-semibold bg-signal text-paper hover:bg-signal/90 transition-colors shadow-xs cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Link Copied!' : 'Share Sheet'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL-WIDTH DESKTOP DASHBOARD GRID LAYOUT (SCREEN VIEW) */}
      {/* Spans 95% of viewport width with 2.5% side margins on left and right */}
      {/* 3-Column Layout: Left Rail (~250px) | Center Content (Flex 1) | Right Rail (~300px) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_300px] gap-6 lg:gap-8 items-start print:hidden">
        
        {/* ------------------------------------------------------------- */}
        {/* LEFT RAIL COLUMN: APPOINTMENT INFO CARD + INDEX + ACTIONS */}
        {/* ------------------------------------------------------------- */}
        <aside className="space-y-5 lg:sticky lg:top-4">
          
          {/* APPOINTMENT HEADER CARD */}
          <div className="bg-paper border border-rule rounded-2xl p-5 shadow-xs space-y-3">
            <span className="font-clinical text-[10px] font-bold text-ink-soft uppercase tracking-widest block">
              Appointment Prep Guide
            </span>

            <h1 className="font-display text-2xl font-bold text-ink leading-snug m-0">
              {apptType.label}
            </h1>

            <div className="pt-1">
              <span className="inline-block font-clinical text-xs font-bold px-3 py-1 rounded-full bg-paper border border-rule text-signal uppercase">
                {countdownText}
              </span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-rule/50 text-xs text-ink-soft font-sans">
              <div className="flex items-center space-x-1.5 font-medium text-ink">
                <Calendar className="w-3.5 h-3.5 text-signal shrink-0" />
                <span>{formattedDate}</span>
              </div>

              {appointment.time && (
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-ink-soft shrink-0" />
                  <span>Time: {appointment.time}</span>
                </div>
              )}

              <div className="font-clinical text-[11px] text-ink-soft pt-0.5">
                Typical length: {apptType.typicalLength}
              </div>

              {appointment.doctorName && (
                <div className="flex items-center space-x-1.5 text-ink pt-1 font-semibold">
                  <UserIcon className="w-3.5 h-3.5 text-ink-soft shrink-0" />
                  <span>With: {appointment.doctorName}</span>
                </div>
              )}

              {appointment.location && (
                <div className="flex items-center space-x-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-ink-soft shrink-0" />
                  <span className="truncate">{appointment.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* ON THIS SHEET INDEX NAVIGATION */}
          <div className="bg-paper border border-rule rounded-xl p-4 shadow-2xs space-y-2">
            <span className="font-clinical text-[10px] font-bold text-ink-soft uppercase tracking-widest block">
              On this sheet
            </span>

            <div className="flex flex-col space-y-1 text-sm font-sans">
              <button
                onClick={() => scrollToSection('sec-visit')}
                className="text-left py-1 text-ink hover:text-signal transition-colors font-medium cursor-pointer"
              >
                The visit
              </button>
              <button
                onClick={() => scrollToSection('sec-happens')}
                className="text-left py-1 text-ink hover:text-signal transition-colors font-medium cursor-pointer"
              >
                What happens
              </button>
              <button
                onClick={() => scrollToSection('sec-questions')}
                className="text-left py-1 text-ink hover:text-signal transition-colors font-medium cursor-pointer"
              >
                Questions to ask
              </button>
              <button
                onClick={() => scrollToSection('sec-notes')}
                className="text-left py-1 text-ink hover:text-signal transition-colors font-medium cursor-pointer"
              >
                Notes
              </button>
            </div>
          </div>

          {/* SIDEBAR ACTION BUTTONS */}
          <div className="space-y-2.5">
            <button
              onClick={() => window.print()}
              className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-sans text-sm font-bold bg-manila hover:bg-manila-deep text-ink transition-colors border border-rule cursor-pointer"
            >
              <Printer className="w-4 h-4 text-signal" />
              <span>Print worksheet</span>
            </button>

            <button
              onClick={handleShare}
              className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-sans text-sm font-bold bg-signal text-paper hover:bg-signal/90 transition-colors shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'Link Copied!' : 'Share sheet'}</span>
            </button>
          </div>

        </aside>

        {/* ------------------------------------------------------------- */}
        {/* CENTER COLUMN: MAIN CONTENT AREA (STRETCHES FULLY ON WIDESCREEN) */}
        {/* ------------------------------------------------------------- */}
        <main className="space-y-6 min-w-0">
          
          {/* TOP ROW: 2 CARDS SIDE-BY-SIDE (WHAT THIS APPOINTMENT IS & WHAT YOU'LL LEARN) */}
          <div id="sec-visit" className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            
            {/* Card 1: What this appointment is */}
            <div className="bg-paper border border-rule rounded-2xl p-6 shadow-2xs space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-clinical text-[10px] font-bold text-ink-soft uppercase tracking-widest block">
                  What this appointment is
                </span>
                <p className="font-sans text-base sm:text-lg text-ink leading-relaxed m-0 mt-2 font-medium">
                  {formatCaregiverText(apptType.whatThisIs, isCaregiver)}
                </p>
              </div>
            </div>

            {/* Card 2: What you'll learn from it (Soft Teal Tint) */}
            <div className="bg-[#EBF4F0] border border-[#C5E1D4] rounded-2xl p-6 shadow-2xs space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-clinical text-[10px] font-bold text-emerald-800 uppercase tracking-widest block flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-signal" />
                  <span>What {isCaregiver ? 'they' : 'you'}'ll learn from it</span>
                </span>
                <p className="font-sans text-base sm:text-lg text-ink leading-relaxed m-0 mt-2 font-medium">
                  {formatCaregiverText(apptType.whatItTellsYou, isCaregiver)}
                </p>
              </div>
            </div>

          </div>

          {/* MIDDLE ROW: WHAT USUALLY HAPPENS, IN ORDER (RESPONSIVE STEP CARDS) */}
          <div id="sec-happens" className="bg-paper border border-rule rounded-2xl p-6 shadow-2xs space-y-4">
            <span className="font-clinical text-[10px] font-bold text-ink-soft uppercase tracking-widest block">
              What usually happens, in order
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {apptType.whatHappens.map((step, idx) => (
                <div key={idx} className="p-4.5 rounded-xl bg-manila/20 border border-rule/70 space-y-2 flex flex-col justify-start">
                  <span className="font-clinical text-xs font-bold text-signal">
                    0{idx + 1}
                  </span>
                  <p className="font-sans text-sm sm:text-base text-ink leading-relaxed m-0 font-medium">
                    {formatCaregiverText(step, isCaregiver)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* QUESTIONS TO ASK PANEL (GENEROUS 2-COLUMN GRID WITH WIDE BREATHING ROOM) */}
          <div id="sec-questions" className="bg-paper border border-rule rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule/60 pb-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-ink m-0">
                  Questions to ask
                </h2>
                <p className="text-xs text-ink-soft m-0 mt-0.5">
                  Tap a question to mark it asked. Open the rationale if you want to know why it matters.
                </p>
              </div>

              {/* Progress Count */}
              <div className="font-clinical text-xs font-bold text-ink-soft whitespace-nowrap">
                {askedCount} of {totalQuestions} asked
              </div>
            </div>

            {/* Generous 2-Column Question Cards Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {apptType.questions.map((q, qIdx) => {
                const isAsked = !!askedQuestions[qIdx];
                const isWhyOpen = !!expandedWhy[qIdx];

                return (
                  <div
                    key={qIdx}
                    className={`p-5 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
                      isAsked
                        ? 'bg-manila/20 border-rule/60 text-ink-soft'
                        : 'bg-paper border-rule shadow-2xs hover:border-manila-deep'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <button
                          onClick={() => toggleAskedQuestion(qIdx)}
                          className="flex items-start space-x-3 text-left cursor-pointer focus:outline-none"
                        >
                          <div className="shrink-0 mt-0.5">
                            {isAsked ? (
                              <CheckSquare className="w-5 h-5 text-signal" />
                            ) : (
                              <Square className="w-5 h-5 text-ink-soft" />
                            )}
                          </div>
                          <span className={`font-sans text-base sm:text-lg font-bold leading-snug ${isAsked ? 'line-through text-ink-soft' : 'text-ink'}`}>
                            "{formatCaregiverText(q.text, isCaregiver)}"
                          </span>
                        </button>

                        <span className={`font-clinical text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${getSourceBadgeColor(q.source)}`}>
                          {q.source}
                        </span>
                      </div>
                    </div>

                    {/* Why Ask This Toggle Button */}
                    <div>
                      <button
                        onClick={() => toggleExpandWhy(qIdx)}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-md font-clinical text-[11px] font-semibold bg-manila/60 hover:bg-manila-deep text-ink transition-colors border border-rule cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-signal" />
                        <span>WHY ASK THIS?</span>
                        {isWhyOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {/* Expanded Rationale Box */}
                      {isWhyOpen && (
                        <div className="mt-3 p-4 rounded-xl bg-manila/40 border border-rule text-sm text-ink leading-relaxed font-medium animate-in fade-in duration-200">
                          <strong className="font-clinical uppercase text-[10px] text-signal block mb-1">Clinical Rationale:</strong>
                          {formatCaregiverText(q.why, isCaregiver)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NOTES DURING THE VISIT */}
          <div id="sec-notes" className="bg-paper border border-rule rounded-2xl p-6 shadow-2xs space-y-3">
            <span className="font-clinical text-[10px] font-bold text-ink-soft uppercase tracking-widest block">
              Notes during the visit
            </span>

            <textarea
              rows={4}
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              placeholder="Write what they say here — exact words, names, dates. You will not remember it later."
              className="w-full p-4 rounded-xl border border-rule bg-paper font-sans text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-signal leading-relaxed resize-y"
            />
          </div>

        </main>

        {/* ------------------------------------------------------------- */}
        {/* RIGHT RAIL COLUMN: BRING WITH YOU + CONFIRM + STAGE CONTEXT */}
        {/* ------------------------------------------------------------- */}
        <aside className="space-y-5 lg:sticky lg:top-4">
          
          {/* BRING WITH YOU CARD */}
          <div className="bg-manila/30 border border-rule rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-rule/60 pb-2">
              <span className="font-clinical text-[10px] font-bold text-ink uppercase tracking-widest">
                Bring with {isCaregiver ? 'them' : 'you'}
              </span>
              <span className="font-clinical text-[11px] font-bold text-ink-soft">
                {packedCount} of {totalItems} packed
              </span>
            </div>

            <div className="space-y-2">
              {apptType.bringWith.map((item, bIdx) => {
                const isChecked = !!checkedItems[bIdx];
                return (
                  <div
                    key={bIdx}
                    onClick={() => toggleCheckItem(bIdx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                      isChecked
                        ? 'bg-paper/60 border-rule/60 text-ink-soft line-through'
                        : 'bg-paper hover:bg-manila/30 border-rule text-ink shadow-2xs'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-signal" />
                      ) : (
                        <Square className="w-4 h-4 text-ink-soft" />
                      )}
                    </div>
                    <span className="font-sans text-xs sm:text-sm leading-snug">
                      {formatCaregiverText(item, isCaregiver)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BEFORE YOU LEAVE, CONFIRM (RED/PINK TINT CARD) */}
          <div className="bg-[#FDF2F0] border border-[#F5C6C0] rounded-2xl p-5 shadow-2xs space-y-2">
            <span className="font-clinical text-[10px] font-bold text-flag uppercase tracking-widest block flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Before {isCaregiver ? 'they leave' : 'you leave'}, confirm</span>
            </span>

            <p className="font-sans text-sm text-ink leading-relaxed m-0 font-medium">
              {formatCaregiverText(apptType.afterward, isCaregiver)}
            </p>
          </div>

          {/* CAREGIVER GUIDANCE CARD (IF CAREGIVER MODE ACTIVE) */}
          {isCaregiver && (
            <div className="bg-signal-light/40 border-2 border-signal rounded-2xl p-5 shadow-2xs space-y-3">
              <span className="font-clinical text-[10px] font-bold text-signal uppercase tracking-widest block">
                Caregiver Guidance
              </span>
              <ul className="space-y-2 m-0 p-0 list-none text-xs text-ink">
                {apptType.caregiverNotes.map((note, nIdx) => (
                  <li key={nIdx} className="flex items-start space-x-1.5">
                    <span className="text-signal font-bold">✓</span>
                    <span>{formatCaregiverText(note, true)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* WHERE THIS SITS (DIAGNOSTIC STAGE CONTEXT) */}
          <div className="bg-paper border border-rule rounded-2xl p-5 shadow-2xs space-y-3">
            <span className="font-clinical text-[10px] font-bold text-ink-soft uppercase tracking-widest block">
              Where this sits
            </span>

            <p className="font-sans text-xs text-ink leading-relaxed m-0">
              This visit belongs to <strong className="text-ink">{matchingStage.shortLabel}</strong> in your diagnostic chart.
            </p>

            {onOpenStage && (
              <button
                onClick={() => onOpenStage(matchingStage.id)}
                className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg font-sans text-xs font-semibold bg-manila/50 hover:bg-manila text-ink transition-colors border border-rule cursor-pointer"
              >
                <span>Open that stage</span>
                <ArrowRight className="w-3.5 h-3.5 text-signal" />
              </button>
            )}
          </div>

          {/* EDUCATIONAL SOFTWARE DISCLAIMER NOTICE */}
          <div className="bg-paper/60 border border-rule/80 rounded-2xl p-4 text-xs text-ink-soft space-y-1">
            <span className="font-clinical text-[10px] font-bold uppercase tracking-widest text-ink-soft block">
              Educational software, not medical advice
            </span>
            <p className="m-0 leading-relaxed text-[11px]">
              Nothing you type here is saved or sent anywhere. If you think you have a medical emergency, call 911.
            </p>
          </div>

        </aside>

      </div>

      {/* ========================================================================= */}
      {/* OPTIMIZED A4 PRINTABLE WORKSHEET (@media print) */}
      {/* Clean high-contrast black & white page layout fitting standard A4 paper */}
      {/* ========================================================================= */}
      <div className="hidden print:block print:w-full print:text-black print:bg-white font-sans text-xs leading-normal">
        
        {/* A4 Header */}
        <div className="border-b-2 border-black pb-3 mb-4 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-black uppercase tracking-widest block">
              BEACON APPOINTMENT PREPARATION WORKSHEET
            </span>
            <h1 className="text-2xl font-bold text-black m-0">
              {apptType.label}
            </h1>
          </div>
          <div className="text-right font-mono text-xs">
            <div><strong>Date:</strong> {formattedDate}</div>
            {appointment.time && <div><strong>Time:</strong> {appointment.time}</div>}
            {appointment.doctorName && <div><strong>Doctor:</strong> {appointment.doctorName}</div>}
          </div>
        </div>

        {/* 2-Column Top Overview */}
        <div className="grid grid-cols-2 gap-4 mb-4 pb-3 border-b border-gray-400">
          <div>
            <h3 className="text-xs font-bold font-mono uppercase mb-1">What this appointment is</h3>
            <p className="text-xs m-0">{formatCaregiverText(apptType.whatThisIs, isCaregiver)}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono uppercase mb-1">What you'll learn from it</h3>
            <p className="text-xs m-0">{formatCaregiverText(apptType.whatItTellsYou, isCaregiver)}</p>
          </div>
        </div>

        {/* Sequence of Visit */}
        <div className="mb-4 pb-3 border-b border-gray-400">
          <h3 className="text-xs font-bold font-mono uppercase mb-1.5">What usually happens, in order</h3>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            {apptType.whatHappens.map((step, idx) => (
              <li key={idx}>{formatCaregiverText(step, isCaregiver)}</li>
            ))}
          </ol>
        </div>

        {/* 2-Column Grid: Questions to Ask & Bring With You */}
        <div className="grid grid-cols-3 gap-4 mb-4 pb-3 border-b border-gray-400">
          
          {/* Questions to Ask (Spans 2 columns) */}
          <div className="col-span-2 space-y-2">
            <h3 className="text-xs font-bold font-mono uppercase">Questions to ask during the visit</h3>
            <div className="space-y-2">
              {apptType.questions.map((q, qIdx) => (
                <div key={qIdx} className="border border-gray-300 p-2 rounded">
                  <div className="font-bold text-xs">
                    [  ] "{formatCaregiverText(q.text, isCaregiver)}" <span className="font-mono text-[10px]">({q.source})</span>
                  </div>
                  <div className="text-[11px] text-gray-700 mt-0.5">
                    <em>Rationale:</em> {formatCaregiverText(q.why, isCaregiver)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bring With & Confirm (1 column) */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase mb-1">Bring with you</h3>
              <ul className="space-y-1 text-xs">
                {apptType.bringWith.map((item, bIdx) => (
                  <li key={bIdx}>[  ] {formatCaregiverText(item, isCaregiver)}</li>
                ))}
              </ul>
            </div>

            <div className="border border-gray-400 p-2 rounded bg-gray-50">
              <h3 className="text-[11px] font-bold font-mono uppercase mb-0.5">Before leaving, confirm</h3>
              <p className="text-[11px] m-0">{formatCaregiverText(apptType.afterward, isCaregiver)}</p>
            </div>
          </div>

        </div>

        {/* Ruled Notes Area for A4 Physical Printing */}
        <div>
          <h3 className="text-xs font-bold font-mono uppercase mb-2">In-Room Notes & Doctor Responses</h3>
          <div className="space-y-4 pt-1">
            <div className="border-b border-gray-400 h-5"></div>
            <div className="border-b border-gray-400 h-5"></div>
            <div className="border-b border-gray-400 h-5"></div>
            <div className="border-b border-gray-400 h-5"></div>
            <div className="border-b border-gray-400 h-5"></div>
          </div>
        </div>

      </div>

    </div>
  );
};
