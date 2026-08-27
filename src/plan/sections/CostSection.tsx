import React from 'react';
import { usePlanStore, getSectionCompletion } from '../store';
import { SectionHeader } from '../components/SectionHeader';
import { BandSelect } from '../components/BandSelect';
import { ChipMulti } from '../components/ChipMulti';
import { OptionCard } from '../components/OptionCard';
import { GatedQuestion } from '../components/GatedQuestion';
import { GuidanceCard } from '../components/GuidanceCard';
import { WarningCard } from '../components/WarningCard';
import { InlinePrompt } from '../components/InlinePrompt';
import { CostChart } from '../components/CostChart';
import { computeCostProjection } from '../engine/costEngine';

const FPL_2026: Record<number, number> = { 1: 15650, 2: 21150, 3: 26650, 4: 32150, 5: 37650 };

function fplDollar(band: string, size: number): string {
  const base = FPL_2026[size] || 15650;
  switch (band) {
    case 'under138': return `Under $${Math.round(base * 1.38).toLocaleString()}`;
    case '138_250': return `$${Math.round(base * 1.38).toLocaleString()} to $${Math.round(base * 2.5).toLocaleString()}`;
    case '250_400': return `$${Math.round(base * 2.5).toLocaleString()} to $${Math.round(base * 4).toLocaleString()}`;
    case 'over400': return `Over $${Math.round(base * 4).toLocaleString()}`;
    default: return '';
  }
}

export const CostSection: React.FC = () => {
  const { profile, setField } = usePlanStore();
  const { answered, total } = getSectionCompletion(profile, 'cost');
  const ins = profile.insuranceType;
  const isMedicare = ins === 'medicare_original' || ins === 'medicare_advantage';
  const isEmployerOrMarket = ins === 'employer' || ins === 'marketplace';
  const projection = computeCostProjection(profile);
  const hhSize = profile.householdSize || 1;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <SectionHeader
        title="Cost & Coverage"
        description="Insurance mechanics, cost projection, and assistance matching."
        answered={answered}
        total={total}
      />

      {/* Q1: Insurance type */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">What kind of insurance do you have?</h3>
        <BandSelect
          options={[
            { label: 'Employer plan', value: 'employer' },
            { label: 'Marketplace or ACA', value: 'marketplace' },
            { label: 'Medicaid', value: 'medicaid' },
            { label: 'Original Medicare', value: 'medicare_original' },
            { label: 'Medicare Advantage', value: 'medicare_advantage' },
            { label: 'VA or Tricare', value: 'va_tricare' },
            { label: 'None right now', value: 'none' },
          ]}
          value={ins}
          onChange={(v) => setField('insuranceType', v as any)}
        />
      </div>

      {/* Q2: Medigap (Original Medicare only) */}
      <GatedQuestion show={ins === 'medicare_original'}>
        <div className="space-y-3">
          <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Do you have a Medigap supplement plan?</h3>
          <p className="text-sm text-[#5A5751] m-0 font-medium">This matters more than anything else on this page.</p>
          <BandSelect
            options={[
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },
            ]}
            value={profile.hasMedigap}
            onChange={(v) => setField('hasMedigap', v as any)}
          />
        </div>
      </GatedQuestion>

      {/* Q3: Part D (any Medicare) */}
      <GatedQuestion show={isMedicare}>
        <div className="space-y-3">
          <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Do you have Part D drug coverage?</h3>
          <BandSelect
            options={[
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },
            ]}
            value={profile.hasPartD}
            onChange={(v) => setField('hasPartD', v as any)}
          />
        </div>
      </GatedQuestion>

      {/* Q4: HDHP (employer/marketplace) */}
      <GatedQuestion show={isEmployerOrMarket}>
        <div className="space-y-3">
          <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Is it a high-deductible plan with an HSA?</h3>
          <BandSelect
            options={[
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },
            ]}
            value={profile.isHDHP}
            onChange={(v) => setField('isHDHP', v as any)}
          />
        </div>
      </GatedQuestion>

      {/* Q5: Deductible remaining */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">How much of your deductible is left this year?</h3>
        <BandSelect
          options={[
            { label: 'Already met it', value: 'met' },
            { label: 'Under $1,000', value: 'under1k' },
            { label: '$1,000 to $3,000', value: '1k_3k' },
            { label: '$3,000 to $6,000', value: '3k_6k' },
            { label: 'Over $6,000', value: 'over6k' },
          ]}
          value={profile.deductibleRemaining}
          onChange={(v) => setField('deductibleRemaining', v as any)}
        />
      </div>

      {/* Q6: OOP spent */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Roughly how much have you already paid out of pocket this year?</h3>
        <BandSelect
          options={[
            { label: 'Under $500', value: 'under500' },
            { label: '$500 to $2,000', value: '500_2k' },
            { label: '$2,000 to $5,000', value: '2k_5k' },
            { label: 'Over $5,000', value: 'over5k' },
          ]}
          value={profile.oopSpentBand}
          onChange={(v) => setField('oopSpentBand', v as any)}
        />
      </div>

      {/* Q7: Network checked */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Have you confirmed your doctors and facility are in-network?</h3>
        <p className="text-sm text-[#5A5751] m-0">Out-of-network costs do not count toward your out-of-pocket maximum.</p>
        <BandSelect
          options={[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ]}
          value={profile.networkChecked}
          onChange={(v) => setField('networkChecked', v as any)}
        />
      </div>

      {/* Q8: Drug route */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">How are your cancer medications given?</h3>
        <ChipMulti
          options={[
            { label: 'Pills I take at home', value: 'oral' },
            { label: 'Infusion at a clinic', value: 'infused' },
            { label: 'Injections', value: 'injected' },
            { label: 'Nothing prescribed yet', value: 'none_yet' },
          ]}
          selected={profile.drugRoute}
          onChange={(v) => setField('drugRoute', v)}
        />
      </div>

      {/* Q9: Bills in collections */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Do you have any medical bills in collections?</h3>
        <BandSelect
          options={[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ]}
          value={profile.billsInCollections}
          onChange={(v) => setField('billsInCollections', v as any)}
        />
      </div>

      {/* Q10: Wants assistance check */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Want us to check which assistance programs you may qualify for?</h3>
        <div className="space-y-3">
          <OptionCard label="Yes, check" value="yes" selected={profile.wantsAssistanceCheck === true} onSelect={() => setField('wantsAssistanceCheck', true)} />
          <OptionCard label="Not right now" value="no" selected={profile.wantsAssistanceCheck === false && profile.insuranceType !== null} onSelect={() => setField('wantsAssistanceCheck', false)} />
        </div>
      </div>

      {/* Q11 & Q12: Household size and income (GATED) */}
      <GatedQuestion show={profile.wantsAssistanceCheck === true}>
        <div className="space-y-8">
          <div className="space-y-3">
            <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">How many people live in your household?</h3>
            <BandSelect
              options={[
                { label: '1', value: '1' },
                { label: '2', value: '2' },
                { label: '3', value: '3' },
                { label: '4', value: '4' },
                { label: '5 or more', value: '5' },
              ]}
              value={profile.householdSize?.toString() || null}
              onChange={(v) => setField('householdSize', parseInt(v) as any)}
              includeUnsure={false}
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Which range fits your household income?</h3>
            <BandSelect
              options={[
                { label: `Under 138% FPL (${fplDollar('under138', hhSize)})`, value: 'under138' },
                { label: `138–250% FPL (${fplDollar('138_250', hhSize)})`, value: '138_250' },
                { label: `250–400% FPL (${fplDollar('250_400', hhSize)})`, value: '250_400' },
                { label: `Over 400% FPL (${fplDollar('over400', hhSize)})`, value: 'over400' },
                { label: 'Prefer not to say', value: 'no_answer' },
              ]}
              value={profile.fplBand}
              onChange={(v) => setField('fplBand', v as any)}
              includeUnsure={false}
            />
          </div>
        </div>
      </GatedQuestion>

      {/* === GUIDANCE PANEL === */}
      <div className="pt-8 border-t border-[#E4E1DA] space-y-6">
        <h2 className="font-serif text-2xl font-bold text-[#1C1B19] m-0" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Your cost projection</h2>
        <p className="text-xs text-[#5A5751]/60 font-mono m-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>2026 plan year</p>

        {/* Uninsured pathway */}
        {ins === 'none' ? (
          <GuidanceCard title="Uninsured pathway" source="ACA, IRS §501(r), No Surprises Act">
            <div className="space-y-4">
              <p className="m-0 font-medium">Without insurance, here is the order of steps to reduce your costs:</p>
              <ol className="space-y-3 pl-5 m-0">
                <li className="text-sm leading-relaxed"><strong>Check Medicaid eligibility.</strong> Many states have expanded Medicaid. If you have breast or cervical cancer, the BCCTP program may cover you with no income test.</li>
                <li className="text-sm leading-relaxed"><strong>Check marketplace special enrollment.</strong> A diagnosis itself is not a qualifying life event, but job loss is. If you lost your job, you have 60 days.</li>
                <li className="text-sm leading-relaxed"><strong>Get treated at a nonprofit 501(c)(3) hospital</strong> and apply to its financial assistance policy immediately, before bills accumulate.</li>
                <li className="text-sm leading-relaxed"><strong>Request a Good Faith Estimate in writing</strong> before any non-emergency service. A final bill exceeding it by $400 or more can be disputed under the No Surprises Act.</li>
              </ol>
            </div>
          </GuidanceCard>
        ) : ins === 'va_tricare' ? (
          <GuidanceCard title="VA/Tricare coverage" source="VA Beneficiary Guidelines">
            <p className="m-0">Contact your facility's beneficiary counselor for cost details specific to your VA or Tricare coverage. They can explain your copay structure and any additional benefits available.</p>
          </GuidanceCard>
        ) : ins ? (
          <>
            {/* Cost chart — handles the uncapped (open-ended, no ceiling number)
                and near-zero (Medigap/Medicaid, skips the math) cases itself */}
            <CostChart projection={projection} />

            {/* Drivers */}
            {projection.drivers.map((d, i) => (
              <GuidanceCard key={i} title={d.label} source="2026 published figures">
                <p className="m-0">{d.plainExplanation}</p>
              </GuidanceCard>
            ))}
          </>
        ) : (
          <InlinePrompt message="Select your insurance type to see your cost ceiling." />
        )}

        {/* Warning stack */}
        {projection.warnings.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-serif text-lg font-bold text-[#1C1B19] m-0" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Things to know</h3>
            {projection.warnings.map((w) => (
              <WarningCard key={w.id} headline={w.headline} explanation={w.explanation} action={w.action} source={w.source} severity={w.severity} />
            ))}
          </div>
        )}

        {/* Assistance matches */}
        {projection.assistanceMatches.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-serif text-lg font-bold text-[#1C1B19] m-0" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Assistance programs you may qualify for</h3>
            {projection.assistanceMatches.map((p, i) => (
              <GuidanceCard key={i} title={p.name} source={p.source}>
                <p className="m-0 text-sm font-medium text-[#2F5D50] italic">{p.whyYouMatch}</p>
                <p className="m-0">{p.whatItDoes}</p>
                <p className="m-0 text-sm"><strong>Who qualifies:</strong> {p.whoQualifies}</p>
                <p className="m-0 text-sm"><strong>How to start:</strong> {p.howToStart}</p>
              </GuidanceCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
