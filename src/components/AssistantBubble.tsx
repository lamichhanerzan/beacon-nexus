import React, { useRef } from 'react';
import { BeaconLogo } from './BeaconLogo';

interface AssistantBubbleProps {
  onClick: () => void;
  isOpen: boolean;
}

export const AssistantBubble: React.FC<AssistantBubbleProps> = ({ onClick, isOpen }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (isOpen) return null;

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-15 h-15 rounded-full bg-signal text-paper shadow-lg hover:-translate-y-1 transition-all duration-200 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-4 focus:ring-signal-light"
      aria-label="Open BEACON Assistant"
      title="Open BEACON Assistant"
    >
      {/* SVG Lighthouse Mark Only (No Wordmark) */}
      <BeaconLogo size="sm" showWordmark={false} className="text-paper hover:text-paper" />
    </button>
  );
};
