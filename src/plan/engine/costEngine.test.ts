import { describe, test, expect } from 'vitest';
import { computeCostProjection } from './costEngine';
import { INITIAL_PROFILE, assertNoBlockedFields } from '../types';
import type { PlanProfile } from '../types';

describe('Cost & Coverage Engine Tests', () => {

  test('Medicaid should project 0 ceiling and redirect guidance', () => {
    const profile: PlanProfile = {
      ...INITIAL_PROFILE,
      insuranceType: 'medicaid',
      oopSpentBand: 'under500',
    };
    const res = computeCostProjection(profile);
    expect(res.ceiling).toBe(0);
    expect(res.ceilingIsUncapped).toBe(false);
    expect(res.remainingExposureLow).toBe(0);
    expect(res.drivers[0].label).toBe('Medicaid coverage');
  });

  test('Employer or Marketplace without HDHP should use ACA cap', () => {
    const profile: PlanProfile = {
      ...INITIAL_PROFILE,
      insuranceType: 'employer',
      isHDHP: 'no',
      oopSpentBand: 'under500',
    };
    const res = computeCostProjection(profile);
    expect(res.ceiling).toBe(10600);
    expect(res.ceilingIsUncapped).toBe(false);
    expect(res.remainingExposureLow).toBe(10600 - 250); // estimate for under500 is 250
  });

  test('Employer or Marketplace with HDHP should use HDHP cap', () => {
    const profile: PlanProfile = {
      ...INITIAL_PROFILE,
      insuranceType: 'marketplace',
      isHDHP: 'yes',
      oopSpentBand: '500_2k',
    };
    const res = computeCostProjection(profile);
    expect(res.ceiling).toBe(8500);
    expect(res.ceilingIsUncapped).toBe(false);
    expect(res.remainingExposureLow).toBe(8500 - 1250); // estimate for 500_2k is 1250
  });

  test('Medicare Advantage should use advantage MOOP plus note Part D cap if has Part D', () => {
    const profile: PlanProfile = {
      ...INITIAL_PROFILE,
      insuranceType: 'medicare_advantage',
      hasPartD: 'yes',
      oopSpentBand: 'under500',
    };
    const res = computeCostProjection(profile);
    expect(res.ceiling).toBe(9250);
    expect(res.drivers.some(d => d.label === 'Part D drug cap (separate)')).toBe(true);
  });

  test('Original Medicare with Medigap should project low exposure (0 ceiling)', () => {
    const profile: PlanProfile = {
      ...INITIAL_PROFILE,
      insuranceType: 'medicare_original',
      hasMedigap: 'yes',
      oopSpentBand: 'under500',
    };
    const res = computeCostProjection(profile);
    expect(res.ceiling).toBe(0);
    expect(res.ceilingIsUncapped).toBe(false);
  });

  test('Original Medicare without Medigap should trigger uncapped Medicare warning and no ceiling', () => {
    const profile: PlanProfile = {
      ...INITIAL_PROFILE,
      insuranceType: 'medicare_original',
      hasMedigap: 'no',
      oopSpentBand: 'under500',
    };
    const res = computeCostProjection(profile);
    expect(res.ceiling).toBeNull();
    expect(res.ceilingIsUncapped).toBe(true);
    expect(res.warnings.some(w => w.id === 'uncapped_medicare')).toBe(true);
  });

  test('Uninsured should return no projection and direct to uninsured pathway', () => {
    const profile: PlanProfile = {
      ...INITIAL_PROFILE,
      insuranceType: 'none',
      oopSpentBand: 'under500',
    };
    const res = computeCostProjection(profile);
    expect(res.ceiling).toBeNull();
    expect(res.ceilingIsUncapped).toBe(false);
    expect(res.assistanceMatches.some(p => p.name.includes('BCCTP'))).toBe(false); // no cancer type yet
  });

  test('Medicare users should never see manufacturer copay cards', () => {
    const profileAdvantage: PlanProfile = {
      ...INITIAL_PROFILE,
      insuranceType: 'medicare_advantage',
    };
    const profileOriginal: PlanProfile = {
      ...INITIAL_PROFILE,
      insuranceType: 'medicare_original',
    };
    const resAdv = computeCostProjection(profileAdvantage);
    const resOrig = computeCostProjection(profileOriginal);
    
    expect(resAdv.assistanceMatches.some(p => p.name === 'Manufacturer copay cards')).toBe(false);
    expect(resOrig.assistanceMatches.some(p => p.name === 'Manufacturer copay cards')).toBe(false);
  });

  test('Commercial insurance users should see manufacturer copay cards', () => {
    const profile: PlanProfile = {
      ...INITIAL_PROFILE,
      insuranceType: 'employer',
    };
    const res = computeCostProjection(profile);
    expect(res.assistanceMatches.some(p => p.name === 'Manufacturer copay cards')).toBe(true);
  });

  test('Screening to diagnostic flip warning should fire when not_screened or awaiting_results', () => {
    const profileNotScreened: PlanProfile = {
      ...INITIAL_PROFILE,
      entryPath: 'not_screened',
    };
    const profileDiagnosed: PlanProfile = {
      ...INITIAL_PROFILE,
      entryPath: 'diagnosed',
    };
    const resNot = computeCostProjection(profileNotScreened);
    const resDiag = computeCostProjection(profileDiagnosed);

    expect(resNot.warnings.some(w => w.id === 'screening_diagnostic_flip')).toBe(true);
    expect(resDiag.warnings.some(w => w.id === 'screening_diagnostic_flip')).toBe(false);
  });

  test('Part B drug warning fires when Medicare + drugRoute includes infused or injected', () => {
    const profile: PlanProfile = {
      ...INITIAL_PROFILE,
      insuranceType: 'medicare_original',
      drugRoute: ['infused'],
    };
    const res = computeCostProjection(profile);
    expect(res.warnings.some(w => w.id === 'partb_drugs_no_cap')).toBe(true);
  });

  test('BLOCKED_FIELDS assertion should throw if blocked field key is provided', () => {
    expect(() => assertNoBlockedFields('firstName')).toThrow();
    expect(() => assertNoBlockedFields('socialSecurityNumber')).toThrow();
    expect(() => assertNoBlockedFields('exactIncome')).toThrow();
    expect(() => assertNoBlockedFields('ageBand')).not.toThrow();
  });

});
