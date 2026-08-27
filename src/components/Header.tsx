import React from 'react';
import { User, HeartHandshake, MapPin } from 'lucide-react';
import { BeaconLogo } from './BeaconLogo';
import { BackButton } from './BackButton';

interface HeaderProps {
  mode: 'patient' | 'caregiver';
  onModeChange: (newMode: 'patient' | 'caregiver') => void;
  onOpenAtlas: () => void;
  onGoHome?: () => void;
  showBack?: boolean;
  onGoBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  onOpenAtlas,
  onGoHome,
  showBack = false,
  onGoBack
}) => {
  return (
    <header className="w-full bg-paper border-b border-rule">
      <div className="w-full px-6 lg:px-10 xl:px-12 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          {showBack && onGoBack && <BackButton onClick={onGoBack} />}
          <button
            onClick={onGoHome}
            className="flex items-center space-x-3 text-left cursor-pointer bg-transparent border-0 p-0 focus:outline-none focus:ring-2 focus:ring-signal rounded-lg"
            title="Return to BEACON Home"
          >
            <BeaconLogo size="sm" showWordmark={true} />
          </button>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
          <div className="relative inline-flex bg-paper p-1.5 rounded-xl border border-rule shadow-xs">
            <button
              onClick={() => onModeChange('patient')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-sans text-sm sm:text-base font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal ${
                mode === 'patient'
                  ? 'bg-signal text-paper shadow-md'
                  : 'text-ink-soft hover:text-ink hover:bg-paper'
              }`}
              aria-label="Switch to Patient View"
            >
              <User className="w-5 h-5" />
              <span>Patient</span>
            </button>
            <button
              onClick={() => onModeChange('caregiver')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-sans text-sm sm:text-base font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal ${
                mode === 'caregiver'
                  ? 'bg-signal text-paper shadow-md'
                  : 'text-ink-soft hover:text-ink hover:bg-paper'
              }`}
              aria-label="Switch to Caregiver View"
            >
              <HeartHandshake className="w-5 h-5" />
              <span>Caregiver</span>
            </button>
          </div>

          <button
            onClick={onOpenAtlas}
            className="p-3 rounded-xl border border-rule bg-paper hover:bg-signal-light text-ink-soft hover:text-ink transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal"
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
