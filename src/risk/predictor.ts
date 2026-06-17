import npa from 'npm-package-arg';
import satisfies from 'semver/functions/satisfies.js';
import type { DependencyGraph, Finding, ProjectContext } from '../types/index.js';

export interface InstallRiskPrediction {
  packageSpec: string;
  risk: 'low' | 'medium' | 'high';
  warnings: string[];
  blockers: string[];
  likelyConflicts: string[];
}

export function predictInstallRisk(
  packageSpec: string,
  context: ProjectContext,
  graph: DependencyGraph,
  findings: Finding[]
): InstallRiskPrediction {
  const parsed = npa(packageSpec);
  const warnings: string[] = [];
  const blockers: string[] = [];
  const likelyConflicts = new Set<string>();

  for (const finding of findings) {
    if (finding.category === 'compatibility' && finding.packageName) {
      likelyConflicts.add(finding.packageName);
    }
  }

  const installed = graph.byName.get(parsed.name ?? packageSpec);
  if (installed?.length) {
    warnings.push(`${parsed.name} is already present in ${installed.length} version(s).`);
    if (installed.length > 1) {
      likelyConflicts.add(parsed.name ?? packageSpec);
    }
  }

  const nodeVersion = process.versions.node;
  if (!satisfies(nodeVersion, '>=20.11.0')) {
    warnings.push(`Current Node ${nodeVersion} is below the package baseline used by this tool.`);
  }

  if (context.packageManager === 'unknown') {
    warnings.push('No recognized lockfile was found; install prediction has lower confidence.');
  }

  if (context.isMonorepo) {
    warnings.push('Monorepo install may create workspace drift if ranges are not aligned.');
  }

  const highFindings = findings.filter((finding) => finding.severity === 'high' || finding.severity === 'critical');
  if (highFindings.length > 0) {
    warnings.push(`${highFindings.length} existing high-risk dependency issue(s) may compound install failures.`);
  }

  const risk =
    blockers.length > 0 || likelyConflicts.size > 4
      ? 'high'
      : likelyConflicts.size > 0 || warnings.length > 2
        ? 'medium'
        : 'low';

  return {
    packageSpec,
    risk,
    warnings,
    blockers,
    likelyConflicts: [...likelyConflicts].slice(0, 8)
  };
}
