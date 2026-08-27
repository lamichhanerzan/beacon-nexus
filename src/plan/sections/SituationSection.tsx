import React from 'react';
import { usePlanStore } from '../store';
import { getSectionCompletion } from '../store';
import { SectionHeader } from '../components/SectionHeader';
import { BandSelect } from '../components/BandSelect';
import { ChipMulti } from '../components/ChipMulti';
import { OptionCard } from '../components/OptionCard';
import { GatedQuestion } from '../components/GatedQuestion';
import { SearchableCombobox } from '../components/SearchableCombobox';
import { GuidanceCard } from '../components/GuidanceCard';
import { InlinePrompt } from '../components/InlinePrompt';

const CANCER_TYPES = [
  { label: 'Breast cancer', value: 'breast' },
  { label: 'Lung cancer', value: 'lung' },
  { label: 'Colorectal cancer', value: 'colorectal' },
  { label: 'Prostate cancer', value: 'prostate' },
  { label: 'Skin cancer (melanoma)', value: 'melanoma' },
  { label: 'Bladder cancer', value: 'bladder' },
  { label: 'Non-Hodgkin lymphoma', value: 'nhl' },
  { label: 'Kidney cancer', value: 'kidney' },
  { label: 'Uterine cancer', value: 'uterine' },
  { label: 'Pancreatic cancer', value: 'pancreatic' },
  { label: 'Thyroid cancer', value: 'thyroid' },
  { label: 'Leukemia', value: 'leukemia' },
  { label: 'Other', value: 'other' },
  { label: 'Not sure yet', value: 'unsure' },
];

const PRIORITY_OPTIONS = [
  { label: 'Understanding my diagnosis', value: 'understanding' },
  { label: 'Cost and bills', value: 'cost' },
  { label: 'Side effects', value: 'side_effects' },
  { label: 'Keeping my job', value: 'job' },
  { label: 'Telling my family', value: 'family' },
  { label: 'Getting a second opinion', value: 'second_opinion' },
  { label: 'Fertility', value: 'fertility' },
  { label: 'Knowing what to ask', value: 'what_to_ask' },
];

export const SituationSection: React.FC = () => {
  const { profile, setField } = usePlanStore();
  const { answered, total } = getSectionCompletion(profile, 'situation');
  const isDiagnosed = profile.entryPath === 'diagnosed';
  const isSmoker = profile.smokingHistory === 'former' || profile.smokingHistory === 'current';

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <SectionHeader
        title="My Situation"
        description="These answers personalize every other section. All are skippable."
        answered={answered}
        total={total}
      />

      {/* Q1: Entry path */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Which brings you here today?</h3>
        <BandSelect
          options={[
            { label: 'I want to know what screenings I need', value: 'not_screened' },
            { label: 'I have a screening scheduled or pending results', value: 'awaiting_results' },
            { label: 'I have been diagnosed with cancer', value: 'diagnosed' },
            { label: 'I am helping someone else', value: 'caregiver' },
          ]}
          value={profile.entryPath}
          onChange={(v) => setField('entryPath', v as any)}
          includeUnsure={false}
        />
      </div>

      {/* Q2: Age band */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">What is your age range?</h3>
        <BandSelect
          options={[
            { label: 'Under 40', value: 'under40' },
            { label: '40–44', value: '40_44' },
            { label: '45–49', value: '45_49' },
            { label: '50–54', value: '50_54' },
            { label: '55–64', value: '55_64' },
            { label: '65–74', value: '65_74' },
            { label: '75 or older', value: '75plus' },
          ]}
          value={profile.ageBand}
          onChange={(v) => setField('ageBand', v as any)}
        />
      </div>

      {/* Q3: Sex */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">What was your sex assigned at birth?</h3>
        <BandSelect
          options={[
            { label: 'Female', value: 'female' },
            { label: 'Male', value: 'male' },
            { label: 'Prefer not to say', value: 'no_answer' },
          ]}
          value={profile.sexAtBirth}
          onChange={(v) => setField('sexAtBirth', v as any)}
          includeUnsure={false}
        />
      </div>

      {/* Q4: Smoking */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Have you ever smoked?</h3>
        <BandSelect
          options={[
            { label: 'Never', value: 'never' },
            { label: 'I used to', value: 'former' },
            { label: 'I currently do', value: 'current' },
          ]}
          value={profile.smokingHistory}
          onChange={(v) => setField('smokingHistory', v as any)}
          includeUnsure={false}
        />
      </div>

      {/* Q5: Pack years (conditional) */}
      <GatedQuestion show={isSmoker}>
        <div className="space-y-3">
          <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Roughly how long, and how much?</h3>
          <BandSelect
            options={[
              { label: 'Under 10 pack-years', value: 'under10' },
              { label: '10–20 pack-years', value: '10_20' },
              { label: '20–30 pack-years', value: '20_30' },
              { label: 'Over 30 pack-years', value: 'over30' },
            ]}
            value={profile.packYearsBand}
            onChange={(v) => setField('packYearsBand', v as any)}
          />
          <p className="text-sm text-[#5A5751]/70 m-0">Pack-years = years smoked × packs per day. Smoking 1 pack a day for 20 years = 20 pack-years.</p>
        </div>
      </GatedQuestion>

      {/* Q6: Family history */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Has a parent, sibling, or child had cancer?</h3>
        <ChipMulti
          options={[
            { label: 'No', value: 'no' },
            { label: 'Breast or ovarian', value: 'breast_ovarian' },
            { label: 'Colorectal', value: 'colorectal' },
            { label: 'Prostate', value: 'prostate' },
            { label: 'Lung', value: 'lung' },
            { label: 'Other', value: 'other' },
            { label: 'Not sure', value: 'unsure' },
          ]}
          selected={profile.familyHistory}
          onChange={(v) => setField('familyHistory', v)}
          columns={2}
        />
      </div>

      {/* Q7: Prior screenings */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Which screenings have you already had?</h3>
        <ChipMulti
          options={[
            { label: 'Mammogram', value: 'mammogram' },
            { label: 'Pap test or HPV test', value: 'pap_hpv' },
            { label: 'Colonoscopy', value: 'colonoscopy' },
            { label: 'Low-dose lung CT', value: 'lung_ct' },
            { label: 'PSA test', value: 'psa' },
            { label: 'None of these', value: 'none' },
          ]}
          selected={profile.priorScreenings}
          onChange={(v) => setField('priorScreenings', v)}
          columns={2}
        />
      </div>

      {/* Q8: Most recent screening */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">When was the most recent one?</h3>
        <BandSelect
          options={[
            { label: 'Within the past year', value: 'under1y' },
            { label: '1–3 years ago', value: '1_3y' },
            { label: '3–5 years ago', value: '3_5y' },
            { label: 'Over 5 years ago', value: 'over5y' },
          ]}
          value={profile.lastScreeningWindow}
          onChange={(v) => setField('lastScreeningWindow', v as any)}
        />
      </div>

      {/* Q9: Primary care */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Do you have a regular doctor?</h3>
        <BandSelect
          options={[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ]}
          value={profile.hasPrimaryCare}
          onChange={(v) => setField('hasPrimaryCare', v as any)}
        />
      </div>

      {/* === DIAGNOSED PATH (Q10–Q15) === */}
      <GatedQuestion show={isDiagnosed}>
        <div className="space-y-8 pt-4 border-t border-[#E4E1DA]">
          <p className="text-sm text-[#5A5751] m-0 italic">Since you have a diagnosis, a few more questions help us personalize your plan.</p>

          {/* Q10: Cancer type */}
          <div className="space-y-3">
            <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">What type of cancer?</h3>
            <SearchableCombobox
              options={CANCER_TYPES}
              value={profile.cancerType}
              onChange={(v) => setField('cancerType', v || null)}
              placeholder="Search cancer type..."
            />
          </div>

          {/* Q11: Stage */}
          <div className="space-y-3">
            <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">What stage?</h3>
            <BandSelect
              options={[
                { label: 'Stage 0', value: '0' },
                { label: 'Stage I', value: 'I' },
                { label: 'Stage II', value: 'II' },
                { label: 'Stage III', value: 'III' },
                { label: 'Stage IV', value: 'IV' },
                { label: 'Not staged yet', value: 'not_staged' },
              ]}
              value={profile.stage}
              onChange={(v) => setField('stage', v as any)}
            />
          </div>

          {/* Q12: Care phase */}
          <div className="space-y-3">
            <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Where are you right now?</h3>
            <BandSelect
              options={[
                { label: 'Just diagnosed', value: 'just_diagnosed' },
                { label: 'Waiting on more tests', value: 'awaiting_tests' },
                { label: 'Treatment plan decided', value: 'plan_decided' },
                { label: 'In treatment', value: 'in_treatment' },
                { label: 'Finished treatment', value: 'finished' },
                { label: 'Dealing with a recurrence', value: 'recurrence' },
              ]}
              value={profile.carePhase}
              onChange={(v) => setField('carePhase', v as any)}
              includeUnsure={false}
            />
          </div>

          {/* Q13: Treatments */}
          <div className="space-y-3">
            <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">What treatments are planned or underway?</h3>
            <ChipMulti
              options={[
                { label: 'Surgery', value: 'surgery' },
                { label: 'Chemotherapy', value: 'chemo' },
                { label: 'Radiation', value: 'radiation' },
                { label: 'Immunotherapy', value: 'immunotherapy' },
                { label: 'Hormone therapy', value: 'hormone' },
                { label: 'Targeted therapy', value: 'targeted' },
                { label: 'Clinical trial', value: 'clinical_trial' },
                { label: 'Not decided yet', value: 'not_decided' },
              ]}
              selected={profile.treatments}
              onChange={(v) => setField('treatments', v)}
              columns={2}
            />
          </div>

          {/* Q14: Navigator */}
          <div className="space-y-3">
            <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Do you have a nurse navigator or care coordinator?</h3>
            <BandSelect
              options={[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ]}
              value={profile.hasNavigator}
              onChange={(v) => setField('hasNavigator', v as any)}
            />
          </div>

          {/* Q15: Priorities */}
          <div className="space-y-3">
            <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">What matters most to you right now?</h3>
            <ChipMulti
              options={PRIORITY_OPTIONS}
              selected={profile.priorities}
              onChange={(v) => setField('priorities', v)}
              max={3}
              columns={2}
            />
          </div>
        </div>
      </GatedQuestion>

      {/* === GUIDANCE PANEL === */}
      <div className="pt-8 border-t border-[#E4E1DA] space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#1C1B19] m-0" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Your profile summary</h2>

        {profile.entryPath && (
          <GuidanceCard title="Entry path" source="Your answers">
            <p className="m-0">
              {profile.entryPath === 'not_screened' && 'You are exploring what screenings you may be due for. The Screening section of this app can help.'}
              {profile.entryPath === 'awaiting_results' && 'You have a screening scheduled or are waiting on results. The Appointments section can help you prepare questions.'}
              {profile.entryPath === 'diagnosed' && 'You have been diagnosed with cancer. Your plan will be personalized to your diagnosis, stage, and treatment.'}
              {profile.entryPath === 'caregiver' && 'You are helping someone through this. All guidance will be framed for your role.'}
            </p>
          </GuidanceCard>
        )}

        {isDiagnosed && profile.cancerType && profile.stage && (
          <GuidanceCard title="Diagnosis summary" source="Your answers">
            <p className="m-0">
              {profile.cancerType.charAt(0).toUpperCase() + profile.cancerType.slice(1)}
              {profile.stage !== 'not_staged' && profile.stage !== 'unsure' ? `, stage ${profile.stage}` : ', staging pending'}.
              {profile.carePhase === 'just_diagnosed' && ' Just diagnosed.'}
              {profile.carePhase === 'in_treatment' && ' Currently in treatment.'}
              {profile.carePhase === 'finished' && ' Finished treatment.'}
            </p>
          </GuidanceCard>
        )}

        {!profile.entryPath && (
          <InlinePrompt message="Tell us which brings you here to personalize the rest of your plan." />
        )}
      </div>
    </div>
  );
};
