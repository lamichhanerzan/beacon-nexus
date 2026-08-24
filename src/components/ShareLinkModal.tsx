import React, { useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageId: string;
  dateEntered: string;
  stageDates?: Record<string, string>;
  parishSlug?: string;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  stageId,
  dateEntered,
  stageDates = {},
  parishSlug
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = window.location.origin;

  // 1. Attempt to build full URL with all stage dates if available
  const fullParams = new URLSearchParams();
  fullParams.set('s', stageId);
  if (dateEntered) fullParams.set('d', dateEntered);
  if (parishSlug) fullParams.set('p', parishSlug);

  const datesSerialized = Object.entries(stageDates)
    .filter(([_, dVal]) => !!dVal)
    .map(([sId, dVal]) => `${sId}:${dVal}`)
    .join(',');

  if (datesSerialized) {
    fullParams.set('dates', datesSerialized);
  }

  let shareUrl = `${origin}/c?${fullParams.toString()}`;

  // 2. Constraint Check: If URL exceeds 1500 chars, share ONLY current stage
  if (shareUrl.length > 1500) {
    const compactParams = new URLSearchParams();
    compactParams.set('s', stageId);
    if (dateEntered) compactParams.set('d', dateEntered);
    if (parishSlug) compactParams.set('p', parishSlug);
    shareUrl = `${origin}/c?${compactParams.toString()}`;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BEACON Caregiver Link',
          text: 'Here is the step I am currently in, along with caregiver actions and my journey timeline.',
          url: shareUrl
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
      <div className="bg-paper border-2 border-rule rounded-xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-ink-soft hover:text-ink rounded-full hover:bg-manila/50 transition-colors"
          aria-label="Close share dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2.5 rounded-full bg-signal-light text-signal">
            <Share2 className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-semibold text-ink m-0">
            Share with Someone Helping You
          </h3>
        </div>

        <p className="text-sm text-ink-soft mb-4 leading-relaxed">
          This link opens the **Caregiver View** for this exact stage and includes your recorded milestone dates. No personal health information or accounts are used.
        </p>

        <div className="p-3 bg-manila/30 border border-rule rounded-md font-clinical text-xs text-ink truncate mb-4 select-all">
          {shareUrl}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-sans text-base font-semibold bg-signal text-paper hover:bg-signal/90 transition-colors cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Link</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-sans text-base font-semibold bg-manila hover:bg-manila-deep text-ink transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-signal" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-ink-soft" />
                <span>Copy Share Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
