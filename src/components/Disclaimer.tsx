import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerProps {
  variant?: 'landing' | 'footer';
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ variant = 'footer' }) => {
  return (
    <div
      className={`rounded-lg border border-rule p-4 text-sm leading-relaxed transition-all ${
        variant === 'landing'
          ? 'bg-paper text-ink shadow-sm'
          : 'bg-paper text-ink-soft mt-8'
      }`}
    >
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-ink-soft shrink-0 mt-0.5" aria-hidden="true" />
        <p className="m-0 font-normal">
          <strong className="font-semibold text-ink">Educational software, not medical advice.</strong>{' '}
          This tool is for education only. It is not medical advice and is not a substitute for care from a professional who knows your situation. It does not diagnose anything or tell you what treatment to have. If you think you have a medical emergency, call 911. Nothing you enter is saved or sent anywhere.
        </p>
      </div>
    </div>
  );
};
