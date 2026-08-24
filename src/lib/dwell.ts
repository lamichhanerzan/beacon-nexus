import type { Stage } from '../content/stages';

export type DwellStatus = 'early' | 'typical' | 'overdue' | 'unknown';
export type StallRisk = 'low' | 'moderate' | 'elevated';

export interface DwellResult {
  daysElapsed: number;
  status: DwellStatus;
  stallRisk: StallRisk;
  stallRiskText: string;
  verdict: string;
}

export function computeDwell(stage: Stage, dateEntered: string): DwellResult {
  if (!dateEntered) {
    const isUnknown = stage.timeline === null;
    return {
      daysElapsed: 0,
      status: isUnknown ? 'unknown' : 'early',
      stallRisk: 'low',
      stallRiskText: isUnknown
        ? 'STALL RISK: LOW — No start date entered'
        : `STALL RISK: LOW — 0 days at this step, typical is ${stage.timeline?.minDays}–${stage.timeline?.maxDays} days`,
      verdict: isUnknown
        ? "No start date entered. There is no published standard timeline for this step."
        : `No start date entered. The typical window for this step is ${stage.timeline?.minDays}–${stage.timeline?.maxDays} days.`
    };
  }

  const startDate = new Date(dateEntered);
  const now = new Date();
  
  // Set both dates to midnight for clean calendar day math
  const startMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = nowMidnight.getTime() - startMidnight.getTime();
  const daysElapsed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  // Determine Stall Risk
  let stallRisk: StallRisk = 'low';
  let stallRiskText = '';

  if (stage.timeline === null) {
    if (stage.escalateAfterDays !== null && daysElapsed > stage.escalateAfterDays) {
      stallRisk = 'elevated';
      stallRiskText = `STALL RISK: ELEVATED — ${daysElapsed} days at this step, escalation benchmark is ${stage.escalateAfterDays} days`;
    } else {
      stallRisk = 'low';
      stallRiskText = `STALL RISK: LOW — ${daysElapsed} day${daysElapsed === 1 ? '' : 's'} at this step (no published standard)`;
    }

    if (stage.escalateAfterDays !== null && daysElapsed > stage.escalateAfterDays) {
      return {
        daysElapsed,
        status: 'overdue',
        stallRisk,
        stallRiskText,
        verdict: `You have been in this step for ${daysElapsed} days. It is reasonable to check in with your clinic.`
      };
    }

    return {
      daysElapsed,
      status: 'unknown',
      stallRisk,
      stallRiskText,
      verdict: `You have been in this step for ${daysElapsed} day${daysElapsed === 1 ? '' : 's'}. There is no published standard timeline for this step.`
    };
  }

  const { minDays, maxDays } = stage.timeline;
  const escalateAfter = stage.escalateAfterDays ?? maxDays;

  // Stall Risk calculation rules:
  // - 'low': within or below typical range (daysElapsed <= maxDays)
  // - 'moderate': past typical range but under/at escalateAfterDays
  // - 'elevated': past escalateAfterDays
  if (daysElapsed > escalateAfter) {
    stallRisk = 'elevated';
    stallRiskText = `STALL RISK: ELEVATED — ${daysElapsed} days at this step, typical is under ${maxDays}`;
  } else if (daysElapsed > maxDays) {
    stallRisk = 'moderate';
    stallRiskText = `STALL RISK: MODERATE — ${daysElapsed} days at this step, typical is under ${maxDays}`;
  } else {
    stallRisk = 'low';
    stallRiskText = `STALL RISK: LOW — ${daysElapsed} day${daysElapsed === 1 ? '' : 's'} at this step, typical is ${minDays}–${maxDays} days`;
  }

  // Rule 3: Past escalateAfterDays -> overdue
  if (daysElapsed > escalateAfter) {
    return {
      daysElapsed,
      status: 'overdue',
      stallRisk,
      stallRiskText,
      verdict: `You have been waiting ${daysElapsed} days. The typical benchmark is ${minDays}–${maxDays} days. It's reasonable to check in.`
    };
  }

  // Rule 1: Below minDays -> early
  if (daysElapsed < minDays) {
    return {
      daysElapsed,
      status: 'early',
      stallRisk,
      stallRiskText,
      verdict: `Day ${daysElapsed} of waiting. This step typically takes ${minDays}–${maxDays} days.`
    };
  }

  // Rule 2: Within range -> typical
  return {
    daysElapsed,
    status: 'typical',
    stallRisk,
    stallRiskText,
    verdict: `Day ${daysElapsed} of waiting. This is within the standard timeframe (${minDays}–${maxDays} days).`
  };
}
