import type { Finding, RemediationPlan } from '../types/index.js';

export function buildRemediationPlan(findings: Finding[]): RemediationPlan[] {
  const grouped = new Map<string, Finding[]>();
  for (const finding of findings) {
    const key = finding.fix?.type ?? finding.category;
    grouped.set(key, [...(grouped.get(key) ?? []), finding]);
  }

  return [...grouped.entries()]
    .map(([key, group]) => ({
      id: `plan:${key}`,
      title: titleFor(key),
      priority: group.reduce((sum, finding) => sum + priorityFor(finding.severity), 0),
      difficulty: group.some((finding) => finding.fix && !finding.fix.safe) ? ('medium' as const) : ('easy' as const),
      impact: group.some((finding) => ['critical', 'high'].includes(finding.severity)) ? ('high' as const) : ('medium' as const),
      actions: group.flatMap((finding) => (finding.fix ? [finding.fix] : [])),
      rationale: group
        .slice(0, 3)
        .map((finding) => finding.recommendation)
        .join(' ')
    }))
    .sort((a, b) => b.priority - a.priority);
}

function titleFor(key: string): string {
  return {
    dedupe: 'Collapse duplicate dependency versions',
    upgrade: 'Upgrade or replace deprecated packages',
    security: 'Reduce supply-chain attack surface',
    compatibility: 'Resolve install and runtime compatibility risks',
    freshness: 'Refresh stale ecosystem dependencies',
    hygiene: 'Clean dependency hygiene issues'
  }[key] ?? `Address ${key} findings`;
}

function priorityFor(severity: string): number {
  return { critical: 100, high: 70, medium: 30, low: 10, info: 2 }[severity] ?? 5;
}
