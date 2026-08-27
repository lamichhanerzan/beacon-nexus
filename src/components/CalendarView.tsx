import React, { useState, useRef, useEffect } from 'react';
import type { UserAppointment } from './AppointmentForm';
import { APPOINTMENT_TYPES } from '../content/appointments';
import { ChevronLeft, ChevronRight, Plus, ArrowRight, X } from 'lucide-react';

interface CalendarViewProps {
  appointments: UserAppointment[];
  onSelectAppointment: (appointment: UserAppointment) => void;
  onOpenAddModal: (dateStr?: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateStr(year: number, month: number, day: number): string {
  const m = (month + 1).toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  onSelectAppointment,
  onOpenAddModal
}) => {
  const todayObj = new Date();
  const [currentYear, setCurrentYear] = useState<number>(todayObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayObj.getMonth());
  const [popoverDate, setPopoverDate] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
  const todayStr = formatDateStr(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopoverDate(null);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverDate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else { setCurrentMonth((m) => m - 1); }
    setPopoverDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else { setCurrentMonth((m) => m + 1); }
    setPopoverDate(null);
  };

  const appointmentsByDate: Record<string, UserAppointment[]> = {};
  appointments.forEach((appt) => {
    if (!appointmentsByDate[appt.date]) appointmentsByDate[appt.date] = [];
    appointmentsByDate[appt.date].push(appt);
  });

  const popoverAppts = popoverDate ? appointmentsByDate[popoverDate] || [] : [];

  return (
    <div className="bg-paper border-2 border-rule rounded-2xl shadow-xs relative overflow-hidden">
      
      {/* Calendar Header with Gradient Accent */}
      <div className="bg-gradient-to-r from-manila via-manila/80 to-manila-deep/50 px-6 py-5 flex items-center justify-between border-b border-rule">
        <h3 className="font-display text-2xl font-bold text-ink m-0 tracking-tight">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h3>

        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg bg-paper/80 border border-rule hover:bg-paper text-ink transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal shadow-2xs"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg bg-paper/80 border border-rule hover:bg-paper text-ink transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal shadow-2xs"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {DAY_NAMES.map((day) => (
            <div key={day} className="py-2 font-clinical text-[11px] font-bold text-ink-soft uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        {/* Month Grid */}
        <div className="grid grid-cols-7 gap-1.5 relative">
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty_${idx}`} className="h-12 sm:h-14" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = formatDateStr(currentYear, currentMonth, dayNum);
            const dayAppts = appointmentsByDate[dateStr] || [];
            const hasAppts = dayAppts.length > 0;
            const isToday = dateStr === todayStr;
            const isPast = new Date(dateStr + 'T00:00:00') < new Date(todayStr + 'T00:00:00');

            return (
              <div
                key={dateStr}
                onClick={() => {
                  if (hasAppts) setPopoverDate(popoverDate === dateStr ? null : dateStr);
                  else onOpenAddModal(dateStr);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (hasAppts) setPopoverDate(popoverDate === dateStr ? null : dateStr);
                    else onOpenAddModal(dateStr);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${MONTH_NAMES[currentMonth]} ${dayNum}, ${currentYear}${hasAppts ? `, ${dayAppts.length} appointment(s)` : ''}`}
                className={`h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center relative cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-signal ${
                  isToday && !hasAppts ? 'ring-2 ring-signal font-bold bg-signal/5' : ''
                } ${
                  hasAppts
                    ? isPast
                      ? 'bg-ink-soft/15 text-ink hover:bg-ink-soft/25 border border-ink-soft/20'
                      : 'bg-signal text-paper font-bold shadow-md hover:shadow-lg hover:scale-105 border border-signal'
                    : isPast
                    ? 'bg-paper/30 text-ink-soft/60 hover:bg-manila/20 border border-transparent'
                    : 'bg-paper hover:bg-manila/40 text-ink border border-rule/20 hover:border-rule/60'
                }`}
              >
                <span className={`font-clinical text-sm sm:text-base ${
                  isToday && !hasAppts ? 'text-signal font-extrabold' : ''
                }`}>
                  {dayNum}
                </span>

                {hasAppts && dayAppts.length > 1 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-manila-deep text-ink font-clinical text-[10px] font-bold flex items-center justify-center shadow-sm border border-paper">
                    {dayAppts.length}
                  </span>
                )}

                {hasAppts && dayAppts.length === 1 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-paper/70 mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* POPOVER FOR APPOINTMENTS ON A DAY */}
      {popoverDate && popoverAppts.length > 0 && (
        <div
          ref={popoverRef}
          className="absolute z-30 left-4 right-4 top-20 bg-paper border-2 border-rule rounded-xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-rule/60 pb-3">
            <span className="font-clinical text-xs font-bold text-signal uppercase tracking-wider">
              {new Date(popoverDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric'
              })}
            </span>
            <button onClick={() => setPopoverDate(null)} className="p-1.5 rounded-lg hover:bg-manila/30 text-ink-soft hover:text-ink cursor-pointer transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {popoverAppts.map((appt) => {
              const typeObj = APPOINTMENT_TYPES.find((t) => t.id === appt.typeId);
              return (
                <div key={appt.id} className="p-3.5 rounded-xl bg-manila/30 border border-rule flex items-center justify-between gap-3 hover:bg-manila/50 transition-colors">
                  <div>
                    <div className="font-sans font-bold text-sm text-ink">{typeObj?.label || 'Appointment'}</div>
                    {appt.time && <div className="font-clinical text-xs text-ink-soft mt-0.5">Time: {appt.time}</div>}
                  </div>
                  <button
                    onClick={() => { setPopoverDate(null); onSelectAppointment(appt); }}
                    className="inline-flex items-center space-x-1 px-4 py-2 rounded-lg font-sans text-xs font-bold bg-signal text-paper hover:bg-signal/90 transition-colors shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD APPOINTMENT SECTION — Properly Spaced */}
      <div className="px-6 pb-6 pt-3">
        {appointments.length === 0 ? (
          <div className="p-6 rounded-xl bg-gradient-to-br from-manila/30 to-manila/10 border-2 border-dashed border-rule text-center space-y-4">
            <p className="text-base text-ink-soft m-0 font-medium">
              No appointments yet. Add one and we'll help you prepare for it.
            </p>
            <button
              onClick={() => onOpenAddModal()}
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl font-sans text-base font-bold bg-signal text-paper hover:bg-signal/90 transition-all shadow-md hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal"
            >
              <Plus className="w-5 h-5" />
              <span>Add Appointment</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => onOpenAddModal()}
              className="inline-flex items-center space-x-2 px-8 py-3 rounded-xl font-sans text-sm font-bold bg-manila hover:bg-manila-deep text-ink transition-all border-2 border-rule hover:border-manila-deep cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal shadow-xs"
            >
              <Plus className="w-5 h-5 text-signal" />
              <span>Add Appointment</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
