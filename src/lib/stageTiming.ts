import type { Stage } from '../content/stages';

/** Whole days between a yyyy-mm-dd string and today. Null when unparseable or empty. */
export function daysSince(date: string): number | null {
  if (!date) return null;
  const d = new Date(date + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  return Math.max(0, Math.round((Date.now() - d.getTime()) / 86400000));
}

export function isOverdue(stage: Stage, days: number | null): boolean {
  return stage.escalateAfterDays != null && days != null && days > stage.escalateAfterDays;
}

export function rangeLabel(stage: Stage): string {
  return stage.timeline
    ? `${stage.timeline.minDays}\u2013${stage.timeline.maxDays} days`
    : 'varies';
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Percentage offsets for the benchmark range bar. */
export function barGeometry(stage: Stage, days: number | null) {
  if (!stage.timeline) return null;
  const { minDays, maxDays } = stage.timeline;
  const span = Math.max(maxDays * 1.6, (days ?? 0) * 1.15, 14);
  const pct = (v: number) => `${((v / span) * 100).toFixed(1)}%`;
  return {
    bandLeft: pct(minDays),
    bandWidth: pct(maxDays - minDays),
    nowLeft: pct(days ?? 0),
    scaleMid: `day ${Math.round(span / 2)}`,
    scaleMax: `day ${Math.round(span)}`,
  };
}
