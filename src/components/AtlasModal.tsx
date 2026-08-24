import React from 'react';
import { Map, X, Clock } from 'lucide-react';

interface AtlasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtlasModal: React.FC<AtlasModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
      <div className="bg-paper border-2 border-rule rounded-xl max-w-md w-full p-6 shadow-xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-ink-soft hover:text-ink rounded-full hover:bg-manila/50 transition-colors"
          aria-label="Close atlas preview"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto w-14 h-14 rounded-full bg-signal-light flex items-center justify-center text-signal mb-4">
          <Map className="w-7 h-7" />
        </div>

        <h3 className="font-display text-2xl font-semibold text-ink mb-2">
          Louisiana Parish Atlas
        </h3>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-manila text-ink font-clinical text-xs font-semibold mb-4">
          <Clock className="w-3.5 h-3.5" />
          <span>Coming Next in Phase 2</span>
        </div>

        <p className="text-base text-ink-soft leading-relaxed mb-6">
          The Parish Atlas will visualize geographic access patterns and clinical navigation resources across all 64 Louisiana parishes, helping patients identify regional care coordination support.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-md font-sans text-base font-semibold bg-signal text-paper hover:bg-signal/90 transition-colors cursor-pointer"
        >
          Return to Companion
        </button>
      </div>
    </div>
  );
};
