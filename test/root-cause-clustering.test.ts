import { describe, expect, it } from 'vitest';
import { buildRootCauses } from '../src/reporters/terminal.js';
import type { AnalysisResult, Finding } from '../src/types/index.js';

const finding = (
  id: string,
  category: Finding['category'],
  packageName: string
): Finding => ({
  id,
  title: id,
  description: id,
  category,
  severity: 'medium',
  packageName,
  evidence: [],
  recommendation: 'Review',
  confidence: 1
});

describe('root-cause clustering', () => {
  it('groups symptoms into actionable causes instead of listing occurrences', () => {
    const findings = [
      finding('compatibility:framework-mismatch:react', 'compatibility', 'react-dom'),
      finding('duplicates:chalk', 'duplication', 'chalk'),
      finding('bloat:esbuild@1', 'install-performance', 'esbuild'),
      finding('audit:shell-quote:x', 'security', 'shell-quote'),
      finding('unused:left-pad', 'hygiene', 'left-pad')
    ];
    const result = {
      findings,
      usage: {
        packageUsage: new Map([['esbuild', { role: 'BUNDLER' }]])
      }
    } as any as AnalysisResult;
    const causes = buildRootCauses(result);
    expect(causes.map((cause) => cause.issue)).toEqual([
      'Framework mismatch',
      'Duplicate ecosystem',
      'Build tooling',
      'Security',
      'Unused dependencies'
    ]);
    expect(causes.every((cause) => cause.count === 1)).toBe(true);
  });
});
