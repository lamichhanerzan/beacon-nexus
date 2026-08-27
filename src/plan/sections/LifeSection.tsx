import React from 'react';
import { usePlanStore, getSectionCompletion } from '../store';
import { SectionHeader } from '../components/SectionHeader';
import { BandSelect } from '../components/BandSelect';
import { GatedQuestion } from '../components/GatedQuestion';
import { GuidanceCard } from '../components/GuidanceCard';
import { InlinePrompt } from '../components/InlinePrompt';
import { SearchableCombobox } from '../components/SearchableCombobox';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'Vietnamese', 'Chinese (Mandarin)', 'Chinese (Cantonese)',
  'Arabic', 'Korean', 'Tagalog', 'Hindi', 'Portuguese', 'Russian', 'Haitian Creole',
  'Polish', 'Italian', 'German', 'Japanese', 'Urdu', 'Gujarati', 'Other',
].map((l) => ({ label: l, value: l.toLowerCase().replace(/[^a-z]/g, '_') }));

export const LifeSection: React.FC = () => {
  const { profile, setField } = usePlanStore();
  const { answered, total } = getSectionCompletion(profile, 'life');
  const isEmployed = profile.employment === 'full_time' || profile.employment === 'part_time';
  const fmlaEligible = isEmployed && profile.employerSize === '50plus' && profile.tenureOver12mo === 'yes';

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <SectionHeader
        title="Work & Daily Life"
        description="Leave, transport, caregiving, and childcare."
        answered={answered}
        total={total}
      />

      {/* Q1: Employment */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">What is your work situation?</h3>
        <BandSelect
          options={[
            { label: 'Full time', value: 'full_time' },
            { label: 'Part time', value: 'part_time' },
            { label: 'Self-employed', value: 'self_employed' },
            { label: 'Not currently working', value: 'not_working' },
            { label: 'Retired', value: 'retired' },
            { label: 'Student', value: 'student' },
          ]}
          value={profile.employment}
          onChange={(v) => setField('employment', v as any)}
          includeUnsure={false}
        />
      </div>

      {/* Q2: Employer size (employed only) */}
      <GatedQuestion show={isEmployed}>
        <div className="space-y-3">
          <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Roughly how large is your employer?</h3>
          <p className="text-sm text-[#5A5751] m-0">This determines whether federal job-protected leave applies to you.</p>
          <BandSelect
            options={[
              { label: 'Under 50 people', value: 'under50' },
              { label: '50 or more', value: '50plus' },
            ]}
            value={profile.employerSize}
            onChange={(v) => setField('employerSize', v as any)}
          />
        </div>
      </GatedQuestion>

      {/* Q3: Tenure (employed only) */}
      <GatedQuestion show={isEmployed}>
        <div className="space-y-3">
          <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Have you worked there over a year?</h3>
          <BandSelect
            options={[
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },
            ]}
            value={profile.tenureOver12mo}
            onChange={(v) => setField('tenureOver12mo', v as any)}
          />
        </div>
      </GatedQuestion>

      {/* Q4: Paid leave */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">How much paid time off do you have for appointments?</h3>
        <BandSelect
          options={[
            { label: 'Plenty', value: 'plenty' },
            { label: 'Some but limited', value: 'limited' },
            { label: 'None', value: 'none' },
          ]}
          value={profile.paidLeave}
          onChange={(v) => setField('paidLeave', v as any)}
        />
      </div>

      {/* Q5: Transport */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">How will you get to appointments?</h3>
        <BandSelect
          options={[
            { label: 'My own car', value: 'own_car' },
            { label: 'Someone drives me', value: 'someone_drives' },
            { label: 'Public transit or rideshare', value: 'transit_rideshare' },
            { label: 'No reliable way right now', value: 'none_reliable' },
          ]}
          value={profile.transport}
          onChange={(v) => setField('transport', v as any)}
          includeUnsure={false}
        />
      </div>

      {/* Q6: Travel time */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">How long is the trip each way?</h3>
        <BandSelect
          options={[
            { label: 'Under 30 min', value: 'under30' },
            { label: '30 to 60 min', value: '30_60' },
            { label: '1 to 2 hours', value: '60_120' },
            { label: 'Over 2 hours', value: 'over120' },
          ]}
          value={profile.travelTimeBand}
          onChange={(v) => setField('travelTimeBand', v as any)}
          includeUnsure={false}
        />
      </div>

      {/* Q7: Caregiver */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Is someone helping you through this?</h3>
        <BandSelect
          options={[
            { label: 'Yes, lives with me', value: 'lives_with' },
            { label: 'Yes, nearby', value: 'nearby' },
            { label: 'Yes, but far away', value: 'far' },
            { label: 'Not really', value: 'none' },
          ]}
          value={profile.caregiver}
          onChange={(v) => setField('caregiver', v as any)}
          includeUnsure={false}
        />
      </div>

      {/* Q8: Dependents */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Anyone at home depending on you?</h3>
        <BandSelect
          options={[
            { label: 'No one', value: 'none' },
            { label: 'Children', value: 'children' },
            { label: 'An older adult', value: 'elder' },
            { label: 'Both', value: 'both' },
          ]}
          value={profile.dependentsAtHome}
          onChange={(v) => setField('dependentsAtHome', v as any)}
          includeUnsure={false}
        />
      </div>

      {/* Q9: ZIP prefix */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">First 3 digits of your ZIP</h3>
        <p className="text-sm text-[#5A5751]/70 m-0">Only used to find nearby facilities. We never store your full ZIP.</p>
        <input
          type="text"
          maxLength={3}
          value={profile.zipPrefix || ''}
          onChange={(e) => setField('zipPrefix', e.target.value.replace(/\D/g, '').slice(0, 3) || null)}
          placeholder="e.g. 712"
          className="w-32 px-4 py-3 rounded-xl border-2 border-[#E4E1DA] bg-white font-mono text-xl text-center text-[#1C1B19] focus:ring-2 focus:ring-[#2F5D50] focus:border-[#2F5D50]"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        />
      </div>

      {/* Q10: Language */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Preferred language</h3>
        <SearchableCombobox
          options={LANGUAGES}
          value={profile.language}
          onChange={(v) => setField('language', v || null)}
          placeholder="Search language..."
        />
      </div>

      {/* GUIDANCE PANEL */}
      <div className="pt-8 border-t border-[#E4E1DA] space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#1C1B19] m-0" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Work and life guidance</h2>

        {/* FMLA */}
        {isEmployed && profile.employerSize && (
          fmlaEligible ? (
            <GuidanceCard title="You likely qualify for FMLA leave" source="Family and Medical Leave Act, 29 USC §2601">
              <p className="m-0">The Family and Medical Leave Act provides up to 12 weeks of unpaid, job-protected leave per year for a serious health condition. Your employer has 50+ employees and you have worked there over 12 months.</p>
              <p className="m-0 text-sm"><strong>Action:</strong> Talk to your HR department about FMLA paperwork. Your doctor will need to certify the medical necessity. State programs may provide partial wage replacement in addition.</p>
              <p className="m-0 text-xs italic">This is informational, not legal advice.</p>
            </GuidanceCard>
          ) : (
            <GuidanceCard title="FMLA may not apply" source="Family and Medical Leave Act, 29 USC §2601">
              <p className="m-0">
                {profile.employerSize === 'under50' && 'FMLA applies to employers with 50 or more employees. Your employer may still offer leave — ask HR.'}
                {profile.tenureOver12mo === 'no' && 'FMLA requires at least 12 months of employment. You may still qualify for other protections.'}
                {profile.employerSize === 'unsure' && 'Check with HR whether your employer has 50 or more employees. That determines FMLA eligibility.'}
              </p>
              <p className="m-0 text-xs italic">State-level protections vary. This is informational, not legal advice.</p>
            </GuidanceCard>
          )
        )}

        {/* Transport guidance */}
        {(profile.transport === 'none_reliable' || profile.transport === 'transit_rideshare') && (
          <GuidanceCard title="Transportation assistance" source="American Cancer Society; Patient Advocate Foundation">
            <p className="m-0">Several programs can help with transportation to cancer treatment:</p>
            <ul className="pl-5 space-y-1 m-0 text-sm">
              <li>American Cancer Society Road to Recovery: volunteer drivers to treatment. Call 1-800-227-2345.</li>
              <li>Patient Advocate Foundation: transportation grants for eligible patients.</li>
              <li>Angel Flight: free air travel for treatment if you need to travel long distances.</li>
              <li>Your cancer center may have its own shuttle service or rideshare partnerships.</li>
            </ul>
          </GuidanceCard>
        )}

        {/* Dependents */}
        {profile.dependentsAtHome && profile.dependentsAtHome !== 'none' && (
          <GuidanceCard title="Help with dependents during treatment" source="CancerCare Financial Assistance Program">
            <p className="m-0">CancerCare provides grants that cover childcare and home care — categories most other programs do not fund. Apply at cancercare.org or call 1-800-813-HOPE.</p>
          </GuidanceCard>
        )}

        {!isEmployed && profile.employment && profile.employment !== 'retired' && profile.employment !== 'student' && (
          <InlinePrompt message="If you stopped working due to your condition, you may qualify for SSDI. See the Cost section for details." />
        )}
      </div>
    </div>
  );
};
