import React from 'react';
import { User, HeartHandshake, MapPin } from 'lucide-react';

interface HeaderProps {
  mode: 'patient' | 'caregiver';
  onModeChange: (newMode: 'patient' | 'caregiver') => void;
  onOpenAtlas: () => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, onModeChange, onOpenAtlas }) => {
  return (
    <header className="w-full max-w-(--breakpoint-sm) mx-auto mb-6 pt-4 px-3 sm:px-0">
      {/* Folder Tab Top Spine Styling */}
      <div className="bg-manila border-t-2 border-x-2 border-manila-deep rounded-t-xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-signal ring-2 ring-manila-deep" />
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink m-0">
              BEACON
            </h1>
            <p className="font-clinical text-xs text-ink-soft m-0 uppercase tracking-wider">
              Diagnostic Limbo Companion
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode Switcher Toggle */}
          <div className="relative inline-flex bg-paper p-1 rounded-lg border border-rule">
            <button
              onClick={() => onModeChange('patient')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-sans text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === 'patient'
                  ? 'bg-signal text-paper shadow-xs'
                  : 'text-ink-soft hover:text-ink'
              }`}
              aria-label="Switch to Patient View"
            >
              <User className="w-4 h-4" />
              <span>Patient</span>
            </button>
            <button
              onClick={() => onModeChange('caregiver')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-sans text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === 'caregiver'
                  ? 'bg-signal text-paper shadow-xs'
                  : 'text-ink-soft hover:text-ink'
              }`}
              aria-label="Switch to Caregiver View"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Caregiver</span>
            </button>
          </div>

          {/* Atlas Map Link Stub */}
          <button
            onClick={onOpenAtlas}
            className="p-2 rounded-lg border border-rule bg-paper hover:bg-manila/50 text-ink-soft hover:text-ink transition-colors cursor-pointer"
            title="Parish Atlas (Coming Soon)"
            aria-label="Open Parish Atlas Placeholder"
          >
            <MapPin className="w-5 h-5 text-signal" />
          </button>
        </div>
      </div>
    </header>
  );
};
