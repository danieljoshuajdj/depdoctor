import type { AnalysisResult, Severity } from '../types/index.js';
import { severityRank } from '../utils/severity.js';

export function renderCiAnnotations(result: AnalysisResult): string {
  const failOn = result.context.config.ci.failOn;
  return result.findings
    .filter((finding) => severityRank[finding.severity] >= severityRank[failOn as Severity])
    .map((finding) => `::warning title=${escape(finding.title)}::${escape(finding.recommendation)}`)
    .join('\n');
}

function escape(value: string): string {
  return value.replace(/\r?\n/g, '%0A').replace(/:/g, '%3A').replace(/,/g, '%2C');
}
