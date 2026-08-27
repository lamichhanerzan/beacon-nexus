import React from 'react';
import { User, HeartHandshake, MapPin } from 'lucide-react';
import { BeaconLogo } from './BeaconLogo';

interface HeaderProps {
  mode: 'patient' | 'caregiver';
  onModeChange: (newMode: 'patient' | 'caregiver') => void;
  onOpenAtlas: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, onModeChange, onOpenAtlas, onGoHome }) => {
  return (
    <header className="w-full max-w-6xl mx-auto mb-6 pt-4 px-3 sm:px-4">
      {/* Folder Tab Top Spine Styling */}
      <div className="bg-manila border-t-2 border-x-2 border-manila-deep rounded-t-xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <button
          onClick={onGoHome}
          className="flex items-center space-x-3 text-left cursor-pointer bg-transparent border-0 p-0 focus:outline-none focus:ring-2 focus:ring-signal rounded-lg"
          title="Return to BEACON Home"
        >
          <BeaconLogo size="sm" showWordmark={true} />
        </button>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mode Switcher Toggle */}
          <div className="relative inline-flex bg-paper p-1 rounded-lg border border-rule">
            <button
              onClick={() => onModeChange('patient')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-sans text-xs sm:text-sm font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal ${
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
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-sans text-xs sm:text-sm font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal ${
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
            className="p-2 rounded-lg border border-rule bg-paper hover:bg-manila/50 text-ink-soft hover:text-ink transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal"
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
