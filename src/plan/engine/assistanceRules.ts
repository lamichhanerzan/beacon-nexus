import type { PlanProfile, Program } from '../types';

export function matchAssistancePrograms(profile: PlanProfile): Program[] {
  const matches: Program[] = [];
  const ins = profile.insuranceType;
  const isMedicare = ins === 'medicare_original' || ins === 'medicare_advantage';
  const isInsured = ins && ins !== 'none' && ins !== 'unsure';

  // Manufacturer copay cards — employer/marketplace ONLY
  if (ins === 'employer' || ins === 'marketplace') {
    matches.push({
      name: 'Manufacturer copay cards',
      whatItDoes: 'Drug manufacturers offer cards that reduce or eliminate copays for specific medications.',
      whoQualifies: 'Patients with commercial (employer or marketplace) insurance.',
      howToStart: 'Ask your oncologist or pharmacist if a copay card is available for your prescribed medications.',
      whyYouMatch: 'You have commercial insurance, which is eligible for manufacturer copay assistance.',
      verified: true,
      source: 'PhRMA Patient Assistance Program Directory',
    });
  }

  // Suppress copay cards for Medicare and show explanation
  if (isMedicare) {
    matches.push({
      name: 'Nonprofit copay foundations (not manufacturer cards)',
      whatItDoes: 'Manufacturer copay cards are not legal to use with Medicare. Nonprofit foundations are your copay path. These include PAN Foundation, HealthWell Foundation, and Patient Advocate Foundation Co-Pay Relief.',
      whoQualifies: 'Medicare beneficiaries with qualifying diagnoses and financial need.',
      howToStart: 'Search by diagnosis at panfoundation.org, healthwellfoundation.org, and copays.org.',
      whyYouMatch: 'You have Medicare, so nonprofit foundations are your copay assistance path instead of manufacturer cards.',
      verified: true,
      source: 'OIG Advisory Opinion 14-01 — Anti-Kickback Safe Harbor for Copay Assistance',
    });
  }

  // Foundation copay funds — any insured user
  if (isInsured && !isMedicare) {
    matches.push({
      name: 'Foundation copay funds',
      whatItDoes: 'Nonprofit foundations cover copays and coinsurance for specific disease funds. Includes PAN Foundation, HealthWell Foundation, Patient Advocate Foundation Co-Pay Relief, CancerCare Co-Payment Assistance, and Leukemia & Lymphoma Society (blood cancers).',
      whoQualifies: 'Insured patients with qualifying diagnoses and financial need.',
      howToStart: 'Search by diagnosis at panfoundation.org, healthwellfoundation.org, and copays.org. These funds open and close as their funding cycles refill. If your diagnosis fund is closed, ask to be added to the reopening notification list.',
      whyYouMatch: 'You have insurance and may qualify based on your diagnosis and income.',
      verified: true,
      source: 'PAN Foundation, HealthWell Foundation, PAF Co-Pay Relief, CancerCare, LLS',
    });
  }

  // CFAC — always
  matches.push({
    name: 'Cancer Financial Assistance Coalition (CFAC)',
    whatItDoes: 'A searchable database of financial assistance programs for cancer patients, covering copays, transportation, housing, and more.',
    whoQualifies: 'Anyone with a cancer diagnosis.',
    howToStart: 'Search at cancerfac.org by the type of help you need.',
    whyYouMatch: 'This is a comprehensive directory available to all cancer patients.',
    verified: true,
    source: 'cancerfac.org — Coalition of 70+ organizations',
  });

  // Hospital charity care — everyone
  matches.push({
    name: 'Hospital financial assistance (charity care)',
    whatItDoes: 'Nonprofit hospitals are legally required to have a financial assistance policy under IRS Section 501(r). This can reduce or eliminate your bill regardless of insurance status.',
    whoQualifies: 'Everyone. You do not need to be uninsured. Many programs cover patients up to 300–400% of the federal poverty level.',
    howToStart: 'Call billing and say: "I would like to request an application for your Section 501(r) Financial Assistance Policy." This is widely underused.',
    whyYouMatch: 'Available to all patients at nonprofit hospitals, regardless of insurance.',
    verified: true,
    source: 'IRS §501(r)(4) — Financial Assistance Policy Requirements',
  });

  // BCCTP — uninsured, under 65, breast or cervical
  if (ins === 'none' && profile.ageBand !== '65_74' && profile.ageBand !== '75plus') {
    const ct = profile.cancerType?.toLowerCase() || '';
    if (ct.includes('breast') || ct.includes('cervical')) {
      matches.push({
        name: 'Breast and Cervical Cancer Treatment Program (BCCTP)',
        whatItDoes: 'Provides Medicaid coverage for uninsured individuals diagnosed with breast or cervical cancer. Some states extend to colorectal and prostate cancer.',
        whoQualifies: 'Uninsured individuals under 65 diagnosed with breast or cervical cancer. The program has no income or resource test at the Medicaid stage, though the federal screening program it flows from is limited to 250% FPL.',
        howToStart: 'Contact your state Medicaid office or the CDC NBCCEDP at 1-800-CDC-INFO.',
        whyYouMatch: 'You are uninsured with a breast or cervical cancer diagnosis.',
        verified: true,
        source: 'CDC National Breast and Cervical Cancer Early Detection Program',
      });
    }
  }

  // SSDI
  if (profile.employment === 'not_working' || (profile.carePhase === 'in_treatment' && profile.paidLeave === 'none')) {
    matches.push({
      name: 'Social Security Disability Insurance (SSDI)',
      whatItDoes: 'Monthly disability payments for people unable to work due to a medical condition expected to last at least 12 months.',
      whoQualifies: 'Workers with sufficient work history who are unable to perform substantial gainful activity. Certain cancers qualify for the Compassionate Allowances fast track.',
      howToStart: 'Apply at ssa.gov or call 1-800-772-1213. Note: there is typically a 5-month waiting period before payments begin, roughly 6 months total.',
      whyYouMatch: profile.employment === 'not_working' ? 'You are not currently working.' : 'You are in treatment with no paid leave available.',
      verified: true,
      source: 'SSA Compassionate Allowances; SSA SSDI Program',
    });
  }

  // Transportation and lodging
  if (profile.transport === 'none_reliable' || profile.travelTimeBand === '60_120' || profile.travelTimeBand === 'over120') {
    matches.push({
      name: 'Transportation and lodging assistance',
      whatItDoes: 'ACS Hope Lodge provides free lodging near treatment centers. Patient Advocate Foundation offers transportation-related grants. Angel Flight provides free air travel for treatment.',
      whoQualifies: 'Cancer patients who must travel for treatment, especially those without reliable transportation or traveling over 60 minutes.',
      howToStart: 'Search Hope Lodge at cancer.org/hopelodge. Apply for PAF grants at patientadvocate.org.',
      whyYouMatch: profile.transport === 'none_reliable' ? 'You indicated no reliable transportation.' : 'Your travel time to treatment is significant.',
      verified: true,
      source: 'American Cancer Society Hope Lodge; Patient Advocate Foundation',
    });
  }

  // Childcare or home care
  if (profile.dependentsAtHome && profile.dependentsAtHome !== 'none') {
    matches.push({
      name: 'CancerCare grants for dependents',
      whatItDoes: 'CancerCare provides grants that cover transportation, childcare, and home care — categories most other programs do not cover.',
      whoQualifies: 'Cancer patients and caregivers with dependents at home.',
      howToStart: 'Apply at cancercare.org or call 1-800-813-HOPE.',
      whyYouMatch: `You have ${profile.dependentsAtHome === 'both' ? 'children and an older adult' : profile.dependentsAtHome} depending on you at home.`,
      verified: true,
      source: 'CancerCare Financial Assistance Program',
    });
  }

  return matches;
}
