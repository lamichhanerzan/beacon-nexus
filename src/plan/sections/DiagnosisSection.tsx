import React from 'react';
import { usePlanStore, getSectionCompletion } from '../store';
import { SectionHeader } from '../components/SectionHeader';
import { BandSelect } from '../components/BandSelect';
import { ChipMulti } from '../components/ChipMulti';
import { GuidanceCard } from '../components/GuidanceCard';
import { InlinePrompt } from '../components/InlinePrompt';
import { getDiagnosisExplanation } from '../content/diagnosisContent';

export const DiagnosisSection: React.FC = () => {
  const { profile, setField } = usePlanStore();
  const { answered, total } = getSectionCompletion(profile, 'diagnosis');

  const detail = (profile.detailLevel && profile.detailLevel !== 'unsure')
    ? profile.detailLevel
    : 'balanced';

  const explanation = getDiagnosisExplanation(
    profile.cancerType,
    profile.stage,
    detail
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <SectionHeader
        title="Understanding My Diagnosis"
        description="Plain-language explanation of stage and terms."
        answered={answered}
        total={total}
      />

      {/* Q1: Detail level */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">How much detail do you want?</h3>
        <BandSelect
          options={[
            { label: 'Keep it simple', value: 'simple' },
            { label: 'Balanced', value: 'balanced' },
            { label: 'Give me everything including the medical terms', value: 'full' },
          ]}
          value={profile.detailLevel}
          onChange={(v) => setField('detailLevel', v as any)}
          includeUnsure={false}
        />
      </div>

      {/* Q2: Terms discussed */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Which of these have you been told?</h3>
        <p className="text-sm text-[#5A5751]/70 m-0">We store only which categories were discussed, never the values themselves.</p>
        <ChipMulti
          options={[
            { label: 'My tumor grade', value: 'grade' },
            { label: 'My biomarker or receptor status', value: 'biomarkers' },
            { label: 'Whether it has spread to lymph nodes', value: 'lymph_nodes' },
            { label: 'Whether it has spread elsewhere', value: 'metastasis' },
            { label: 'None of these yet', value: 'none' },
          ]}
          selected={profile.diagnosisTermsDiscussed}
          onChange={(v) => setField('diagnosisTermsDiscussed', v)}
        />
      </div>

      {/* Q3: What to explain */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">What would you most like explained?</h3>
        <ChipMulti
          options={[
            { label: 'What my stage means', value: 'stage_meaning' },
            { label: 'How they decided the stage', value: 'staging_process' },
            { label: 'What my treatment options are', value: 'treatment_options' },
            { label: 'What the words in my report mean', value: 'report_terms' },
            { label: 'What happens next', value: 'next_steps' },
          ]}
          selected={profile.wantsExplained}
          onChange={(v) => setField('wantsExplained', v)}
        />
      </div>

      {/* Q4: Second opinion */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Have you been offered a second opinion?</h3>
        <BandSelect
          options={[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
            { label: 'I did not know I could ask', value: 'did_not_know' },
          ]}
          value={profile.offeredSecondOpinion}
          onChange={(v) => setField('offeredSecondOpinion', v as any)}
          includeUnsure={false}
        />
      </div>

      {/* GUIDANCE PANEL */}
      <div className="pt-8 border-t border-[#E4E1DA] space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#1C1B19] m-0" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Your diagnosis explained</h2>

        {explanation ? (
          <>
            <GuidanceCard title={explanation.title} source={explanation.source}>
              <p className="m-0">{explanation.text}</p>
            </GuidanceCard>
            <GuidanceCard title="What this means in practice" source={explanation.source}>
              <p className="m-0">{explanation.practicalMeaning}</p>
              <p className="m-0 text-sm italic pt-2">Your care team knows details about your case that this cannot.</p>
            </GuidanceCard>
          </>
        ) : (
          <InlinePrompt message={!profile.cancerType ? 'Add your cancer type in My Situation to see a stage explanation.' : 'Select a detail level to see your diagnosis explained.'} />
        )}

        {profile.offeredSecondOpinion === 'did_not_know' && (
          <GuidanceCard title="You can ask for a second opinion" source="NCCN Patient Guidelines">
            <p className="m-0">Getting a second opinion is standard in cancer care and most oncologists expect it. Many insurance plans cover it. NCI-designated cancer centers often have programs specifically for second opinions.</p>
          </GuidanceCard>
        )}
      </div>
    </div>
  );
};
