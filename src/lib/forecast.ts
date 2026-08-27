export interface TransitionBenchmark {
  id: string;
  fromStageId: string;
  toStageId: string;
  label: string;
  medianDays: number;
  p75Days: number; // slower-but-still-normal upper range
  sourceLabel: string;
}

export interface ForecastNode {
  stageId: string;
  shortLabel: string;
  order: number;
  isLogged: boolean;
  loggedDateStr?: string; // 'YYYY-MM-DD'
  formattedLoggedDate?: string; // 'Aug 3'
  isProjected: boolean;
  projectedMedianDateStr?: string;
  projectedP75DateStr?: string;
  projectedRangeLabel?: string; // e.g. "~Sep 14 – Sep 28"
  cumMedianDays: number;
  cumP75Days: number;
}

export interface DriftCalculation {
  status: 'ahead_or_on_track' | 'behind_minor' | 'behind_major';
  driftDays: number; // positive = behind, negative = ahead
  summaryText: string;
  longestGapLabel?: string;
  totalActualDays: number;
  totalBenchmarkDays: number;
}

export interface MomentumState {
  status: 'on_track' | 'check_in' | 'no_next_step';
  headline: string;
  message: string;
  showCallScript: boolean;
  nextAppointmentDate?: string;
}

/**
 * Published transition duration medians and p75 ranges
 */
export const TRANSITION_BENCHMARKS: TransitionBenchmark[] = [
  {
    id: 'finding_to_imaging',
    fromStageId: 'finding',
    toStageId: 'imaging',
    label: 'Abnormal finding → Diagnostic imaging',
    medianDays: 7,
    p75Days: 12,
    sourceLabel: 'National Quality Measures for Breast Centers (NQMBC)'
  },
  {
    id: 'imaging_to_biopsy',
    fromStageId: 'imaging',
    toStageId: 'biopsy',
    label: 'Diagnostic imaging → Biopsy procedure',
    medianDays: 6,
    p75Days: 10,
    sourceLabel: 'National Quality Measures for Breast Centers (NQMBC)'
  },
  {
    id: 'biopsy_to_pathology',
    fromStageId: 'biopsy',
    toStageId: 'path_wait',
    label: 'Biopsy procedure → Pathology sample processing',
    medianDays: 4,
    p75Days: 7,
    sourceLabel: 'College of American Pathologists (CAP)'
  },
  {
    id: 'pathology_to_results',
    fromStageId: 'path_wait',
    toStageId: 'results',
    label: 'Pathology processing → Results review appointment',
    medianDays: 3,
    p75Days: 5,
    sourceLabel: 'College of American Pathologists (CAP)'
  },
  {
    id: 'results_to_staging',
    fromStageId: 'results',
    toStageId: 'staging',
    label: 'Diagnosis → Staging scans & molecular results',
    medianDays: 14,
    p75Days: 21,
    sourceLabel: 'CAP / IASLC / AMP Guideline'
  },
  {
    id: 'staging_to_specialist',
    fromStageId: 'staging',
    toStageId: 'specialist',
    label: 'Staging results → Specialist consultations',
    medianDays: 7,
    p75Days: 12,
    sourceLabel: 'ASCO Care Quality Guidelines'
  },
  {
    id: 'specialist_to_plan',
    fromStageId: 'specialist',
    toStageId: 'treatment_plan',
    label: 'Specialist consults → Treatment plan decision',
    medianDays: 27,
    p75Days: 38,
    sourceLabel: 'National Cancer Database (NCDB)'
  }
];

const ORDERED_STAGES = [
  { id: 'finding', label: 'Finding', shortLabel: 'Finding', order: 1 },
  { id: 'imaging', label: 'Imaging', shortLabel: 'Imaging', order: 2 },
  { id: 'biopsy', label: 'Biopsy', shortLabel: 'Biopsy', order: 3 },
  { id: 'path_wait', label: 'Pathology', shortLabel: 'Pathology', order: 4 },
  { id: 'results', label: 'Results', shortLabel: 'Results', order: 5 },
  { id: 'staging', label: 'Staging', shortLabel: 'Staging', order: 6 },
  { id: 'specialist', label: 'Specialists', shortLabel: 'Specialists', order: 7 },
  { id: 'treatment_plan', label: 'Plan Given', shortLabel: 'Plan', order: 8 }
];

function addDaysToDate(baseDate: Date, days: number): Date {
  const result = new Date(baseDate.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Computes projected schedule timeline for all 8 stages based on logged dates & published medians
 */
export function computeForecast(
  stageDates: Record<string, string>,
  anchorDateStr?: string
): { nodes: ForecastNode[]; summaryRangeWeeks: string } {
  // Find latest logged stage as anchor point
  let lastLoggedIdx = -1;
  let lastLoggedDate = anchorDateStr ? new Date(anchorDateStr + 'T00:00:00') : new Date();

  ORDERED_STAGES.forEach((st, idx) => {
    if (stageDates[st.id]) {
      lastLoggedIdx = idx;
      lastLoggedDate = new Date(stageDates[st.id] + 'T00:00:00');
    }
  });

  // Default to today if no dates logged
  if (lastLoggedIdx === -1 && anchorDateStr) {
    lastLoggedDate = new Date(anchorDateStr + 'T00:00:00');
  }

  let cumMedianFromAnchor = 0;
  let cumP75FromAnchor = 0;

  const nodes: ForecastNode[] = ORDERED_STAGES.map((st, idx) => {
    const isLogged = !!stageDates[st.id];

    if (isLogged) {
      const d = new Date(stageDates[st.id] + 'T00:00:00');
      return {
        stageId: st.id,
        shortLabel: st.shortLabel,
        order: st.order,
        isLogged: true,
        loggedDateStr: stageDates[st.id],
        formattedLoggedDate: formatDateShort(d),
        isProjected: false,
        cumMedianDays: 0,
        cumP75Days: 0
      };
    }

    // Unlogged stage — calculate projections relative to last logged node
    if (idx > lastLoggedIdx) {
      // Accumulate transition medians from last logged node to this node
      let medianDelta = 0;
      let p75Delta = 0;

      const startIdx = lastLoggedIdx >= 0 ? lastLoggedIdx : 0;
      for (let i = startIdx; i < idx; i++) {
        const bench = TRANSITION_BENCHMARKS[i];
        if (bench) {
          medianDelta += bench.medianDays;
          p75Delta += bench.p75Days;
        }
      }

      cumMedianFromAnchor = medianDelta;
      cumP75FromAnchor = p75Delta;

      const projectedMedianDate = addDaysToDate(lastLoggedDate, medianDelta);
      const projectedP75Date = addDaysToDate(lastLoggedDate, p75Delta);

      const medianFormatted = formatDateShort(projectedMedianDate);
      const p75Formatted = formatDateShort(projectedP75Date);

      // Render as range if multiple steps out
      const rangeLabel =
        p75Delta - medianDelta > 3
          ? `~${medianFormatted} – ${p75Formatted}`
          : `~${medianFormatted}`;

      return {
        stageId: st.id,
        shortLabel: st.shortLabel,
        order: st.order,
        isLogged: false,
        isProjected: true,
        projectedMedianDateStr: medianFormatted,
        projectedP75DateStr: p75Formatted,
        projectedRangeLabel: rangeLabel,
        cumMedianDays: cumMedianFromAnchor,
        cumP75Days: cumP75FromAnchor
      };
    }

    // Past unlogged stage
    return {
      stageId: st.id,
      shortLabel: st.shortLabel,
      order: st.order,
      isLogged: false,
      isProjected: false,
      cumMedianDays: 0,
      cumP75Days: 0
    };
  });

  return {
    nodes,
    summaryRangeWeeks: '6 to 9 weeks'
  };
}

/**
 * Computes factual drift: cumulative actual elapsed vs benchmark medians
 */
export function computeDrift(
  stageDates: Record<string, string>
): DriftCalculation {
  const loggedStageIds = ORDERED_STAGES.filter((st) => !!stageDates[st.id]).map((st) => st.id);

  if (loggedStageIds.length < 2) {
    return {
      status: 'ahead_or_on_track',
      driftDays: 0,
      summaryText: 'Your path is moving at about the typical pace.',
      totalActualDays: 0,
      totalBenchmarkDays: 0
    };
  }

  // Calculate actual days from first logged date to last logged date
  const firstStageId = loggedStageIds[0];
  const lastStageId = loggedStageIds[loggedStageIds.length - 1];

  const firstDate = new Date(stageDates[firstStageId] + 'T00:00:00');
  const lastDate = new Date(stageDates[lastStageId] + 'T00:00:00');

  const diffTime = lastDate.getTime() - firstDate.getTime();
  const totalActualDays = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  // Sum benchmark medians for the completed interval
  const firstIdx = ORDERED_STAGES.findIndex((s) => s.id === firstStageId);
  const lastIdx = ORDERED_STAGES.findIndex((s) => s.id === lastStageId);

  let totalBenchmarkDays = 0;
  let maxGapDays = 0;
  let longestGapLabel = '';

  for (let i = firstIdx; i < lastIdx; i++) {
    const bench = TRANSITION_BENCHMARKS[i];
    if (bench) {
      totalBenchmarkDays += bench.medianDays;

      // Check if actual transition date exists to measure individual gap
      const stepFromDateStr = stageDates[bench.fromStageId];
      const stepToDateStr = stageDates[bench.toStageId];

      if (stepFromDateStr && stepToDateStr) {
        const stepFrom = new Date(stepFromDateStr + 'T00:00:00');
        const stepTo = new Date(stepToDateStr + 'T00:00:00');
        const stepActual = Math.round((stepTo.getTime() - stepFrom.getTime()) / (1000 * 60 * 60 * 24));
        const gapExtra = stepActual - bench.medianDays;

        if (gapExtra > maxGapDays) {
          maxGapDays = gapExtra;
          longestGapLabel = `${bench.fromStageId} to ${bench.toStageId}`;
        }
      }
    }
  }

  const driftDays = totalActualDays - totalBenchmarkDays;

  if (driftDays <= 0) {
    return {
      status: 'ahead_or_on_track',
      driftDays,
      summaryText: 'Your path is moving at about the typical pace.',
      totalActualDays,
      totalBenchmarkDays
    };
  }

  if (driftDays <= 14) {
    return {
      status: 'behind_minor',
      driftDays,
      summaryText: `Your path is running about ${driftDays} days longer than typical so far.`,
      totalActualDays,
      totalBenchmarkDays
    };
  }

  return {
    status: 'behind_major',
    driftDays,
    summaryText: `Your path is running about ${driftDays} days longer than typical.${
      longestGapLabel ? ` The longest gap was ${longestGapLabel.replace('_', ' ')}.` : ''
    }`,
    longestGapLabel,
    totalActualDays,
    totalBenchmarkDays
  };
}

/**
 * Computes momentum state (On track / Worth a check-in / No next step scheduled)
 */
export function computeMomentum(
  currentStageId: string,
  daysAtCurrentStage: number,
  upcomingAppointments: Array<{ date: string; typeId: string }>
): MomentumState {
  // Find benchmark for current stage
  const benchIdx = ORDERED_STAGES.findIndex((s) => s.id === currentStageId);
  const currentBench = TRANSITION_BENCHMARKS[benchIdx] || { medianDays: 14 };

  const isPastBenchmark = daysAtCurrentStage > currentBench.medianDays;
  const hasFutureAppointment = upcomingAppointments.length > 0;
  const nextAppt = hasFutureAppointment ? upcomingAppointments[0] : null;

  const nextApptFormatted = nextAppt
    ? new Date(nextAppt.date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    : undefined;

  // 1. On track
  if (!isPastBenchmark && hasFutureAppointment) {
    return {
      status: 'on_track',
      headline: 'On track',
      message: `You have your next appointment scheduled for ${nextApptFormatted}. Nothing needed right now.`,
      showCallScript: false,
      nextAppointmentDate: nextApptFormatted
    };
  }

  // 2. Worth a check-in
  if (isPastBenchmark && hasFutureAppointment) {
    return {
      status: 'check_in',
      headline: 'Worth a check-in',
      message: `You're past the typical wait for this step. Worth confirming your results are on track before your ${nextApptFormatted} visit.`,
      showCallScript: false,
      nextAppointmentDate: nextApptFormatted
    };
  }

  // 3. No next step scheduled (Stall risk point)
  return {
    status: 'no_next_step',
    headline: 'No next step scheduled',
    message: `You don't have a next appointment scheduled, and you're past the typical wait. This is the most common point where things stall — not because anyone forgot, but because no one owns the handoff. Here's what to say when you call.`,
    showCallScript: true
  };
}
