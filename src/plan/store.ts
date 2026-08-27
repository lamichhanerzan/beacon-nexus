import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PlanProfile, PlanSectionId } from './types';
import { INITIAL_PROFILE, assertNoBlockedFields } from './types';

interface PlanStore {
  profile: PlanProfile;
  activeSection: PlanSectionId;
  setActiveSection: (section: PlanSectionId) => void;
  setField: <K extends keyof PlanProfile>(key: K, value: PlanProfile[K]) => void;
  setFields: (partial: Partial<PlanProfile>) => void;
  clearAll: () => void;
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set) => ({
      profile: { ...INITIAL_PROFILE },
      activeSection: 'situation',

      setActiveSection: (section) => set({ activeSection: section }),

      setField: (key, value) => {
        assertNoBlockedFields(key as string);
        set((state) => ({
          profile: { ...state.profile, [key]: value },
        }));
      },

      setFields: (partial) => {
        for (const key of Object.keys(partial)) {
          assertNoBlockedFields(key);
        }
        set((state) => ({
          profile: { ...state.profile, ...partial },
        }));
      },

      clearAll: () => {
        set({ profile: { ...INITIAL_PROFILE }, activeSection: 'situation' });
      },
    }),
    {
      name: 'beacon-plan-store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// ---------- Completion helpers ----------

export function getSectionCompletion(profile: PlanProfile, sectionId: PlanSectionId): { answered: number; total: number } {
  switch (sectionId) {
    case 'situation': {
      const base = [
        profile.entryPath, profile.ageBand, profile.sexAtBirth,
        profile.smokingHistory, profile.hasPrimaryCare,
      ];
      const baseAnswered = base.filter((v) => v !== null).length;
      const isDiagnosed = profile.entryPath === 'diagnosed';
      if (isDiagnosed) {
        const extra = [profile.cancerType, profile.stage, profile.carePhase, profile.hasNavigator];
        const extraAnswered = extra.filter((v) => v !== null).length;
        return { answered: baseAnswered + extraAnswered + (profile.familyHistory.length > 0 ? 1 : 0) + (profile.priorities.length > 0 ? 1 : 0), total: 11 };
      }
      return { answered: baseAnswered + (profile.familyHistory.length > 0 ? 1 : 0), total: 6 };
    }
    case 'cost': {
      const fields = [
        profile.insuranceType, profile.deductibleRemaining,
        profile.oopSpentBand, profile.networkChecked,
        profile.billsInCollections,
      ];
      return { answered: fields.filter((v) => v !== null).length + (profile.drugRoute.length > 0 ? 1 : 0), total: 6 };
    }
    case 'diagnosis': {
      const fields = [profile.detailLevel, profile.offeredSecondOpinion];
      return { answered: fields.filter((v) => v !== null).length + (profile.wantsExplained.length > 0 ? 1 : 0), total: 3 };
    }
    case 'appointments': {
      const fields = [profile.nextAppointmentType, profile.companionComing, profile.wantsChecklist];
      return { answered: fields.filter((v) => v !== null).length + (profile.walkOutGoals.length > 0 ? 1 : 0), total: 4 };
    }
    case 'life': {
      const fields = [
        profile.employment, profile.paidLeave, profile.transport,
        profile.travelTimeBand, profile.caregiver, profile.dependentsAtHome,
      ];
      return { answered: fields.filter((v) => v !== null).length, total: 6 };
    }
    case 'resources':
      return { answered: 0, total: 0 };
    default:
      return { answered: 0, total: 0 };
  }
}
