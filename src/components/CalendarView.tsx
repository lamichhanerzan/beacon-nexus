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

  // Active popover date string ('YYYY-MM-DD')
  const [popoverDate, setPopoverDate] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

  const todayStr = formatDateStr(
    todayObj.getFullYear(),
    todayObj.getMonth(),
    todayObj.getDate()
  );

  // Close popover on Escape key or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPopoverDate(null);
      }
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
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setPopoverDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setPopoverDate(null);
  };

  // Map appointments by date string ('YYYY-MM-DD')
  const appointmentsByDate: Record<string, UserAppointment[]> = {};
  appointments.forEach((appt) => {
    if (!appointmentsByDate[appt.date]) {
      appointmentsByDate[appt.date] = [];
    }
    appointmentsByDate[appt.date].push(appt);
  });

  const popoverAppts = popoverDate ? appointmentsByDate[popoverDate] || [] : [];

  return (
    <div className="bg-paper border-2 border-rule rounded-2xl p-5 shadow-xs space-y-4 relative">
      
      {/* Calendar Top Control Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-ink m-0">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h3>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-rule bg-paper hover:bg-manila/50 text-ink transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-rule bg-paper hover:bg-manila/50 text-ink transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-clinical text-xs font-bold text-ink-soft uppercase tracking-wider">
        {DAY_NAMES.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-7 gap-1 relative">
        {/* Blank leading offset cells */}
        {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
          <div key={`empty_${idx}`} className="h-10 sm:h-12 border border-transparent" />
        ))}

        {/* Days of the Month */}
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
                if (hasAppts) {
                  setPopoverDate(popoverDate === dateStr ? null : dateStr);
                } else {
                  onOpenAddModal(dateStr);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (hasAppts) {
                    setPopoverDate(popoverDate === dateStr ? null : dateStr);
                  } else {
                    onOpenAddModal(dateStr);
                  }
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${MONTH_NAMES[currentMonth]} ${dayNum}, ${currentYear}${hasAppts ? `, ${dayAppts.length} appointment(s)` : ''}`}
              className={`h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center relative cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-signal ${
                isToday ? 'ring-2 ring-manila-deep font-bold' : ''
              } ${
                hasAppts
                  ? isPast
                    ? 'bg-ink-soft/20 text-ink hover:bg-ink-soft/30'
                    : 'bg-signal text-paper font-bold shadow-xs hover:bg-signal/90'
                  : 'bg-paper/40 hover:bg-manila/30 text-ink border border-rule/30'
              }`}
            >
              <span className="font-clinical text-xs sm:text-sm">
                {dayNum}
              </span>

              {/* Multiple appointments badge */}
              {dayAppts.length > 1 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-manila-deep text-ink font-clinical text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {dayAppts.length}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* POPOVER FOR APPOINTMENTS ON A DAY */}
      {popoverDate && popoverAppts.length > 0 && (
        <div
          ref={popoverRef}
          className="absolute z-30 left-4 right-4 top-16 bg-paper border-2 border-rule rounded-xl p-4 shadow-xl space-y-3 animate-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-rule/60 pb-2">
            <span className="font-clinical text-xs font-bold text-signal uppercase tracking-wider">
              {new Date(popoverDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <button
              onClick={() => setPopoverDate(null)}
              className="p-1 rounded text-ink-soft hover:text-ink cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {popoverAppts.map((appt) => {
              const typeObj = APPOINTMENT_TYPES.find((t) => t.id === appt.typeId);
              return (
                <div
                  key={appt.id}
                  className="p-3 rounded-lg bg-manila/30 border border-rule flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-sans font-bold text-sm text-ink">
                      {typeObj?.label || 'Appointment'}
                    </div>
                    {appt.time && (
                      <div className="font-clinical text-xs text-ink-soft">
                        Time: {appt.time}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setPopoverDate(null);
                      onSelectAppointment(appt);
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md font-sans text-xs font-bold bg-signal text-paper hover:bg-signal/90 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal"
                  >
                    <span>More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EMPTY STATE OR ADD BUTTON */}
      {appointments.length === 0 ? (
        <div className="p-4 rounded-xl bg-manila/20 border border-rule text-center space-y-3">
          <p className="text-sm text-ink-soft m-0 italic">
            "No appointments yet. Add one and we'll help you prepare for it."
          </p>
          <button
            onClick={() => onOpenAddModal()}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg font-sans text-sm font-bold bg-signal text-paper hover:bg-signal/90 transition-colors shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal"
          >
            <Plus className="w-4 h-4" />
            <span>Add Appointment</span>
          </button>
        </div>
      ) : (
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onOpenAddModal()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-sans text-xs font-bold bg-manila hover:bg-manila-deep text-ink transition-colors border border-rule cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal"
          >
            <Plus className="w-4 h-4 text-signal" />
            <span>Add Appointment</span>
          </button>
        </div>
      )}

    </div>
  );
};
