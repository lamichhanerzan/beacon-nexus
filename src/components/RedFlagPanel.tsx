import React from 'react';
import { AlertCircle } from 'lucide-react';

export const RedFlagPanel: React.FC = () => {
  return (
    <section className="my-8 rounded-lg border-2 border-flag bg-flag-bg p-5 sm:p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-3">
        <AlertCircle className="w-6 h-6 text-flag shrink-0" aria-hidden="true" />
        <h3 className="font-display text-lg sm:text-xl font-semibold text-flag m-0">
          Call your care team now if you have:
        </h3>
      </div>
      
      <ul className="list-disc list-inside space-y-2 text-ink text-base sm:text-lg mb-4 pl-1">
        <li>A fever of 100.4°F (38°C) or higher</li>
        <li>Bleeding that won't stop after 10–20 minutes of firm pressure</li>
        <li>Spreading redness, warmth, swelling, or drainage at a biopsy site</li>
        <li>New or worsening back pain along with leg weakness, numbness, or loss of bladder or bowel control</li>
        <li>Swelling of your face, neck, or arms along with shortness of breath</li>
      </ul>

      <div className="pt-3 border-t border-flag/20 text-sm sm:text-base italic text-ink-soft">
        "This list can't cover everything. If something feels seriously wrong, trust that — call your care team or 911."
      </div>
    </section>
  );
};
