import type { PlanProfile, CostProjection, Driver, Warning } from '../types';
import { matchAssistancePrograms } from './assistanceRules';

// Spec constants — every figure is a published 2026 plan year number.
export const C = {
  acaOopMax: 10600,
  hdhpOopMax: 8500,
  partBPremium: 202.90,
  partBDeductible: 283,
  partBCoinsurance: 0.20,
  partAInpatientDeductible: 1736, // per benefit period, not per year
  partDMaxDeductible: 615,
  partDOopCap: 2100,
  advantageMoop: 9250,
} as const;

// Richer, organized view of the same figures for engine/UI use.
export const CONSTANTS_2026 = {
  aca: {
    oopMaxIndividual: C.acaOopMax,
    oopMaxFamily: 21200,
    sourceNote: 'CMS 2026 Notice of Benefit and Payment Parameters',
  },
  hdhp: {
    oopMaxIndividual: C.hdhpOopMax,
    oopMaxFamily: 17000,
    sourceNote: 'IRS Revenue Procedure 2025-30 (2026 plan year)',
  },
  medicare: {
    partBPremiumMonthly: C.partBPremium,
    partBDeductible: C.partBDeductible,
    partBCoinsuranceRate: C.partBCoinsurance,
    partBHasOopCap: false,
    partAInpatientDeductible: C.partAInpatientDeductible,
    partADailyCoins61to90: 434,
    partADailyCoinsLifetimeReserve: 868,
    partDMaxDeductible: C.partDMaxDeductible,
    partDOopCap: C.partDOopCap,
    advantageInNetworkMoop: C.advantageMoop,
    sourceNote: 'CMS Medicare Costs 2026',
  },
} as const;

function estimateAlreadyPaid(oopSpentBand: PlanProfile['oopSpentBand']): number {
  switch (oopSpentBand) {
    case 'under500': return 250;
    case '500_2k': return 1250;
    case '2k_5k': return 3500;
    case 'over5k': return 6000;
    default: return 0;
  }
}

export function computeCostProjection(profile: PlanProfile): CostProjection {
  const ins = profile.insuranceType;
  const alreadyPaid = estimateAlreadyPaid(profile.oopSpentBand);
  const drivers: Driver[] = [];
  const warnings: Warning[] = [];
  let ceiling: number | null = null;
  let ceilingIsUncapped = false;

  // ---------- Ceiling logic ----------
  if (ins === 'employer' || ins === 'marketplace') {
    if (profile.isHDHP === 'yes') {
      ceiling = CONSTANTS_2026.hdhp.oopMaxIndividual;
      drivers.push({ label: 'HDHP out-of-pocket maximum', plainExplanation: `Your high-deductible plan caps your out-of-pocket costs at $${ceiling.toLocaleString()} for 2026.` });
    } else {
      ceiling = CONSTANTS_2026.aca.oopMaxIndividual;
      drivers.push({ label: 'ACA out-of-pocket maximum', plainExplanation: `Federal law caps your out-of-pocket costs at $${ceiling.toLocaleString()} for 2026. Your plan may set a lower limit.` });
    }
  } else if (ins === 'medicare_advantage') {
    ceiling = CONSTANTS_2026.medicare.advantageInNetworkMoop;
    drivers.push({ label: 'Medicare Advantage MOOP', plainExplanation: `Your Medicare Advantage plan caps in-network costs at $${ceiling.toLocaleString()} for 2026.` });
    if (profile.hasPartD === 'yes') {
      drivers.push({ label: 'Part D drug cap (separate)', plainExplanation: `Part D has a separate out-of-pocket cap of $${CONSTANTS_2026.medicare.partDOopCap.toLocaleString()}. This is in addition to your medical MOOP.` });
    }
  } else if (ins === 'medicare_original') {
    if (profile.hasMedigap === 'yes') {
      ceiling = 0;
      drivers.push({ label: 'Medigap supplement', plainExplanation: 'Your Medigap plan covers most or all of the cost-sharing that Original Medicare leaves behind. Your main cost is the Medigap premium itself.' });
    } else {
      ceilingIsUncapped = true;
      ceiling = null;
    }
  } else if (ins === 'medicaid') {
    ceiling = 0;
    drivers.push({ label: 'Medicaid coverage', plainExplanation: 'Medicaid covers nearly all costs with minimal or no cost-sharing. Focus on making sure your coverage stays active throughout treatment.' });
  } else if (ins === 'va_tricare') {
    ceiling = null;
    drivers.push({ label: 'VA/Tricare coverage', plainExplanation: 'Contact your facility beneficiary counselor for cost details specific to your coverage.' });
  } else if (ins === 'none') {
    ceiling = null;
  }

  const remainingLow = ceiling !== null ? Math.max(0, ceiling - alreadyPaid) : 0;
  const remainingHigh = ceiling !== null ? Math.max(0, ceiling - alreadyPaid) : 0;

  // ---------- Warnings (ranked by severity) ----------

  // 1. Uncapped Medicare
  if (ceilingIsUncapped) {
    warnings.push({
      id: 'uncapped_medicare',
      severity: 1,
      headline: 'Original Medicare has no annual limit on what you pay out of pocket',
      explanation: `Part B covers 80% after a $${C.partBDeductible} deductible and you owe the other 20% with no ceiling. Medigap or Medicare Advantage is what creates a cap.`,
      action: 'Worth a conversation this week — call 1-800-MEDICARE or a local SHIP counselor to talk through Medigap or Advantage options.',
      source: `CMS Medicare Costs 2026 — Part B deductible $${CONSTANTS_2026.medicare.partBDeductible}, 20% coinsurance, no OOP cap`,
    });
  }

  // 2. Screening-to-diagnostic flip
  if (profile.entryPath === 'not_screened' || profile.entryPath === 'awaiting_results') {
    warnings.push({
      id: 'screening_diagnostic_flip',
      severity: 2,
      headline: 'Screening vs. diagnostic billing matters',
      explanation: 'A screening colonoscopy is covered at $0 on most plans and on Medicare. The same procedure billed as diagnostic is not. Since 2022, federal rules say if a polyp is found and removed during what began as a screening, the whole procedure must still be covered as preventive.',
      action: 'Ask the billing office before the procedure: which code will you submit, and does that change if you find something?',
      source: 'Affordable Care Act §2713; CMS MLN Matters SE22008',
    });
  }

  // 3. Part B drugs not covered by Part D cap
  const isMedicare = ins === 'medicare_original' || ins === 'medicare_advantage';
  if (isMedicare && (profile.drugRoute.includes('infused') || profile.drugRoute.includes('injected'))) {
    warnings.push({
      id: 'partb_drugs_no_cap',
      severity: 3,
      headline: 'Infused drugs are billed under Part B, not Part D',
      explanation: `The $${CONSTANTS_2026.medicare.partDOopCap.toLocaleString()} cap protects your pill-form drugs under Part D. Infused chemotherapy is usually billed under Part B, which has no cap.`,
      action: 'Ask your oncologist which drugs are Part B vs. Part D, and ask your navigator about foundation copay funds for Part B drugs.',
      source: 'CMS Medicare Part B vs. Part D Drug Coverage Guidelines',
    });
  }

  // 4. Out-of-network does not count
  if (profile.networkChecked === 'no' || profile.networkChecked === 'unsure') {
    warnings.push({
      id: 'out_of_network',
      severity: 4,
      headline: 'Out-of-network costs do not count toward your out-of-pocket maximum',
      explanation: 'If any of your providers are out of network, what you pay them does not reduce your remaining out-of-pocket amount. Your actual exposure could be much higher than the ceiling shown.',
      action: 'Call your insurer and confirm every provider — oncologist, surgeon, anesthesiologist, pathology lab, and facility — is in-network before treatment begins.',
      source: 'No Surprises Act §2799A; ACA §2707',
    });
  }

  // 5. Premiums don't count
  if (ins && ins !== 'none' && ins !== 'unsure') {
    warnings.push({
      id: 'premiums_dont_count',
      severity: 5,
      headline: 'Premiums do not count toward your out-of-pocket maximum',
      explanation: 'The monthly premium you pay to have insurance is a separate cost. It is not included in any of the figures above.',
      action: 'When budgeting, add your annual premium cost on top of the out-of-pocket projection shown here.',
      source: 'CMS Glossary — Out-of-Pocket Maximum',
    });
  }

  // 6. Part A resets per benefit period
  if (isMedicare) {
    warnings.push({
      id: 'parta_resets',
      severity: 6,
      headline: 'Part A hospital deductible resets per benefit period',
      explanation: `The $${CONSTANTS_2026.medicare.partAInpatientDeductible.toLocaleString()} hospital deductible is per benefit period, not per year. Two separate hospital stays can mean paying it twice.`,
      action: 'Ask your care team whether any planned procedures might be scheduled to fall within the same benefit period.',
      source: `CMS Medicare Costs 2026 — Part A deductible $${CONSTANTS_2026.medicare.partAInpatientDeductible}`,
    });
  }

  // 7. Collections before screening
  if (profile.billsInCollections === 'yes') {
    warnings.push({
      id: 'collections_501r',
      severity: 7,
      headline: 'Bills in collections may be challengeable',
      explanation: 'If a nonprofit hospital sent your bill to collections without first screening you for financial assistance, that may violate IRS Section 501(r). You can raise it with the billing department, and escalate to the IRS or your state attorney general.',
      action: 'Call billing and say: "I would like to apply for your Section 501(r) Financial Assistance Policy before this bill moves further in collections."',
      source: 'IRS §501(r)(4) — Financial Assistance Policy Requirements',
    });
  }

  // Sort warnings by severity
  warnings.sort((a, b) => a.severity - b.severity);

  // ---------- Assistance matching ----------
  const assistanceMatches = matchAssistancePrograms(profile);

  return {
    ceiling,
    ceilingIsUncapped,
    alreadyPaidLow: alreadyPaid,
    remainingExposureLow: remainingLow,
    remainingExposureHigh: remainingHigh,
    drivers,
    warnings,
    assistanceMatches,
  };
}
