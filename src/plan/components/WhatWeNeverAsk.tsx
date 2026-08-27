import React from 'react';
import { Shield } from 'lucide-react';
import { BLOCKED_FIELDS } from '../types';

const PLAIN_LANGUAGE_EXCLUSIONS = [
  { field: 'Your name', why: 'We never need to identify you.' },
  { field: 'Your date of birth', why: 'We use age ranges instead.' },
  { field: 'Your full ZIP code', why: 'We use only the first 3 digits to find nearby facilities.' },
  { field: 'Your address', why: 'Not needed for any guidance we provide.' },
  { field: 'Your phone number', why: 'We never contact you.' },
  { field: 'Your email', why: 'We never send you anything.' },
  { field: 'Your Social Security number', why: 'Never.' },
  { field: 'Your exact income', why: 'We use federal poverty level ranges, never a dollar amount.' },
  { field: 'Exact dollar amounts you owe', why: 'We use ranges for projections.' },
  { field: 'Your medication names', why: 'We ask how drugs are delivered, never which ones.' },
  { field: 'Your biomarker or genetic test values', why: 'We ask only whether they were discussed, never what they showed.' },
  { field: 'Your symptoms', why: 'This is not a symptom checker.' },
  { field: 'Your medical record numbers', why: 'Not needed.' },
  { field: 'Any file uploads or photos', why: 'We never accept file uploads.' },
  { field: 'Your provider NPI numbers', why: 'Not needed.' },
];

export const WhatWeNeverAsk: React.FC = () => (
  <div className="max-w-2xl mx-auto space-y-8">
    <div className="pb-6 border-b border-[#E4E1DA]">
      <div className="flex items-center space-x-3">
        <Shield className="w-7 h-7 text-[#2F5D50]" />
        <h1 className="font-serif text-3xl font-bold text-[#1C1B19] m-0" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>What we never ask you</h1>
      </div>
      <p className="text-base text-[#5A5751] mt-3 m-0 leading-relaxed">
        This is not fine print. This is a feature. Here is every category of information this tool will never collect, and why.
      </p>
    </div>

    <div className="space-y-1">
      {PLAIN_LANGUAGE_EXCLUSIONS.map((item, i) => (
        <div key={i} className="flex items-start py-3.5 border-b border-[#E4E1DA]/60">
          <div className="w-8 h-8 rounded-full bg-[#2F5D50]/10 flex items-center justify-center shrink-0 mr-4 mt-0.5">
            <Shield className="w-4 h-4 text-[#2F5D50]" />
          </div>
          <div>
            <span className="font-sans text-base font-semibold text-[#1C1B19] block">{item.field}</span>
            <span className="font-sans text-sm text-[#5A5751]">{item.why}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
