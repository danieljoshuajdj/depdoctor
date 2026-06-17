import type { Severity } from '../types/index.js';

export const severityRank: Record<Severity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

export function maxSeverity(a: Severity, b: Severity): Severity {
  return severityRank[a] >= severityRank[b] ? a : b;
}

export function severityDeduction(severity: Severity): number {
  return {
    info: 1,
    low: 3,
    medium: 7,
    high: 14,
    critical: 24
  }[severity];
}
