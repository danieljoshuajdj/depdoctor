import chalk from 'chalk';
import type { AnalysisResult, ExplainResult, Finding, ReporterOptions } from '../types/index.js';
import { formatBytes } from '../utils/bytes.js';

const icon = {
  ok: 'OK',
  warn: '!',
  fail: 'x',
  info: 'i'
};

export function renderTerminal(result: AnalysisResult, options: ReporterOptions = {}): string {
  const lines: string[] = [];
  lines.push(chalk.bold('\npkg-ct'));
  lines.push(
    `${scoreBadge(result.score.overall)} ${chalk.bold(`Project Health Score: ${result.score.overall}/100 (${result.score.grade})`)}`
  );
  lines.push(chalk.dim(`Analyzed ${result.graph.nodes.size} packages in ${result.durationMs}ms`));
  lines.push('');

  lines.push(chalk.bold('Top Findings'));
  const top = [...result.findings].sort(bySeverity).slice(0, options.verbose ? 20 : 8);
  if (top.length === 0) {
    lines.push(`${chalk.green(icon.ok)} No material dependency issues detected.`);
  } else {
    for (const finding of top) {
      lines.push(formatFinding(finding));
    }
  }

  lines.push('');
  lines.push(chalk.bold('Health Breakdown'));
  for (const item of result.score.breakdown) {
    lines.push(`${bar(item.score)} ${item.category.padEnd(20)} ${String(item.score).padStart(3)}/100`);
  }

  if (result.remediation.length > 0) {
    lines.push('');
    lines.push(chalk.bold('Remediation Plan'));
    for (const plan of result.remediation.slice(0, 5)) {
      lines.push(
        `${chalk.cyan('->')} ${chalk.bold(plan.title)} ${chalk.dim(`impact:${plan.impact} difficulty:${plan.difficulty}`)}`
      );
      if (plan.actions[0]?.commands[0]) lines.push(chalk.dim(`  ${plan.actions[0].commands[0]}`));
    }
  }

  return lines.join('\n');
}

export function renderExplain(explain: ExplainResult): string {
  const lines: string[] = [];
  lines.push(chalk.bold(`\n${explain.packageName} dependency explanation`));

  if (explain.nodes.length === 0) {
    lines.push(chalk.yellow(`No installed or declared package named ${explain.packageName} was found.`));
    return lines.join('\n');
  }

  lines.push('');
  lines.push(chalk.bold('Why it exists'));
  for (const chain of explain.chains.slice(0, 5)) {
    lines.push(renderChain(chain.map((node) => `${node.name}@${node.version}`)));
  }

  lines.push('');
  lines.push(chalk.bold('Impact'));
  lines.push(`- ${formatBytes(explain.installImpactBytes)} estimated install footprint`);
  lines.push(`- duplicated ${explain.duplicates.length > 0 ? `${explain.duplicates.length} times` : '0 times'}`);
  if (explain.health?.latest) lines.push(`- latest version: ${explain.health.latest}`);
  if (explain.health?.weeklyDownloads !== undefined) {
    lines.push(`- weekly downloads: ${explain.health.weeklyDownloads.toLocaleString()}`);
  }
  if (explain.health?.maintainers !== undefined) lines.push(`- maintainers: ${explain.health.maintainers}`);
  if (explain.health?.ageDays !== undefined) lines.push(`- latest publish age: ${explain.health.ageDays} days`);
  lines.push(`- safe removal probability: ${explain.safeRemovalProbability}`);

  if (explain.findings.length > 0) {
    lines.push('');
    lines.push(chalk.bold('Risks'));
    for (const finding of explain.findings.slice(0, 5)) lines.push(formatFinding(finding));
  }

  lines.push('');
  lines.push(chalk.bold('Alternatives'));
  lines.push(explain.alternatives.map((item) => `- ${item}`).join('\n'));
  return lines.join('\n');
}

export function renderRoast(result: AnalysisResult): string {
  const duplicates = result.findings.filter((finding) => finding.category === 'duplication').length;
  const deprecated = result.findings.filter((finding) => finding.id.startsWith('deprecated:')).length;
  const native = result.findings.filter((finding) => finding.id.startsWith('native:')).length;
  const lifecycle = result.findings.filter((finding) => finding.id.startsWith('lifecycle:')).length;
  const unused = result.findings.filter((finding) => finding.id.startsWith('unused:')).length;
  const peer = result.findings.filter((finding) => finding.id.startsWith('peer:')).length;
  const audit = result.findings.filter((finding) => finding.id.startsWith('audit:')).length;
  const nodeCount = result.graph.nodes.size;
  const findingCount = result.findings.length;

  const lines = [
    chalk.bold('\nDependency Roast'),
    pick(nodeCount, [
      `Your project has ${chalk.bold(String(nodeCount))} packages. At this point npm install is a lifestyle choice.`,
      `${chalk.bold(String(nodeCount))} packages detected. Somewhere, a lockfile is asking for a chair and a glass of water.`,
      `I counted ${chalk.bold(String(nodeCount))} packages. That is not a dependency tree; that is a small bureaucracy.`
    ]),
    pick(findingCount, [
      `${findingCount} findings. The dependency graph has notes, and most of them are written in red pen.`,
      `${findingCount} things to look at. Not a disaster, but definitely not a spa day.`,
      `${findingCount} findings surfaced. The package manager has entered its feedback era.`
    ]),
    duplicates
      ? pick(duplicates, [
          `${duplicates} duplicate package family issue(s). The lockfile is doing jazz with no rhythm section.`,
          `${duplicates} duplicate family issue(s). Same package, multiple versions, maximum emotional distance.`,
          `${duplicates} duplicate family issue(s). Your dependencies brought their cousins, and nobody coordinated outfits.`
        ])
      : 'No duplicate families. Suspiciously disciplined. I will allow it.',
    unused
      ? pick(unused, [
          `${unused} direct package(s) look unused. They may be config-driven, or they may just be freeloading.`,
          `${unused} possible unused direct package(s). Some may be innocent. Some know what they did.`,
          `${unused} package(s) were not found in imports. pkg-ct is side-eyeing them, not convicting them.`
        ])
      : 'No unused direct packages surfaced. The manifest is either clean or very good at hiding things.',
    peer
      ? `${peer} peer dependency issue(s). The ecosystem compatibility committee has failed to reach consensus.`
      : 'No peer dependency drama detected. A rare diplomatic achievement.',
    deprecated
      ? `${deprecated} deprecated package(s). Some of this dependency tree still thinks callbacks are the future.`
      : 'No deprecated packages surfaced. The past has been kept at a polite distance.',
    native
      ? `${native} native install risk(s). CI will be fine, assuming every machine owns a compiler and a calming playlist.`
      : 'No native build drama detected. Your containers may sleep tonight.',
    lifecycle
      ? `${lifecycle} install script package(s). The install phase has side quests.`
      : 'No install lifecycle surprises. Refreshing, frankly.',
    audit
      ? `${audit} audit issue(s). Security has entered the chat and brought receipts.`
      : 'No audit findings in this run. Security did not throw a chair today.',
    `Health score: ${result.score.overall}/100. ${roastVerdict(result.score.overall)}`
  ];
  return lines.join('\n');
}

function formatFinding(finding: Finding): string {
  const color =
    finding.severity === 'critical' || finding.severity === 'high'
      ? chalk.red
      : finding.severity === 'medium'
        ? chalk.yellow
        : chalk.gray;
  const marker = finding.severity === 'critical' || finding.severity === 'high' ? icon.fail : icon.warn;
  return `${color(marker)} ${chalk.bold(finding.title)} ${chalk.dim(`[${finding.category}/${finding.severity}]`)}\n  ${finding.recommendation}`;
}

function renderChain(parts: string[]): string {
  return parts.map((part, index) => `${'  '.repeat(index)}${index === 0 ? '' : '`-- '}${part}`).join('\n');
}

function scoreBadge(score: number): string {
  if (score >= 85) return chalk.green(icon.ok);
  if (score >= 70) return chalk.yellow(icon.warn);
  return chalk.red(icon.fail);
}

function bar(score: number): string {
  const width = 18;
  const filled = Math.round((score / 100) * width);
  const content = '#'.repeat(filled) + '-'.repeat(width - filled);
  return score >= 80 ? chalk.green(content) : score >= 60 ? chalk.yellow(content) : chalk.red(content);
}

function bySeverity(a: Finding, b: Finding): number {
  const rank = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
  return rank[b.severity] - rank[a.severity];
}

function roastVerdict(score: number): string {
  if (score >= 90) return 'Annoyingly healthy. I wanted drama and got responsible engineering.';
  if (score >= 75) return 'Mostly fine, with a few dependencies wearing suspicious fake mustaches.';
  if (score >= 60) return 'Stable enough to ship, chaotic enough to keep an eye on.';
  if (score >= 45) return 'Technically alive. Please do not ask the lockfile to run a marathon.';
  return 'This dependency tree needs an architect, a plan, and possibly a quiet afternoon.';
}

function pick(seed: number, lines: string[]): string {
  return lines[Math.abs(seed) % lines.length] ?? lines[0] ?? '';
}
