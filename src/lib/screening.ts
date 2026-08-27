export interface PriorScreening {
  type: string; // 'mammogram' | 'pap_hpv' | 'colonoscopy' | 'stool_test' | 'lung_ct' | 'none'
  recency: string; // 'within_year' | '1-3_years' | '3-5_years' | 'more_than_5_years' | 'never'
}

export interface ScreeningInput {
  age: number;
  sex: 'female' | 'male' | 'unspecified';
  smokingStatus: 'never' | 'former' | 'current';
  packYears?: number;
  yearsSinceQuit?: number;
  familyHistory: string[]; // e.g. ['breast', 'ovarian', 'colorectal', 'prostate', 'lung', 'uterine', 'pancreatic', 'other']
  priorScreenings: PriorScreening[];
  zip?: string;
  parishSlug?: string;
}

export type ScreeningStatus = 'due' | 'eligible' | 'up_to_date' | 'not_applicable' | 'discuss';

export interface ScreeningResult {
  id: string;
  name: string;
  status: ScreeningStatus;
  reason: string;        // plain language, explains WHY
  guideline: string;     // the USPSTF rule in one line
  options?: string[];    // e.g. for colorectal: different test types
  notes?: string;        // e.g. cost, at-home availability
}

export function evaluateScreenings(input: ScreeningInput): ScreeningResult[] {
  const results: ScreeningResult[] = [];
  const { age, sex, smokingStatus, packYears = 0, yearsSinceQuit = 0, familyHistory, priorScreenings } = input;

  // Helper to check prior screening recency
  const getPriorRecency = (types: string[]): string => {
    const found = priorScreenings.find((p) => types.includes(p.type));
    return found ? found.recency : 'never';
  };

  // =========================================================================
  // 1. BREAST — Mammogram
  // =========================================================================
  if (sex === 'female' || sex === 'unspecified') {
    const mammoRecency = getPriorRecency(['mammogram']);
    const hasFamilyHistory = familyHistory.includes('breast') || familyHistory.includes('ovarian');

    if (age >= 40 && age <= 74) {
      let status: ScreeningStatus = 'due';
      let reason = 'Recommended starting at 40 every 2 years.';

      if (mammoRecency === 'within_year') {
        status = 'up_to_date';
        reason = 'Your last mammogram was within the past year. Mammograms are recommended every 2 years.';
      } else if (mammoRecency === '1-3_years') {
        status = 'eligible';
        reason = 'Your last mammogram was 1–3 years ago. You are in or approaching the 2-year interval.';
      } else if (mammoRecency === '3-5_years' || mammoRecency === 'more_than_5_years') {
        status = 'due';
        reason = 'Your last mammogram was over 3 years ago. USPSTF recommends screening every 2 years.';
      } else {
        status = 'due';
        reason = 'You are in the recommended age range (40–74) and indicated you have not had a recent mammogram.';
      }

      results.push({
        id: 'breast',
        name: 'Breast Cancer Screening (Mammogram)',
        status,
        reason,
        guideline: 'USPSTF recommends mammography every 2 years for women ages 40 to 74.'
      });
    } else if (age < 40 && hasFamilyHistory) {
      results.push({
        id: 'breast',
        name: 'Breast Cancer Screening (Individual Discussion)',
        status: 'discuss',
        reason: 'Guidelines start at 40, but family history may mean starting earlier. Worth discussing with a doctor.',
        guideline: 'USPSTF recommends mammography every 2 years for women ages 40 to 74.'
      });
    } else {
      results.push({
        id: 'breast',
        name: 'Breast Cancer Screening (Mammogram)',
        status: 'not_applicable',
        reason: age < 40
          ? 'Routine USPSTF mammography screening is recommended starting at age 40 for average-risk women.'
          : 'Routine USPSTF mammography screening is recommended through age 74.',
        guideline: 'USPSTF recommends mammography every 2 years for women ages 40 to 74.'
      });
    }
  }

  // =========================================================================
  // 2. CERVICAL — Pap / HPV test
  // =========================================================================
  if (sex === 'female' || sex === 'unspecified') {
    const cervicalRecency = getPriorRecency(['pap_hpv']);

    if (age >= 21 && age <= 65) {
      let status: ScreeningStatus = 'due';
      let reason = 'Recommended every 3 to 5 years for women ages 21 to 65.';

      if (cervicalRecency === 'within_year' || cervicalRecency === '1-3_years') {
        status = 'up_to_date';
        reason = 'Your last Pap or HPV test was within the past 3 years.';
      } else if (cervicalRecency === '3-5_years' && age >= 30) {
        status = 'up_to_date';
        reason = 'For ages 30 to 65, HPV co-testing every 5 years keeps you up to date.';
      } else if (cervicalRecency === '3-5_years' && age < 30) {
        status = 'due';
        reason = 'For ages 21 to 29, Pap tests are recommended every 3 years. It is time for your next check.';
      } else if (cervicalRecency === 'more_than_5_years') {
        status = 'due';
        reason = 'Your last cervical screening was more than 5 years ago. USPSTF recommends screening every 3 to 5 years.';
      } else {
        status = 'due';
        reason = 'You are in the recommended age window (21–65) and indicated you have not been screened recently.';
      }

      results.push({
        id: 'cervical',
        name: 'Cervical Cancer Screening (Pap / HPV test)',
        status,
        reason,
        guideline: 'USPSTF recommends cervical cancer screening for women ages 21 to 65.'
      });
    } else {
      results.push({
        id: 'cervical',
        name: 'Cervical Cancer Screening (Pap / HPV test)',
        status: 'not_applicable',
        reason: age < 21
          ? 'Routine cervical screening is recommended starting at age 21.'
          : 'Routine USPSTF cervical screening is not recommended after age 65 for individuals with adequate prior negative screenings.',
        guideline: 'USPSTF recommends cervical cancer screening for women ages 21 to 65.'
      });
    }
  }

  // =========================================================================
  // 3. COLORECTAL — Stool Test or Colonoscopy
  // =========================================================================
  const colonoscopyRecency = getPriorRecency(['colonoscopy']);
  const stoolRecency = getPriorRecency(['stool_test']);
  const hasColorectalFamilyHistory = familyHistory.includes('colorectal');

  if (age >= 45 && age <= 75) {
    let status: ScreeningStatus = 'due';
    let reason = 'Recommended starting at 45.';

    const isColonoscopyCurrent = colonoscopyRecency === 'within_year' || colonoscopyRecency === '1-3_years' || colonoscopyRecency === '3-5_years';
    const isStoolCurrent = stoolRecency === 'within_year';

    if (isColonoscopyCurrent || isStoolCurrent) {
      status = 'up_to_date';
      reason = 'You have had a colonoscopy or stool test within the recommended screening timeframe.';
    } else if (colonoscopyRecency === 'more_than_5_years' || stoolRecency === '1-3_years' || stoolRecency === '3-5_years' || stoolRecency === 'more_than_5_years') {
      status = 'due';
      reason = 'Stool tests are required annually and colonoscopies every 10 years. You are due for your next test.';
    } else {
      status = 'due';
      reason = 'Recommended starting at 45. You indicated you have not been screened for colon cancer.';
    }

    results.push({
      id: 'colorectal',
      name: 'Colorectal Cancer Screening',
      status,
      reason,
      guideline: 'USPSTF recommends colorectal cancer screening for everyone ages 45 to 75.',
      options: [
        'Colonoscopy — every 10 years, at a hospital or endoscopy center',
        'Stool test (FIT) — every year, mailed to your home, done at home, mailed back',
        'Stool DNA test (Cologuard) — every 3 years, also at home',
        'CT colonography — every 5 years'
      ],
      notes: 'If travel is a barrier, the at-home stool tests are a real option. Ask your clinic about getting one mailed to you.'
    });
  } else if (age < 45 && hasColorectalFamilyHistory) {
    results.push({
      id: 'colorectal',
      name: 'Colorectal Cancer Screening (Early Discussion)',
      status: 'discuss',
      reason: 'Guidelines start at 45, but a parent, sibling, or child with colorectal cancer often means starting at 40 — or 10 years before their diagnosis age, whichever is earlier.',
      guideline: 'USPSTF recommends colorectal cancer screening for everyone ages 45 to 75.',
      options: [
        'Colonoscopy — every 10 years, at a hospital or endoscopy center',
        'Stool test (FIT) — every year, mailed to your home, done at home, mailed back',
        'Stool DNA test (Cologuard) — every 3 years, also at home',
        'CT colonography — every 5 years'
      ],
      notes: 'If travel is a barrier, the at-home stool tests are a real option. Ask your clinic about getting one mailed to you.'
    });
  } else {
    results.push({
      id: 'colorectal',
      name: 'Colorectal Cancer Screening',
      status: 'not_applicable',
      reason: age < 45
        ? 'Routine colorectal cancer screening begins at age 45 for average-risk individuals.'
        : 'Routine screening is recommended through age 75.',
      guideline: 'USPSTF recommends colorectal cancer screening for everyone ages 45 to 75.'
    });
  }

  // =========================================================================
  // 4. LUNG — Low-dose CT Scan
  // =========================================================================
  const lungCtRecency = getPriorRecency(['lung_ct']);
  const meetsSmokingCriteria = (smokingStatus === 'current') || (smokingStatus === 'former' && yearsSinceQuit <= 15);
  const meetsPackYearCriteria = packYears >= 20;

  if (age >= 50 && age <= 80 && meetsPackYearCriteria && meetsSmokingCriteria) {
    let status: ScreeningStatus = 'due';
    let reason = 'You meet the age, pack-year history, and smoking timeline criteria for annual low-dose CT lung screening.';

    if (lungCtRecency === 'within_year') {
      status = 'up_to_date';
      reason = 'You had a low-dose CT scan within the past year. Annual scans are recommended.';
    } else {
      status = 'due';
      reason = 'You qualify for annual low-dose CT screening and are due for your scan.';
    }

    results.push({
      id: 'lung',
      name: 'Lung Cancer Screening (Low-Dose CT)',
      status,
      reason,
      guideline: 'USPSTF recommends annual low-dose CT for adults 50 to 80 with a 20 pack-year history who currently smoke or quit within the past 15 years.',
      notes: "Very few eligible people get this scan. If you qualify, it's one of the most effective screenings available."
    });
  } else if (smokingStatus === 'current' || smokingStatus === 'former') {
    let reason = 'You do not currently meet all criteria for routine low-dose CT lung screening.';
    if (age < 50 || age > 80) {
      reason = `Age (${age}) is outside the recommended 50 to 80 age window.`;
    } else if (!meetsPackYearCriteria) {
      reason = `Pack-year history (${packYears}) is below the 20 pack-year threshold.`;
    } else if (smokingStatus === 'former' && yearsSinceQuit > 15) {
      reason = `Quit smoking more than 15 years ago (${yearsSinceQuit} years ago).`;
    }

    results.push({
      id: 'lung',
      name: 'Lung Cancer Screening (Low-Dose CT)',
      status: 'not_applicable',
      reason,
      guideline: 'USPSTF recommends annual low-dose CT for adults 50 to 80 with a 20 pack-year history who currently smoke or quit within the past 15 years.'
    });
  } else {
    results.push({
      id: 'lung',
      name: 'Lung Cancer Screening (Low-Dose CT)',
      status: 'not_applicable',
      reason: 'Lung cancer CT screening is recommended specifically for adults with a significant smoking history.',
      guideline: 'USPSTF recommends annual low-dose CT for adults 50 to 80 with a 20 pack-year history who currently smoke or quit within the past 15 years.'
    });
  }

  // =========================================================================
  // 5. PROSTATE — PSA Test
  // =========================================================================
  if (sex === 'male' || sex === 'unspecified') {
    if (age >= 55 && age <= 69) {
      results.push({
        id: 'prostate',
        name: 'Prostate Cancer Screening (PSA Test)',
        status: 'discuss',
        reason: 'This one is a conversation, not a checkbox. Benefits and harms are close enough that guidelines say it should be your decision, made with a doctor.',
        guideline: 'USPSTF recommends that men ages 55 to 69 make an individual decision with their doctor. It is not automatically recommended.'
      });
    } else if (age >= 70) {
      results.push({
        id: 'prostate',
        name: 'Prostate Cancer Screening (PSA Test)',
        status: 'not_applicable',
        reason: 'USPSTF does not recommend routine PSA screening after 70.',
        guideline: 'USPSTF recommends that men ages 55 to 69 make an individual decision with their doctor. It is not automatically recommended.'
      });
    } else {
      results.push({
        id: 'prostate',
        name: 'Prostate Cancer Screening (PSA Test)',
        status: 'not_applicable',
        reason: 'Routine PSA screening is not recommended prior to age 55 for average-risk individuals.',
        guideline: 'USPSTF recommends that men ages 55 to 69 make an individual decision with their doctor. It is not automatically recommended.'
      });
    }
  }

  // =========================================================================
  // 6. GENETIC COUNSELING — Risk Assessment Referral
  // =========================================================================
  const highRiskFamilyTypes = familyHistory.filter((h) =>
    ['breast', 'ovarian', 'pancreatic', 'prostate'].includes(h)
  );
  const hasOvarianOrPancreatic = familyHistory.includes('ovarian') || familyHistory.includes('pancreatic');
  const triggerGenetic = highRiskFamilyTypes.length >= 2 || hasOvarianOrPancreatic;

  if (triggerGenetic) {
    results.push({
      id: 'genetic',
      name: 'Genetic Risk Assessment & Counseling Referral',
      status: 'discuss',
      reason: 'Your family history may meet criteria for genetic risk assessment. This is a referral to a genetic counselor, not a test. Ask your primary care provider.',
      guideline: 'USPSTF recommends risk assessment and referral for genetic counseling for individuals with a personal or family history associated with increased risk for BRCA1/2 or hereditary cancer syndromes.'
    });
  }

  return results;
}
