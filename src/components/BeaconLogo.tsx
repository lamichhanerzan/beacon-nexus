import React from 'react';

interface BeaconLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
}

export const BeaconLogo: React.FC<BeaconLogoProps> = ({
  size = 'md',
  showWordmark = true,
  className = ''
}) => {
  // Height sizing
  const markHeight = size === 'sm' ? 32 : size === 'md' ? 44 : size === 'lg' ? 72 : 100;
  const wordmarkSize = size === 'sm' ? 'text-xl' : size === 'md' ? 'text-2xl' : size === 'lg' ? 'text-4xl' : 'text-5xl';

  return (
    <div className={`inline-flex items-center space-x-3 text-ink ${className}`}>
      {/* Lighthouse Ribbon Mark SVG */}
      <svg
        height={markHeight}
        viewBox="0 0 100 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-colors"
        aria-hidden="true"
      >
        {/* Light rays at the top */}
        <path d="M 50 12 L 50 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <path d="M 36 18 L 26 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <path d="M 64 18 L 74 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <path d="M 28 30 L 16 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <path d="M 72 30 L 84 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

        {/* Lighthouse Top Dome & Light Room */}
        <path d="M 40 32 C 40 25 60 25 60 32 Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <rect x="42" y="32" width="16" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M 50 32 L 50 44" stroke="currentColor" strokeWidth="2" opacity="0.7" />
        <path d="M 37 44 L 63 44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

        {/* Intertwined Awareness Ribbon / Lighthouse Body */}
        <path
          d="M 41 44
             C 38 60, 32 75, 28 92
             C 25 105, 30 118, 42 120
             C 54 122, 60 110, 52 95
             C 44 80, 54 62, 59 44"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M 59 44
             C 62 60, 68 75, 72 92
             C 75 105, 70 118, 58 120
             C 46 122, 40 110, 48 95
             C 56 80, 46 62, 41 44"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner Flame / Light Core */}
        <path
          d="M 50 72 C 45 80 47 90 50 94 C 53 90 55 80 50 72 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Wordmark (Optically aligned on baseline) */}
      {showWordmark && (
        <div className="flex flex-col justify-center">
          <span className={`font-display font-bold tracking-tight text-ink leading-none ${wordmarkSize}`}>
            BEACON
          </span>
        </div>
      )}
    </div>
  );
};
