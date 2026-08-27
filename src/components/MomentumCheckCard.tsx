import React, { useState } from 'react';
import { computeMomentum } from '../lib/forecast';
import { formatCaregiverText } from '../lib/caregiverGrammar';
import { CallScriptCard } from './CallScriptCard';
import { ShieldCheck, AlertCircle, Calendar, PhoneCall, ChevronDown, ChevronUp } from 'lucide-react';

interface MomentumCheckCardProps {
  currentStageId: string;
  daysAtCurrentStage: number;
  upcomingAppointments: Array<{ date: string; typeId: string }>;
  callScript?: string;
  dateEntered: string;
  mode: 'patient' | 'caregiver';
}

export const MomentumCheckCard: React.FC<MomentumCheckCardProps> = ({
  currentStageId,
  daysAtCurrentStage,
  upcomingAppointments,
  callScript,
  dateEntered,
  mode
}) => {
  const isCaregiver = mode === 'caregiver';
  const momentum = computeMomentum(currentStageId, daysAtCurrentStage, upcomingAppointments);
  const [showScript, setShowScript] = useState<boolean>(false);

  const scriptText =
    callScript ||
    `I am following up on my recent tests from ${dateEntered || 'several days ago'}. I haven't heard about next steps yet. What is the plan, and who schedules it?`;

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 border-2 transition-all shadow-xs space-y-4 ${
        momentum.status === 'on_track'
          ? 'bg-paper border-rule'
          : momentum.status === 'check_in'
          ? 'bg-manila/30 border-manila-deep'
          : 'bg-[#FDF2F0] border-[#F5C6C0]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {momentum.status === 'on_track' ? (
            <ShieldCheck className="w-5 h-5 text-signal" />
          ) : momentum.status === 'check_in' ? (
            <Calendar className="w-5 h-5 text-[#856828]" />
          ) : (
            <AlertCircle className="w-5 h-5 text-flag" />
          )}

          <span className="font-clinical text-xs font-bold uppercase tracking-wider text-ink-soft">
            Momentum Check
          </span>
        </div>

        <span
          className={`font-clinical text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
            momentum.status === 'on_track'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : momentum.status === 'check_in'
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-flag/10 text-flag border border-flag/30'
          }`}
        >
          {momentum.headline}
        </span>
      </div>

      <p className="font-sans text-base sm:text-lg text-ink leading-relaxed m-0 font-medium">
        {formatCaregiverText(momentum.message, isCaregiver)}
      </p>

      {/* State 3 Action: Expand Call Script when no next step is scheduled */}
      {momentum.showCallScript && (
        <div className="pt-2">
          <button
            onClick={() => setShowScript(!showScript)}
            className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl font-sans text-sm font-bold bg-flag text-paper hover:bg-flag/90 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <PhoneCall className="w-4 h-4" />
              <span>Here's what to say when you call your clinic</span>
            </div>
            {showScript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showScript && (
            <div className="mt-3 animate-in fade-in duration-200">
              <CallScriptCard
                script={scriptText}
                isOverdue={true}
                dateEntered={dateEntered}
              />
            </div>
          )}
        </div>
      )}

    </div>
  );
};
