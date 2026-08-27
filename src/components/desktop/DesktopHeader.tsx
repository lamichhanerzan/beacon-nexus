import React from 'react';
import { User, HeartHandshake } from 'lucide-react';

export type DesktopScreen = 'landing' | 'onboard' | 'stage' | 'questions' | 'caregiver';

interface Props {
  screen: DesktopScreen;
  onScreenChange: (s: DesktopScreen) => void;
  mode: 'patient' | 'caregiver';
  onModeChange: (m: 'patient' | 'caregiver') => void;
  started: boolean;
}

const TABS: { label: string; key: DesktopScreen }[] = [
  { label: 'Stage', key: 'stage' },
  { label: 'Questions', key: 'questions' },
  { label: 'Helper', key: 'caregiver' },
];

export const DesktopHeader: React.FC<Props> = ({
  screen, onScreenChange, mode, onModeChange, started,
}) => (
  <div className="sticky top-0 z-20 bg-paper border-b border-rule">
    <div className="w-full px-8 py-3.5 flex items-center justify-between gap-6">
      <button
        onClick={() => onScreenChange('landing')}
        className="flex items-center gap-3 bg-transparent border-0 p-0 cursor-pointer text-left"
      >
        <span className="w-3 h-3 rounded-full bg-signal ring-3 ring-manila-deep shrink-0" />
        <span>
          <span className="block font-display text-2xl font-bold tracking-tight leading-none text-ink">
            BEACON
          </span>
          <span className="block font-clinical text-[10px] uppercase tracking-[0.14em] text-ink-soft mt-0.5">
            Diagnostic Limbo Companion
          </span>
        </span>
      </button>

      <div className="flex items-center gap-2.5">
        {started && (
          <div className="flex gap-1 bg-paper border border-rule rounded-[10px] p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => onScreenChange(t.key)}
                className={`px-3.5 py-2 rounded-md text-sm font-semibold cursor-pointer transition-colors ${
                  screen === t.key ? 'bg-signal text-paper' : 'bg-transparent text-ink-soft hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-1 bg-paper border border-rule rounded-[10px] p-1">
          <button
            onClick={() => onModeChange('patient')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-semibold cursor-pointer ${
              mode === 'patient' ? 'bg-signal text-paper' : 'bg-transparent text-ink-soft hover:text-ink'
            }`}
          >
            <User className="w-4 h-4" /> Patient
          </button>
          <button
            onClick={() => onModeChange('caregiver')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-semibold cursor-pointer ${
              mode === 'caregiver' ? 'bg-signal text-paper' : 'bg-transparent text-ink-soft hover:text-ink'
            }`}
          >
            <HeartHandshake className="w-4 h-4" /> Caregiver
          </button>
        </div>
      </div>
    </div>
  </div>
);
