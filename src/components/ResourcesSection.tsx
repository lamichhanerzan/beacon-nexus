import React from 'react';
import { RESOURCES, RESOURCES_FOOTER_NOTE } from '../content/resources';
import { Phone } from 'lucide-react';

export const ResourcesSection: React.FC = () => {
  return (
    <section className="my-8 rounded-lg border border-rule bg-paper p-5 sm:p-6 shadow-sm">
      <h3 className="font-display text-xl font-semibold text-ink mb-1">
        Louisiana Resources
      </h3>
      <p className="text-sm text-ink-soft mb-4">
        Free navigation, transport, social work, and helpline services available to residents:
      </p>

      <div className="space-y-3">
        {RESOURCES.map((r, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-md border border-rule/70 bg-paper/60 hover:bg-manila/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex-1">
              <h4 className="font-semibold text-base text-ink m-0 flex items-center gap-2">
                {r.name}
              </h4>
              <p className="text-sm text-ink-soft m-0 mt-0.5">{r.description}</p>
            </div>

            {r.telLink ? (
              <a
                href={r.telLink}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded font-clinical text-sm font-semibold bg-signal text-paper hover:bg-signal/90 transition-colors shrink-0 self-start sm:self-center"
              >
                <Phone className="w-4 h-4" />
                <span>{r.number}</span>
              </a>
            ) : (
              <span className="font-clinical text-xs text-ink-soft italic shrink-0">
                Contact via Medicaid card
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-ink-soft font-clinical italic text-right m-0">
        {RESOURCES_FOOTER_NOTE}
      </p>
    </section>
  );
};
