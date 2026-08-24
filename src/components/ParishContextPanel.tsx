import React from 'react';
import { PARISH_DATA } from '../content/parishes';
import { MapPin, Bus, Info } from 'lucide-react';

interface ParishContextPanelProps {
  parishSlug: string;
}

export const ParishContextPanel: React.FC<ParishContextPanelProps> = ({ parishSlug }) => {
  if (!parishSlug) return null;

  const parish = PARISH_DATA.find((p) => p.slug === parishSlug);
  if (!parish) return null;

  const isRural = parish.classification === 'rural';

  return (
    <div className="my-6 p-5 rounded-lg border border-rule bg-paper shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-rule/60 pb-2.5">
        <MapPin className="w-5 h-5 text-signal" />
        <h4 className="font-display font-bold text-lg text-ink uppercase tracking-wide m-0">
          {parish.name.toUpperCase()} PARISH CONTEXT
        </h4>
      </div>

      {isRural ? (
        /* RURAL PARISH LAYOUT — LEAD WITH TRANSPORTATION BLOCK */
        <div className="space-y-4">
          <div className="p-3.5 rounded bg-manila/30 border border-rule/80 space-y-2">
            <h5 className="font-sans font-semibold text-sm text-ink m-0 flex items-center space-x-2">
              <Bus className="w-4 h-4 text-signal" />
              <span>Getting to appointments:</span>
            </h5>
            <ul className="text-sm text-ink space-y-1.5 m-0 pl-4 list-disc">
              <li>
                <strong>Medicaid rides:</strong> call the number on the back of your card, 48 hours ahead
              </li>
              <li>
                <strong>American Cancer Society Road To Recovery:</strong> 1-800-227-2345
              </li>
            </ul>
          </div>

          <p className="text-sm text-ink-soft italic leading-relaxed m-0 p-3 bg-paper border-l-3 border-signal rounded-r">
            "Rural parishes in Louisiana often face longer travel times to oncology care. If distance is a barrier, ask your care team whether any visits can be virtual."
          </p>

          <div className="text-sm space-y-1 font-mono text-ink-soft pt-1">
            {parish.classification && (
              <div>
                Classification: <span className="text-ink font-semibold capitalize">{parish.classification}</span>
              </div>
            )}
            {parish.hpsa !== null && (
              <div>
                Primary care shortage area: <span className="text-ink font-semibold">{parish.hpsa ? 'Yes' : 'No'}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* URBAN PARISH LAYOUT */
        <div className="space-y-4">
          <div className="text-sm space-y-1 font-mono text-ink-soft">
            {parish.classification && (
              <div>
                Classification: <span className="text-ink font-semibold capitalize">{parish.classification}</span>
              </div>
            )}
            {parish.hpsa !== null && (
              <div>
                Primary care shortage area: <span className="text-ink font-semibold">{parish.hpsa ? 'Yes' : 'No'}</span>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded bg-manila/30 border border-rule/80 space-y-2">
            <h5 className="font-sans font-semibold text-sm text-ink m-0 flex items-center space-x-2">
              <Bus className="w-4 h-4 text-signal" />
              <span>Getting to appointments:</span>
            </h5>
            <ul className="text-sm text-ink space-y-1.5 m-0 pl-4 list-disc">
              <li>
                <strong>Medicaid rides:</strong> call the number on the back of your card, 48 hours ahead
              </li>
              <li>
                <strong>American Cancer Society Road To Recovery:</strong> 1-800-227-2345
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Footer designation attribution */}
      <div className="pt-2 border-t border-rule/40 text-xs font-clinical text-ink-soft flex items-center justify-between">
        <span className="flex items-center space-x-1">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Parish classifications from USDA and HRSA public designations.</span>
        </span>
      </div>
    </div>
  );
};
