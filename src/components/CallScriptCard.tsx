import React, { useState } from 'react';
import { PhoneCall, Copy, Check } from 'lucide-react';

interface CallScriptCardProps {
  script: string;
  isOverdue: boolean;
  dateEntered?: string;
}

export const CallScriptCard: React.FC<CallScriptCardProps> = ({
  script,
  isOverdue,
  dateEntered
}) => {
  const [copied, setCopied] = useState(false);

  // Format script date placeholder if applicable
  const formattedDate = dateEntered
    ? new Date(dateEntered).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '[date]';

  const processedScript = script
    .replace(/\[date\]/gi, formattedDate)
    .replace(/\[N\]/gi, 'several');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(processedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy call script:', err);
    }
  };

  return (
    <div
      className={`rounded-lg p-5 sm:p-6 transition-all border ${
        isOverdue
          ? 'border-signal bg-signal-light/60 shadow-md ring-1 ring-signal/30'
          : 'border-rule bg-paper shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <PhoneCall className="w-5 h-5 text-signal" />
          <h4 className="font-display font-semibold text-lg text-ink m-0">
            {isOverdue ? "Recommended Call Script (Ready to Read)" : "What to Say When You Call"}
          </h4>
        </div>
        
        {isOverdue && (
          <span className="font-clinical text-xs font-semibold px-2.5 py-1 rounded bg-signal text-paper uppercase tracking-wider">
            Reasonable to Call
          </span>
        )}
      </div>

      <p className="text-sm text-ink-soft mb-3">
        Read these words verbatim when calling your clinic's scheduling or nursing line:
      </p>

      <blockquote className="m-0 p-4 rounded border-l-4 border-signal bg-paper font-mono text-base sm:text-lg text-ink leading-relaxed whitespace-pre-wrap select-all">
        "{processedScript}"
      </blockquote>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handleCopy}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-md font-sans text-sm font-medium bg-manila hover:bg-manila-deep text-ink transition-colors cursor-pointer focus:outline-none"
          aria-label="Copy phone call script to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-signal" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-ink-soft" />
              <span>Copy Script Text</span>
            </>
          )}
        </button>

        <span className="text-xs text-ink-soft font-clinical">
          No medical terminology required
        </span>
      </div>
    </div>
  );
};
