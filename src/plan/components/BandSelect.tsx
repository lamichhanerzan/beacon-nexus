import React from 'react';
import { OptionCard } from './OptionCard';

interface BandOption {
  label: string;
  value: string;
  helperText?: string;
}

interface BandSelectProps {
  options: BandOption[];
  value: string | null;
  onChange: (value: string) => void;
  includeUnsure?: boolean;
}

export const BandSelect: React.FC<BandSelectProps> = ({ options, value, onChange, includeUnsure = true }) => {
  const allOptions = includeUnsure
    ? [...options, { label: 'Not sure', value: 'unsure' }]
    : options;

  return (
    <div className="space-y-3">
      {allOptions.map((opt) => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          value={opt.value}
          selected={value === opt.value}
          onSelect={onChange}
          helperText={opt.helperText}
        />
      ))}
    </div>
  );
};
