import React, { useState } from 'react';
import type { ScreeningInput, PriorScreening } from '../lib/screening';
import { PARISHES } from '../content/resources';
import { CheckSquare, Square, ChevronRight, User, HeartHandshake } from 'lucide-react';

interface ScreeningFormProps {
  mode: 'patient' | 'caregiver';
  initialValues?: Partial<ScreeningInput>;
  onSubmit: (input: ScreeningInput) => void;
}

export const ScreeningForm: React.FC<ScreeningFormProps> = ({
  mode,
  initialValues,
  onSubmit
}) => {
  const isCaregiver = mode === 'caregiver';

  const [age, setAge] = useState<number>(initialValues?.age || 50);
  const [sex, setSex] = useState<'female' | 'male' | 'unspecified'>(initialValues?.sex || 'female');
  const [smokingStatus, setSmokingStatus] = useState<'never' | 'former' | 'current'>(initialValues?.smokingStatus || 'never');
  const [yearsSmoked, setYearsSmoked] = useState<number>(20);
  const [packsPerDay, setPacksPerDay] = useState<number>(1);
  const [yearsSinceQuit, setYearsSinceQuit] = useState<number>(5);

  const [hasFamilyCancer, setHasFamilyCancer] = useState<'no' | 'yes' | 'not_sure'>(
    initialValues?.familyHistory && initialValues.familyHistory.length > 0 ? 'yes' : 'no'
  );
  const [familyTypes, setFamilyTypes] = useState<string[]>(initialValues?.familyHistory || []);

  const [selectedPriorTypes, setSelectedPriorTypes] = useState<string[]>(
    initialValues?.priorScreenings?.map((p) => p.type) || []
  );
  const [priorRecencies, setPriorRecencies] = useState<Record<string, string>>(
    initialValues?.priorScreenings?.reduce((acc, p) => ({ ...acc, [p.type]: p.recency }), {}) || {}
  );

  const [zip, setZip] = useState<string>(initialValues?.zip || '');
  const [useParish, setUseParish] = useState<boolean>(!initialValues?.zip && !!initialValues?.parishSlug);
  const [parishSlug, setParishSlug] = useState<string>(initialValues?.parishSlug || '');

  const toggleFamilyType = (type: string) => {
    setFamilyTypes((prev: string[]) =>
      prev.includes(type) ? prev.filter((t: string) => t !== type) : [...prev, type]
    );
  };

  const togglePriorType = (type: string) => {
    if (type === 'none') {
      setSelectedPriorTypes(['none']);
      setPriorRecencies({});
      return;
    }

    setSelectedPriorTypes((prev: string[]) => {
      const filtered = prev.filter((t: string) => t !== 'none');
      if (filtered.includes(type)) {
        return filtered.filter((t: string) => t !== type);
      } else {
        return [...filtered, type];
      }
    });

    if (!priorRecencies[type]) {
      setPriorRecencies((prev: Record<string, string>) => ({ ...prev, [type]: '1-3_years' }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const calculatedPackYears = (smokingStatus === 'current' || smokingStatus === 'former')
      ? yearsSmoked * packsPerDay
      : 0;

    const priorList: PriorScreening[] = selectedPriorTypes
      .filter((t: string) => t !== 'none')
      .map((t: string) => ({
        type: t,
        recency: priorRecencies[t] || '1-3_years'
      }));

    const inputData: ScreeningInput = {
      age,
      sex,
      smokingStatus,
      packYears: calculatedPackYears,
      yearsSinceQuit: smokingStatus === 'former' ? yearsSinceQuit : 0,
      familyHistory: hasFamilyCancer === 'yes' ? familyTypes : [],
      priorScreenings: priorList,
      zip: !useParish ? zip : undefined,
      parishSlug: useParish ? parishSlug : undefined
    };

    onSubmit(inputData);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      
      {/* Intro Header — sits on paper, no colored banner */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center space-x-2 text-signal font-clinical text-xs font-bold uppercase tracking-widest">
          {isCaregiver ? <HeartHandshake className="w-4 h-4" /> : <User className="w-4 h-4" />}
          <span>{isCaregiver ? "Caregiver Screening Check" : "Personal Screening Check"}</span>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink leading-tight m-0">
          National Guideline Screening Eligibility Check
        </h1>

        <p className="text-base sm:text-lg text-ink-soft leading-relaxed m-0 italic">
          "Six questions. This tells you which screenings {isCaregiver ? "they're" : "you're"} eligible for under national guidelines. It does not tell you whether {isCaregiver ? "they" : "you"} have cancer — no questionnaire can do that."
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleFormSubmit} className="space-y-8">
        
        {/* Q1: Age */}
        <div className="p-6 rounded-xl border border-rule bg-paper shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-clinical text-xs font-bold text-signal">Question 1 of 6</span>
          </div>
          <label className="block font-display text-xl font-bold text-ink m-0">
            {isCaregiver ? "How old are they?" : "How old are you?"}
          </label>
          <div className="flex items-center space-x-4 pt-1">
            <input
              type="number"
              min={18}
              max={100}
              value={age}
              onChange={(e) => setAge(Math.max(18, Math.min(100, parseInt(e.target.value) || 18)))}
              className="w-32 px-4 py-3 rounded-lg border border-rule bg-paper font-clinical text-xl text-ink text-center font-bold focus:ring-2 focus:ring-signal"
              required
            />
            <span className="text-sm text-ink-soft">years old</span>
          </div>
        </div>

        {/* Q2: Sex */}
        <div className="p-6 rounded-xl border border-rule bg-paper shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-clinical text-xs font-bold text-signal">Question 2 of 6</span>
          </div>
          <label className="block font-display text-xl font-bold text-ink m-0">
            Sex assigned at birth
          </label>
          <p className="text-xs text-ink-soft m-0">
            This determines which screening guidelines apply. If you prefer not to say, we'll show you all of them.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {[
              { label: 'Female', value: 'female' },
              { label: 'Male', value: 'male' },
              { label: 'Prefer not to say', value: 'unspecified' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSex(opt.value as any)}
                className={`py-3 px-4 rounded-lg font-sans text-base font-semibold border transition-all cursor-pointer ${
                  sex === opt.value
                    ? 'bg-signal text-paper border-signal shadow-xs'
                    : 'bg-paper border-rule text-ink hover:bg-manila/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Q3: Smoking */}
        <div className="p-6 rounded-xl border border-rule bg-paper shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-clinical text-xs font-bold text-signal">Question 3 of 6</span>
          </div>
          <label className="block font-display text-xl font-bold text-ink m-0">
            {isCaregiver ? "Have they ever smoked?" : "Have you ever smoked?"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Never smoked', value: 'never' },
              { label: isCaregiver ? 'They used to smoke' : 'I used to smoke', value: 'former' },
              { label: isCaregiver ? 'They smoke now' : 'I smoke now', value: 'current' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSmokingStatus(opt.value as any)}
                className={`py-3 px-4 rounded-lg font-sans text-base font-semibold border transition-all cursor-pointer ${
                  smokingStatus === opt.value
                    ? 'bg-signal text-paper border-signal shadow-xs'
                    : 'bg-paper border-rule text-ink hover:bg-manila/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Conditional Smoking Follow-ups */}
          {(smokingStatus === 'former' || smokingStatus === 'current') && (
            <div className="p-4 rounded-lg bg-manila/30 border border-rule space-y-4 pt-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">
                    {isCaregiver ? "About how many years did they smoke?" : "About how many years did you smoke?"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={70}
                    value={yearsSmoked}
                    onChange={(e) => setYearsSmoked(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded border border-rule bg-paper font-clinical text-base text-ink"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">
                    Packs per day (e.g. 0.5, 1, 1.5, 2)
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    min={0.1}
                    max={5}
                    value={packsPerDay}
                    onChange={(e) => setPacksPerDay(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded border border-rule bg-paper font-clinical text-base text-ink"
                  />
                </div>
              </div>

              {smokingStatus === 'former' && (
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">
                    {isCaregiver ? "About how many years ago did they quit?" : "About how many years ago did you quit?"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={yearsSinceQuit}
                    onChange={(e) => setYearsSinceQuit(parseInt(e.target.value) || 0)}
                    className="w-32 px-3 py-2 rounded border border-rule bg-paper font-clinical text-base text-ink"
                  />
                </div>
              )}

              <div className="font-clinical text-xs text-ink-soft pt-1">
                Computed Pack-Years: <strong className="text-ink">{yearsSmoked * packsPerDay} pack-years</strong> ({yearsSmoked} yrs × {packsPerDay} packs/day)
              </div>
            </div>
          )}
        </div>

        {/* Q4: Family History */}
        <div className="p-6 rounded-xl border border-rule bg-paper shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-clinical text-xs font-bold text-signal">Question 4 of 6</span>
          </div>
          <label className="block font-display text-xl font-bold text-ink m-0">
            Has a parent, brother, sister, or child ever had cancer?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'No', value: 'no' },
              { label: 'Yes', value: 'yes' },
              { label: 'Not sure', value: 'not_sure' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setHasFamilyCancer(opt.value as any)}
                className={`py-3 px-4 rounded-lg font-sans text-base font-semibold border transition-all cursor-pointer ${
                  hasFamilyCancer === opt.value
                    ? 'bg-signal text-paper border-signal shadow-xs'
                    : 'bg-paper border-rule text-ink hover:bg-manila/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {hasFamilyCancer === 'yes' && (
            <div className="p-4 rounded-lg bg-manila/30 border border-rule space-y-2 pt-3">
              <label className="block text-sm font-semibold text-ink">
                Which type(s) of cancer did first-degree relatives have? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  { label: 'Breast', value: 'breast' },
                  { label: 'Ovarian', value: 'ovarian' },
                  { label: 'Colorectal', value: 'colorectal' },
                  { label: 'Prostate', value: 'prostate' },
                  { label: 'Lung', value: 'lung' },
                  { label: 'Uterine', value: 'uterine' },
                  { label: 'Pancreatic', value: 'pancreatic' },
                  { label: 'Other', value: 'other' }
                ].map((item) => {
                  const checked = familyTypes.includes(item.value);
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleFamilyType(item.value)}
                      className={`flex items-center space-x-2 p-2.5 rounded border text-sm font-medium transition-colors cursor-pointer ${
                        checked
                          ? 'bg-signal text-paper border-signal'
                          : 'bg-paper border-rule text-ink hover:bg-manila/50'
                      }`}
                    >
                      {checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-ink-soft" />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Q5: Past Screenings */}
        <div className="p-6 rounded-xl border border-rule bg-paper shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-clinical text-xs font-bold text-signal">Question 5 of 6</span>
          </div>
          <label className="block font-display text-xl font-bold text-ink m-0">
            {isCaregiver ? "Which of these have they had before?" : "Which of these have you had before?"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Mammogram', value: 'mammogram' },
              { label: 'Pap test or HPV test', value: 'pap_hpv' },
              { label: 'Colonoscopy', value: 'colonoscopy' },
              { label: 'Stool test for colon cancer', value: 'stool_test' },
              { label: 'Lung CT scan', value: 'lung_ct' },
              { label: 'None of these', value: 'none' }
            ].map((item) => {
              const checked = selectedPriorTypes.includes(item.value);
              return (
                <div key={item.value} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => togglePriorType(item.value)}
                    className={`w-full flex items-center space-x-2.5 p-3 rounded-lg border text-base font-semibold transition-all cursor-pointer ${
                      checked
                        ? 'bg-signal text-paper border-signal shadow-xs'
                        : 'bg-paper border-rule text-ink hover:bg-manila/40'
                    }`}
                  >
                    {checked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-ink-soft" />}
                    <span>{item.label}</span>
                  </button>

                  {checked && item.value !== 'none' && (
                    <div className="pl-4 pt-1">
                      <label className="block text-xs font-semibold text-ink-soft mb-1">
                        When was their/your last one?
                      </label>
                      <select
                        value={priorRecencies[item.value] || '1-3_years'}
                        onChange={(e) =>
                          setPriorRecencies((prev: Record<string, string>) => ({ ...prev, [item.value]: e.target.value }))
                        }
                        className="w-full px-3 py-1.5 rounded border border-rule bg-paper font-sans text-xs text-ink"
                      >
                        <option value="within_year">Within the past year</option>
                        <option value="1-3_years">1–3 years ago</option>
                        <option value="3-5_years">3–5 years ago</option>
                        <option value="more_than_5_years">More than 5 years ago</option>
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Q6: Location */}
        <div className="p-6 rounded-xl border border-rule bg-paper shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-clinical text-xs font-bold text-signal">Question 6 of 6</span>
          </div>
          <label className="block font-display text-xl font-bold text-ink m-0">
            Location for finding nearby clinics
          </label>
          <p className="text-xs text-ink-soft m-0">
            Used only to find nearby facilities. Nothing is saved or sent anywhere.
          </p>

          {!useParish ? (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">
                What's your 5-digit ZIP code? (Optional)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  maxLength={5}
                  placeholder="e.g. 71203"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
                  className="w-40 px-4 py-2.5 rounded border border-rule bg-paper font-clinical text-lg text-ink focus:ring-2 focus:ring-signal"
                />
                <button
                  type="button"
                  onClick={() => setUseParish(true)}
                  className="text-xs font-semibold text-signal hover:underline cursor-pointer"
                >
                  I'd rather pick my parish
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">
                Select Louisiana Parish
              </label>
              <div className="flex items-center space-x-3">
                <select
                  value={parishSlug}
                  onChange={(e) => setParishSlug(e.target.value)}
                  className="px-4 py-2.5 rounded border border-rule bg-paper font-sans text-sm text-ink focus:ring-2 focus:ring-signal"
                >
                  <option value="">Select Parish</option>
                  {PARISHES.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name} Parish
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setUseParish(false)}
                  className="text-xs font-semibold text-signal hover:underline cursor-pointer"
                >
                  Use ZIP code instead
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Form Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-sans text-lg font-bold bg-signal text-paper hover:bg-signal/90 transition-colors shadow-md cursor-pointer"
          >
            <span>See My Screening Results</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </form>
    </div>
  );
};
