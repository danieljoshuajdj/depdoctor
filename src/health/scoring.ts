import type { AnalysisResult, Finding, FindingCategory, HealthScore, RequiredDoctorConfig } from '../types/index.js';
import { severityDeduction } from '../utils/severity.js';

const categories: FindingCategory[] = [
  'hygiene',
  'security',
  'freshness',
  'duplication',
  'maintainability',
  'install-performance',
  'runtime-impact',
  'bundle-impact',
  'compatibility'
];

export function scoreFindings(findings: Finding[], config: RequiredDoctorConfig): HealthScore {
  const breakdown = categories.map((category) => {
    const categoryFindings = findings.filter((finding) => finding.category === category);
    const rawDeduction = categoryFindings.reduce(
      (sum, finding) => sum + severityDeduction(finding.severity) * finding.confidence,
      0
    );
    const weight = config.scoring[category];
    const deductions = Math.min(100, rawDeduction * weight);
    const score = Math.max(0, Math.round(100 - deductions));
    return {
      category,
      score,
      weight,
      deductions: Math.round(deductions),
      explanation:
        categoryFindings.length === 0
          ? 'No material issues detected.'
          : `${categoryFindings.length} issue(s) reduced this category score.`
    };
  });

  const totalWeight = breakdown.reduce((sum, item) => sum + item.weight, 0);
  const overall = Math.round(
    breakdown.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight
  );

  return {
    overall,
    breakdown,
    grade: overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 70 ? 'C' : overall >= 55 ? 'D' : 'F'
  };
}

export function summarizeProblems(result: AnalysisResult): string[] {
  const counts = new Map<string, number>();
  for (const finding of result.findings) {
    const key = finding.title.replace(/ .*/, '');
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].map(([name, count]) => `${count} ${name.toLowerCase()} issue(s)`);
}
