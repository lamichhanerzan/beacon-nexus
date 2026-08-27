import React, { useState } from 'react';
import type { UserAppointment } from './AppointmentForm';
import { APPOINTMENT_TYPES } from '../content/appointments';
import { formatCaregiverText } from '../lib/caregiverGrammar';
import { Calendar, Clock, MapPin, User as UserIcon, Printer, Share2, ChevronDown, ChevronUp, CheckSquare, Square, ArrowLeft, HelpCircle, ShieldCheck } from 'lucide-react';

interface AppointmentPrepSheetProps {
  appointment: UserAppointment;
  mode: 'patient' | 'caregiver';
  onBack: () => void;
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

export const AppointmentPrepSheet: React.FC<AppointmentPrepSheetProps> = ({
  appointment,
  mode,
  onBack
}) => {
  const isCaregiver = mode === 'caregiver';
  const apptType = APPOINTMENT_TYPES.find((t) => t.id === appointment.typeId) || APPOINTMENT_TYPES[0];

  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [askedQuestions, setAskedQuestions] = useState<Record<number, boolean>>({});
  const [expandedWhy, setExpandedWhy] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const countdownText = getCountdownText(appointment.date);
  const formattedDate = new Date(appointment.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-300 print:p-0 print:m-0 print:w-full print:max-w-none">
      
      {/* Top Breadcrumb & Actions Bar (Hidden on Print) */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 font-clinical text-xs font-semibold text-signal hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Calendar & Appointments</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg font-sans text-xs font-semibold bg-manila hover:bg-manila-deep text-ink transition-colors border border-rule cursor-pointer"
          >
            <Printer className="w-4 h-4 text-signal" />
            <span>Print Worksheet</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg font-sans text-xs font-semibold bg-signal text-paper hover:bg-signal/90 transition-colors shadow-xs cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Link Copied!' : 'Share Sheet'}</span>
          </button>
        </div>
      </div>

      {/* PRINT HEADER ONLY (Visible when printing) */}
      <div className="hidden print:block mb-4 border-b-2 border-black pb-3">
        <div className="flex justify-between items-baseline">
          <h1 className="text-2xl font-bold text-black m-0">BEACON Appointment Preparation Sheet</h1>
          <span className="text-sm font-mono text-black">{formattedDate}</span>
        </div>
        <p className="text-xs text-black italic m-0 mt-1">
          Educational appointment preparation sheet • Built for Ochsner Health & Nexus LA innovation companion
        </p>
      </div>

      {/* MAIN HEADER CARD */}
      <div className="bg-manila border-2 border-manila-deep rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 print:bg-white print:border-black print:p-4 print:rounded-none">
        <div className="flex items-center justify-between">
          <span className="font-clinical text-xs font-bold text-signal uppercase tracking-wider">
            Appointment Prep Guide
          </span>
          <span className="font-clinical text-xs font-bold px-3 py-1 rounded-full bg-paper border border-rule text-ink uppercase">
            {countdownText}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink leading-tight m-0 print:text-2xl print:text-black">
          {apptType.label}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-ink-soft pt-1 font-sans">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-signal" />
            <span className="font-medium text-ink">{formattedDate}</span>
          </div>

          {appointment.time && (
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-signal" />
              <span>{appointment.time}</span>
            </div>
          )}

          {/* Doctor name — displayed on screen/print, BUT NEVER INCLUDED IN SHARE URL */}
          {appointment.doctorName && (
            <div className="flex items-center space-x-1.5">
              <UserIcon className="w-4 h-4 text-ink-soft" />
              <span>With: <strong>{appointment.doctorName}</strong></span>
            </div>
          )}

          {appointment.location && (
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-ink-soft" />
              <span>At: {appointment.location}</span>
            </div>
          )}

          <div className="font-clinical text-xs text-ink-soft">
            (Typical length: {apptType.typicalLength})
          </div>
        </div>
      </div>

      {/* SECTION 1: WHAT THIS APPOINTMENT IS */}
      <div className="p-6 rounded-xl border border-rule bg-paper shadow-xs space-y-2 print:border-black print:shadow-none print:p-4">
        <h3 className="font-display text-xl font-bold text-ink m-0">
          What this appointment is
        </h3>
        <p className="text-base text-ink leading-relaxed m-0 font-medium">
          {formatCaregiverText(apptType.whatThisIs, isCaregiver)}
        </p>
      </div>

      {/* SECTION 2: WHAT USUALLY HAPPENS */}
      <div className="p-6 rounded-xl border border-rule bg-paper shadow-xs space-y-3 print:border-black print:shadow-none print:p-4">
        <h3 className="font-display text-xl font-bold text-ink m-0">
          What usually happens
        </h3>
        <ol className="list-decimal list-inside space-y-2 m-0 text-base text-ink leading-relaxed font-sans pl-1">
          {apptType.whatHappens.map((step, idx) => (
            <li key={idx} className="pl-1">
              {formatCaregiverText(step, isCaregiver)}
            </li>
          ))}
        </ol>
      </div>

      {/* SECTION 3: WHAT YOU'LL LEARN FROM IT */}
      <div className="p-5 rounded-xl border border-rule bg-manila/30 space-y-2 print:border-black print:bg-white print:p-4">
        <h3 className="font-display text-lg font-bold text-ink m-0 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-signal" />
          <span>What {isCaregiver ? 'they' : 'you'}'ll learn from it</span>
        </h3>
        <p className="text-base text-ink leading-relaxed m-0">
          {formatCaregiverText(apptType.whatItTellsYou, isCaregiver)}
        </p>
      </div>

      {/* CAREGIVER SPECIFIC GUIDANCE BLOCK (if Caregiver mode active) */}
      {isCaregiver && (
        <div className="p-6 rounded-xl border-2 border-signal bg-signal-light/30 space-y-3 print:border-black">
          <h3 className="font-display text-xl font-bold text-signal m-0">
            Caregiver Guidance for this Visit
          </h3>
          <ul className="space-y-2 m-0 p-0 list-none">
            {apptType.caregiverNotes.map((note, nIdx) => (
              <li key={nIdx} className="p-3 rounded-lg bg-paper border border-rule text-sm text-ink flex items-start space-x-2.5">
                <span className="font-clinical font-bold text-signal text-sm mt-0.5">✓</span>
                <span>{formatCaregiverText(note, true)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SECTION 4: BRING WITH YOU CHECKLIST */}
      <div className="p-6 rounded-xl border border-rule bg-paper shadow-xs space-y-4 print:border-black print:shadow-none print:p-4">
        <h3 className="font-display text-xl font-bold text-ink m-0">
          Bring with {isCaregiver ? 'them' : 'you'}
        </h3>

        <div className="space-y-2">
          {apptType.bringWith.map((item, bIdx) => {
            const isChecked = !!checkedItems[bIdx];
            return (
              <div
                key={bIdx}
                onClick={() => toggleCheckItem(bIdx)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-start space-x-3 ${
                  isChecked
                    ? 'bg-manila/30 border-rule/60 text-ink-soft line-through'
                    : 'bg-paper hover:bg-manila/20 border-rule text-ink'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-signal" />
                  ) : (
                    <Square className="w-5 h-5 text-ink-soft" />
                  )}
                </div>
                <span className="font-sans text-base leading-snug">
                  {formatCaregiverText(item, isCaregiver)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: QUESTIONS TO ASK (WITH CLINICAL WHY RATIONALE) */}
      <div className="p-6 rounded-xl border border-rule bg-paper shadow-xs space-y-4 print:border-black print:shadow-none print:p-4">
        <div className="flex items-center justify-between border-b border-rule/60 pb-3">
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-ink m-0">
              Questions to ask
            </h3>
            <p className="text-xs text-ink-soft m-0 mt-0.5">
              Tap any question to mark it as asked, or tap "Why ask this?" to reveal the clinical rationale.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {apptType.questions.map((q, qIdx) => {
            const isAsked = !!askedQuestions[qIdx];
            const isWhyOpen = !!expandedWhy[qIdx];

            return (
              <div
                key={qIdx}
                className={`p-4 rounded-xl border transition-all ${
                  isAsked
                    ? 'bg-manila/20 border-rule/60 text-ink-soft'
                    : 'bg-paper border-rule shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => toggleAskedQuestion(qIdx)}
                    className="flex-1 flex items-start space-x-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal rounded-md"
                  >
                    <div className="shrink-0 mt-0.5">
                      {isAsked ? (
                        <CheckSquare className="w-5 h-5 text-signal" />
                      ) : (
                        <Square className="w-5 h-5 text-ink-soft" />
                      )}
                    </div>
                    <div>
                      <span className={`font-sans text-base sm:text-lg font-bold block leading-snug ${isAsked ? 'line-through text-ink-soft' : 'text-ink'}`}>
                        "{formatCaregiverText(q.text, isCaregiver)}"
                      </span>
                      <span className="font-clinical text-[11px] font-bold text-signal uppercase tracking-wider block mt-1">
                        Source: {q.source}
                      </span>
                    </div>
                  </button>

                  {/* Why rationale toggle button (hidden on print) */}
                  <button
                    onClick={() => toggleExpandWhy(qIdx)}
                    className="shrink-0 inline-flex items-center space-x-1 px-2.5 py-1 rounded-md font-clinical text-xs font-semibold bg-manila hover:bg-manila-deep text-ink transition-colors border border-rule cursor-pointer print:hidden"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-signal" />
                    <span>Why ask this?</span>
                    {isWhyOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Why rationale content (Expanded or automatically visible on print) */}
                <div className={`mt-3 p-3.5 rounded-lg bg-manila/30 border border-rule space-y-1 ${isWhyOpen ? 'block' : 'hidden print:block'}`}>
                  <span className="font-clinical text-xs font-bold text-signal uppercase tracking-wider block">
                    Clinical Rationale (Why this matters):
                  </span>
                  <p className="text-sm text-ink leading-relaxed m-0 font-medium">
                    {formatCaregiverText(q.why, isCaregiver)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 6: BEFORE YOU LEAVE, CONFIRM */}
      <div className="p-5 rounded-xl border border-rule bg-paper shadow-xs space-y-2 print:border-black print:p-4">
        <h3 className="font-display text-lg font-bold text-ink m-0">
          Before {isCaregiver ? 'they leave' : 'you leave'}, confirm:
        </h3>
        <p className="text-base text-ink leading-relaxed m-0 font-medium">
          {formatCaregiverText(apptType.afterward, isCaregiver)}
        </p>
      </div>

      {/* SECTION 7: BLANK RULED NOTES SPACE (Printed on paper physically) */}
      <div className="p-6 rounded-xl border border-rule bg-paper shadow-xs space-y-4 print:border-black print:p-4">
        <h3 className="font-display text-xl font-bold text-ink m-0">
          Notes during the visit
        </h3>

        {/* Ruled lines background for printing */}
        <div className="w-full space-y-6 pt-2">
          <div className="border-b border-rule/60 h-6"></div>
          <div className="border-b border-rule/60 h-6"></div>
          <div className="border-b border-rule/60 h-6"></div>
          <div className="border-b border-rule/60 h-6"></div>
        </div>
      </div>

      {/* Bottom Print / Share action bar */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 inline-flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl font-sans text-base font-semibold bg-manila hover:bg-manila-deep text-ink transition-colors border border-rule cursor-pointer"
        >
          <Printer className="w-5 h-5 text-signal" />
          <span>Print Physical Copy</span>
        </button>

        <button
          onClick={handleShare}
          className="flex-1 inline-flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl font-sans text-base font-semibold bg-signal text-paper hover:bg-signal/90 transition-colors shadow-xs cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
          <span>{copied ? 'Link Copied!' : 'Share Sheet'}</span>
        </button>
      </div>

    </div>
  );
};
