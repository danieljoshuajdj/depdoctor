import { describe, expect, it } from 'vitest';
import { calculateAging, classifyPackageActivity } from '../src/health/aging.js';
import type { AnalysisResult } from '../src/types/index.js';

describe('calculateAging realism validation', () => {
  const buildResult = (nodes: any[], intelligence: any[]): AnalysisResult => {
    const nodeMap = new Map<string, any>();
    const byName = new Map<string, string[]>();
    for (const node of nodes) {
      nodeMap.set(node.id, node);
      byName.set(node.name, [...(byName.get(node.name) ?? []), node.id]);
    }
    return {
      context: { rootProject: { dependencies: {}, devDependencies: {} } },
      graph: { rootId: 'root-pkg@1.0.0', nodes: nodeMap, byName },
      packageIntelligence: intelligence,
      findings: [],
      score: { overall: 100, breakdown: [] }
    } as any as AnalysisResult;
  };

  it('uses npm publish age when registry metadata is available', () => {
    const result = buildResult(
      [{ id: 'some-pkg@1.0.0', name: 'some-pkg', version: '1.0.0', dependents: [] }],
      [{ name: 'some-pkg', ageDays: 120 }]
    );
    expect(calculateAging(result).averageAgeDays).toBe(120);
  });

  it('reports unknown instead of deriving age from a SemVer number', () => {
    const result = buildResult(
      [{ id: 'some-pkg@9.8.7', name: 'some-pkg', version: '9.8.7', dependents: [] }],
      []
    );
    const aging = calculateAging(result);
    expect(aging.averageAgeDays).toBe(0);
    expect(aging.packages[0]).toMatchObject({ name: 'some-pkg', status: 'UNKNOWN' });
  });

  it.each([-50, 50_000, Number.NaN])('rejects invalid age metadata: %s', (ageDays) => {
    const result = buildResult(
      [{ id: 'bad@1.0.0', name: 'bad', version: '1.0.0', dependents: [] }],
      [{ name: 'bad', ageDays }]
    );
    expect(calculateAging(result).averageAgeDays).toBe(0);
    expect(calculateAging(result).packages[0]?.status).toBe('UNKNOWN');
  });

  it('classifies explicit repository archive metadata without a heuristic', () => {
    expect(classifyPackageActivity({
      name: 'archived-pkg',
      ageDays: 900,
      repositoryArchived: true
    })).toMatchObject({
      status: 'ARCHIVED',
      heuristic: false
    });
  });

  it('classifies old packages with recent repository activity as maintained', () => {
    expect(classifyPackageActivity({
      name: 'maintained-pkg',
      ageDays: 900,
      repositoryPushedAt: new Date().toISOString()
    }).status).toBe('OLD_MAINTAINED');
  });

  it('labels long-term stability as an explicit download/current-version heuristic', () => {
    const activity = classifyPackageActivity({
      name: 'stable-pkg',
      ageDays: 900,
      weeklyDownloads: 500_000,
      isOutdated: false
    });
    expect(activity.status).toBe('LONG_TERM_STABLE');
    expect(activity.heuristic).toBe(true);
    expect(activity.evidence).toContain('Installed release matches the latest npm dist-tag');
  });
});
