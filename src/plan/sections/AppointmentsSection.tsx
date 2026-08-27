import React from 'react';
import { usePlanStore, getSectionCompletion } from '../store';
import { SectionHeader } from '../components/SectionHeader';
import { BandSelect } from '../components/BandSelect';
import { ChipMulti } from '../components/ChipMulti';
import { GuidanceCard } from '../components/GuidanceCard';
import { InlinePrompt } from '../components/InlinePrompt';
import { GatedQuestion } from '../components/GatedQuestion';
import { Printer } from 'lucide-react';

const WALK_OUT_GOALS = [
  { label: 'My treatment options', value: 'treatment_options' },
  { label: 'Side effects to expect', value: 'side_effects' },
  { label: 'How long treatment lasts', value: 'duration' },
  { label: 'What it will cost', value: 'cost' },
  { label: 'Whether I can keep working', value: 'work' },
  { label: 'Clinical trial options', value: 'trials' },
  { label: 'How to reach the team between visits', value: 'contact' },
];

function generateQuestions(profile: ReturnType<typeof usePlanStore.getState>['profile']): string[] {
  const questions: string[] = [];
  
  profile.walkOutGoals.forEach((goal) => {
    switch (goal) {
      case 'treatment_options': questions.push('What are all of my treatment options, including clinical trials?'); questions.push('What do you recommend and why?'); break;
      case 'side_effects': questions.push('What side effects should I expect, and which ones should I call about immediately?'); break;
      case 'duration': questions.push('How long will treatment last, and how often will I need to come in?'); break;
      case 'cost': questions.push('Is there a less expensive alternative that would be equally effective?'); questions.push('Can any of these treatments be done at an outpatient center instead of the hospital?'); break;
      case 'work': questions.push('Will I be able to continue working during treatment? Are there accommodations that would help?'); break;
      case 'trials': questions.push('Am I eligible for any clinical trials? Where can I look for trials that match my diagnosis?'); break;
      case 'contact': questions.push('Who do I call if I have a question or problem between appointments? Is there a patient portal?'); break;
    }
  });

  if (profile.carePhase === 'just_diagnosed') {
    questions.push('What additional tests do I need before we decide on a treatment plan?');
    questions.push('Should I get a second opinion, and would you recommend a specific center?');
  }
  if (profile.carePhase === 'in_treatment') {
    questions.push('Is the treatment working as expected so far?');
  }

  return questions;
}

export const AppointmentsSection: React.FC = () => {
  const { profile, setField } = usePlanStore();
  const { answered, total } = getSectionCompletion(profile, 'appointments');
  const questions = generateQuestions(profile);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <SectionHeader
        title="My Appointments"
        description="Generate a question list for your next visit and capture what you learn."
        answered={answered}
        total={total}
      />

      {/* Q1: Next appointment type */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">What kind of appointment is next?</h3>
        <BandSelect
          options={[
            { label: 'Oncologist consult', value: 'oncologist' },
            { label: 'Surgery consult', value: 'surgery' },
            { label: 'Chemo or infusion', value: 'chemo' },
            { label: 'Radiation planning', value: 'radiation' },
            { label: 'Scan or imaging', value: 'scan' },
            { label: 'Follow-up', value: 'followup' },
            { label: 'Nothing scheduled', value: 'none' },
          ]}
          value={profile.nextAppointmentType}
          onChange={(v) => setField('nextAppointmentType', v)}
          includeUnsure={false}
        />
      </div>

      {/* Q2: Date */}
      <GatedQuestion show={profile.nextAppointmentType !== null && profile.nextAppointmentType !== 'none'}>
        <div className="space-y-3">
          <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">When is it?</h3>
          <div className="flex items-center space-x-3">
            <input
              type="date"
              value={profile.nextAppointmentDate || ''}
              onChange={(e) => setField('nextAppointmentDate', e.target.value || null)}
              className="px-4 py-3 rounded-xl border-2 border-[#E4E1DA] bg-white font-sans text-base text-[#1C1B19] focus:ring-2 focus:ring-[#2F5D50] focus:border-[#2F5D50]"
            />
          </div>
        </div>
      </GatedQuestion>

      {/* Q3: Companion */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Is someone coming with you?</h3>
        <BandSelect
          options={[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ]}
          value={profile.companionComing}
          onChange={(v) => setField('companionComing', v as any)}
        />
      </div>

      {/* Q4: Walk out goals */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">What do you most want to walk out knowing?</h3>
        <ChipMulti
          options={WALK_OUT_GOALS}
          selected={profile.walkOutGoals}
          onChange={(v) => setField('walkOutGoals', v)}
        />
      </div>

      {/* Q5: Checklist */}
      <div className="space-y-3">
        <h3 className="font-sans text-xl font-semibold text-[#1C1B19] m-0">Do you want a recording or note-taking checklist?</h3>
        <BandSelect
          options={[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ]}
          value={profile.wantsChecklist}
          onChange={(v) => setField('wantsChecklist', v as any)}
          includeUnsure={false}
        />
      </div>

      {/* GUIDANCE: Generated question list */}
      <div className="pt-8 border-t border-[#E4E1DA] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-[#1C1B19] m-0" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Your question list</h2>
          {questions.length > 0 && (
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg font-sans text-sm font-semibold text-[#2F5D50] bg-[#2F5D50]/10 hover:bg-[#2F5D50]/20 cursor-pointer border-0 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print list</span>
            </button>
          )}
        </div>

        {questions.length > 0 ? (
          <GuidanceCard title={`${questions.length} questions for your ${profile.nextAppointmentType || 'next'} appointment`} source="Generated from your priorities and care phase">
            <ol className="space-y-3 pl-5 m-0">
              {questions.map((q, i) => (
                <li key={i} className="text-sm leading-relaxed">{q}</li>
              ))}
            </ol>
          </GuidanceCard>
        ) : (
          <InlinePrompt message="Select what you want to walk out knowing to generate your question list." />
        )}
      </div>

      {/* Post-visit capture */}
      <div className="pt-8 border-t border-[#E4E1DA] space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#1C1B19] m-0" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>After the visit</h2>
        <p className="text-sm text-[#5A5751] m-0">Write it down now — you will not remember it later.</p>

        {(['whatTheyToldMe', 'whatINeedToDecide', 'whatHappensNext', 'whoToCall'] as const).map((field) => {
          const labels: Record<string, string> = {
            whatTheyToldMe: 'What they told me',
            whatINeedToDecide: 'What I need to decide',
            whatHappensNext: 'What happens next',
            whoToCall: 'Who to call',
          };
          return (
            <div key={field} className="space-y-1.5">
              <label className="font-sans text-sm font-semibold text-[#1C1B19] block">{labels[field]}</label>
              <textarea
                value={profile.postVisitNotes[field]}
                onChange={(e) => setField('postVisitNotes', { ...profile.postVisitNotes, [field]: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#E4E1DA] bg-white font-sans text-sm text-[#1C1B19] focus:ring-2 focus:ring-[#2F5D50] focus:border-[#2F5D50] resize-y leading-relaxed"
                placeholder={`${labels[field]}...`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
