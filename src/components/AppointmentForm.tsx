import React, { useState } from 'react';
import { APPOINTMENT_TYPES } from '../content/appointments';
import { Calendar, Clock, User, MapPin, X, Plus } from 'lucide-react';

export interface UserAppointment {
  id: string;
  typeId: string;
  date: string; // 'YYYY-MM-DD'
  time?: string; // 'HH:MM'
  doctorName?: string;
  location?: string;
}

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: UserAppointment) => void;
  initialDate?: string;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate
}) => {
  const [typeId, setTypeId] = useState<string>(APPOINTMENT_TYPES[0].id);
  const [date, setDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState<string>('');
  const [doctorName, setDoctorName] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !typeId) return;

    const newAppt: UserAppointment = {
      id: `appt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      typeId,
      date,
      time: time || undefined,
      doctorName: doctorName.trim() || undefined,
      location: location.trim() || undefined
    };

    onSave(newAppt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-paper border-2 border-rule rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rule/60 pb-3">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-signal" />
            <h2 className="font-display text-xl font-bold text-ink m-0">
              Add New Appointment
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-ink-soft hover:text-ink hover:bg-manila/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Type of Appointment Dropdown */}
          <div className="space-y-1.5">
            <label className="block font-sans text-sm font-semibold text-ink">
              Type of Appointment <span className="text-signal">*</span>
            </label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-rule bg-paper font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal"
            >
              {APPOINTMENT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="flex items-center space-x-1.5 font-sans text-sm font-semibold text-ink">
                <Calendar className="w-4 h-4 text-signal" />
                <span>Date <span className="text-signal">*</span></span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-rule bg-paper font-clinical text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center space-x-1.5 font-sans text-sm font-semibold text-ink">
                <Clock className="w-4 h-4 text-ink-soft" />
                <span>Time (optional)</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-rule bg-paper font-clinical text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal"
              />
            </div>
          </div>

          {/* Who it's with */}
          <div className="space-y-1">
            <label className="flex items-center space-x-1.5 font-sans text-sm font-semibold text-ink">
              <User className="w-4 h-4 text-ink-soft" />
              <span>Who it's with (optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Smith"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-rule bg-paper font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal"
            />
            <p className="text-xs text-ink-soft italic m-0">
              Optional, and kept on your device only. Never included when you share.
            </p>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="flex items-center space-x-1.5 font-sans text-sm font-semibold text-ink">
              <MapPin className="w-4 h-4 text-ink-soft" />
              <span>Location / Facility (optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ochsner Cancer Center, 2nd Floor"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-rule bg-paper font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal"
            />
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-rule/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-sans text-sm font-semibold text-ink-soft hover:text-ink hover:bg-manila/30 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg font-sans text-sm font-bold bg-signal text-paper hover:bg-signal/90 transition-colors shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal"
            >
              Save Appointment
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
