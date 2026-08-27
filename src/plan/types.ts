/**
 * My Plan — Types & Data Model
 *
 * EXCLUDED FIELDS — The app NEVER collects:
 *   name, date of birth, full ZIP code (only 3-digit prefix), street address,
 *   phone number, email, exact income, exact dollar amounts, Social Security number,
 *   medication names, biomarker values, genetic test results, symptoms,
 *   medical record numbers, file uploads, photos, provider NPI numbers.
 */

// ---------- Utility ----------

export type Band<T extends string> = T | 'unsure' | null;

// ---------- BLOCKED_FIELDS assertion ----------

export const BLOCKED_FIELDS = [
  'name', 'firstName', 'lastName', 'dateOfBirth', 'dob', 'fullZip', 'zip',
  'address', 'streetAddress', 'city', 'state', 'phone', 'phoneNumber',
  'email', 'emailAddress', 'ssn', 'socialSecurityNumber', 'exactIncome',
  'incomeExact', 'salary', 'exactDollarAmount', 'medicationName',
  'drugName', 'biomarkerValue', 'geneticResult', 'symptom', 'symptoms',
  'medicalRecordNumber', 'mrn', 'fileUpload', 'photo', 'image', 'npi',
] as const;

export function assertNoBlockedFields(key: string): void {
  if (import.meta.env.DEV) {
    const lower = key.toLowerCase();
    for (const blocked of BLOCKED_FIELDS) {
      if (lower === blocked.toLowerCase()) {
        throw new Error(
          `[BEACON GUARDRAIL] Attempted to store blocked field "${key}". ` +
          `This app never collects: ${BLOCKED_FIELDS.join(', ')}.`
        );
      }
    }
  }
}

// ---------- Plan Profile ----------

export interface PlanProfile {
  // Section 1 — My Situation
  entryPath: 'not_screened' | 'awaiting_results' | 'diagnosed' | 'caregiver' | null;
  ageBand: Band<'under40' | '40_44' | '45_49' | '50_54' | '55_64' | '65_74' | '75plus'>;
  sexAtBirth: Band<'female' | 'male' | 'no_answer'>;
  smokingHistory: Band<'never' | 'former' | 'current'>;
  packYearsBand: Band<'under10' | '10_20' | '20_30' | 'over30'>;
  familyHistory: string[];
  priorScreenings: string[];
  lastScreeningWindow: Band<'under1y' | '1_3y' | '3_5y' | 'over5y'>;
  hasPrimaryCare: Band<'yes' | 'no'>;
  cancerType: string | null;
  stage: Band<'0' | 'I' | 'II' | 'III' | 'IV' | 'not_staged'>;
  carePhase: Band<'just_diagnosed' | 'awaiting_tests' | 'plan_decided' | 'in_treatment' | 'finished' | 'recurrence'>;
  treatments: string[];
  hasNavigator: Band<'yes' | 'no'>;
  priorities: string[];

  // Section 2 — Cost & Coverage
  insuranceType: Band<'employer' | 'marketplace' | 'medicaid' | 'medicare_original' | 'medicare_advantage' | 'va_tricare' | 'none'>;
  hasMedigap: Band<'yes' | 'no'>;
  hasPartD: Band<'yes' | 'no'>;
  isHDHP: Band<'yes' | 'no'>;
  deductibleRemaining: Band<'met' | 'under1k' | '1k_3k' | '3k_6k' | 'over6k'>;
  oopSpentBand: Band<'under500' | '500_2k' | '2k_5k' | 'over5k'>;
  facilityType: Band<'academic' | 'community' | 'ambulatory' | 'unsure'>;
  networkChecked: Band<'yes' | 'no'>;
  drugRoute: string[];
  billsInCollections: Band<'yes' | 'no'>;
  wantsAssistanceCheck: boolean;
  householdSize: 1 | 2 | 3 | 4 | 5 | null;
  fplBand: Band<'under138' | '138_250' | '250_400' | 'over400' | 'no_answer'>;

  // Section 3 — Understanding My Diagnosis
  detailLevel: Band<'simple' | 'balanced' | 'full'>;
  diagnosisTermsDiscussed: string[];
  wantsExplained: string[];
  offeredSecondOpinion: Band<'yes' | 'no' | 'did_not_know'>;

  // Section 4 — My Appointments
  nextAppointmentType: string | null;
  nextAppointmentDate: string | null;
  companionComing: Band<'yes' | 'no'>;
  walkOutGoals: string[];
  wantsChecklist: Band<'yes' | 'no'>;
  postVisitNotes: {
    whatTheyToldMe: string;
    whatINeedToDecide: string;
    whatHappensNext: string;
    whoToCall: string;
  };

  // Section 5 — Work & Daily Life
  employment: Band<'full_time' | 'part_time' | 'self_employed' | 'not_working' | 'retired' | 'student'>;
  employerSize: Band<'under50' | '50plus' | 'unsure'>;
  tenureOver12mo: Band<'yes' | 'no'>;
  paidLeave: Band<'plenty' | 'limited' | 'none'>;
  transport: Band<'own_car' | 'someone_drives' | 'transit_rideshare' | 'none_reliable'>;
  travelTimeBand: Band<'under30' | '30_60' | '60_120' | 'over120'>;
  caregiver: Band<'lives_with' | 'nearby' | 'far' | 'none'>;
  dependentsAtHome: Band<'none' | 'children' | 'elder' | 'both'>;
  zipPrefix: string | null;
  language: string | null;
}

// ---------- Cost Projection ----------

export interface Driver {
  label: string;
  plainExplanation: string;
}

export interface Warning {
  id: string;
  severity: number; // 1 = highest
  headline: string;
  explanation: string;
  action: string;
  source: string;
}

export interface Program {
  name: string;
  whatItDoes: string;
  whoQualifies: string;
  howToStart: string;
  whyYouMatch: string;
  verified: boolean;
  source: string;
}

export interface CostProjection {
  ceiling: number | null;
  ceilingIsUncapped: boolean;
  alreadyPaidLow: number;
  remainingExposureLow: number;
  remainingExposureHigh: number;
  drivers: Driver[];
  warnings: Warning[];
  assistanceMatches: Program[];
}

// ---------- Section metadata ----------

export type PlanSectionId = 'situation' | 'cost' | 'diagnosis' | 'appointments' | 'life' | 'resources' | 'privacy';

export interface PlanSectionMeta {
  id: PlanSectionId;
  label: string;
  description: string;
  route: string;
}

export const PLAN_SECTIONS: PlanSectionMeta[] = [
  { id: 'situation', label: 'My Situation', description: 'Core intake that personalizes everything else', route: '/plan/situation' },
  { id: 'cost', label: 'Cost & Coverage', description: 'Insurance mechanics, cost projection, assistance matching', route: '/plan/cost' },
  { id: 'diagnosis', label: 'Understanding My Diagnosis', description: 'Plain-language explanation of stage and terms', route: '/plan/diagnosis' },
  { id: 'appointments', label: 'My Appointments', description: 'Question generator and visit debrief', route: '/plan/appointments' },
  { id: 'life', label: 'Work & Daily Life', description: 'Leave, transport, caregiving, childcare', route: '/plan/life' },
  { id: 'resources', label: 'Resources', description: 'Filtered directory of real organizations', route: '/plan/resources' },
];

// ---------- Initial empty profile ----------

export const INITIAL_PROFILE: PlanProfile = {
  entryPath: null,
  ageBand: null,
  sexAtBirth: null,
  smokingHistory: null,
  packYearsBand: null,
  familyHistory: [],
  priorScreenings: [],
  lastScreeningWindow: null,
  hasPrimaryCare: null,
  cancerType: null,
  stage: null,
  carePhase: null,
  treatments: [],
  hasNavigator: null,
  priorities: [],
  insuranceType: null,
  hasMedigap: null,
  hasPartD: null,
  isHDHP: null,
  deductibleRemaining: null,
  oopSpentBand: null,
  facilityType: null,
  networkChecked: null,
  drugRoute: [],
  billsInCollections: null,
  wantsAssistanceCheck: false,
  householdSize: null,
  fplBand: null,
  detailLevel: null,
  diagnosisTermsDiscussed: [],
  wantsExplained: [],
  offeredSecondOpinion: null,
  nextAppointmentType: null,
  nextAppointmentDate: null,
  companionComing: null,
  walkOutGoals: [],
  wantsChecklist: null,
  postVisitNotes: { whatTheyToldMe: '', whatINeedToDecide: '', whatHappensNext: '', whoToCall: '' },
  employment: null,
  employerSize: null,
  tenureOver12mo: null,
  paidLeave: null,
  transport: null,
  travelTimeBand: null,
  caregiver: null,
  dependentsAtHome: null,
  zipPrefix: null,
  language: null,
};
