import { PatientProfile } from '../types';

export const DEMO_PROFILES: Record<string, Partial<PatientProfile>> = {
  earlyStageBreast: {
    cancerType: 'Breast',
    stage: 'I',
    detailLevel: 'balanced',
    carePhase: 'just_diagnosed',
    insuranceType: 'employer',
    employment: 'full_time',
    employerSize: '50plus',
    tenureOver12mo: 'yes',
    transport: 'own_car',
    caregiver: 'lives_with',
    dependentsAtHome: 'children',
  },
  advancedMetastatic: {
    cancerType: 'Lung',
    stage: 'IV',
    detailLevel: 'full',
    carePhase: 'in_treatment',
    insuranceType: 'medicare',
    employment: 'retired',
    transport: 'someone_drives',
    caregiver: 'far',
    dependentsAtHome: 'none',
  },
  uninsuredYoungAdult: {
    cancerType: 'Colon',
    stage: 'II',
    detailLevel: 'simple',
    carePhase: 'seeking_second_opinion',
    insuranceType: 'uninsured',
    employment: 'part_time',
    employerSize: 'under50',
    tenureOver12mo: 'no',
    transport: 'transit_rideshare',
    caregiver: 'none',
    dependentsAtHome: 'none',
  }
};
