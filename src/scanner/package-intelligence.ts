import pacote from 'pacote';
import type { DependencyGraph, PackageIntelligence, ProjectContext } from '../types/index.js';
import { mapLimit } from '../utils/concurrency.js';

type Packument = {
  name: string;
  'dist-tags'?: { latest?: string };
  versions?: Record<string, { deprecated?: string; license?: string; repository?: unknown }>;
  time?: Record<string, string>;
  maintainers?: unknown[];
};

export async function collectPackageIntelligence(
  context: ProjectContext,
  graph: DependencyGraph,
  onlineMetadata = false
): Promise<Map<string, PackageIntelligence>> {
  const names = [...graph.byName.keys()].filter((name) => !context.config.ignorePackages.includes(name));
  const intelligence = new Map<string, PackageIntelligence>();

  for (const name of names) {
    const nodes = graph.byName.get(name)?.map((id) => graph.nodes.get(id)).filter(Boolean) ?? [];
    const deprecated = nodes.find((node) => node?.deprecated)?.deprecated;
    intelligence.set(name, {
      name,
      deprecated,
      license: nodes.find((node) => node?.license)?.license,
      repository: nodes.find((node) => node?.repository)?.repository
    });
  }

  if (context.config.offline || !onlineMetadata) return intelligence;

  await mapLimit(names, 8, async (name) => {
    try {
      const packument = (await pacote.packument(name, { fullMetadata: false })) as Packument;
      const latest = packument['dist-tags']?.latest;
      const latestMeta = latest ? packument.versions?.[latest] : undefined;
      intelligence.set(name, {
        ...intelligence.get(name),
        name,
        latest,
        deprecated: latestMeta?.deprecated ?? intelligence.get(name)?.deprecated,
        publishedAt: latest ? packument.time?.[latest] : undefined,
        maintainers: packument.maintainers?.length,
        license: latestMeta?.license ?? intelligence.get(name)?.license,
        versions: Object.keys(packument.versions ?? {}).slice(-20)
      });
    } catch {
      // Network metadata is opportunistic; deterministic analysis remains authoritative.
    }
  });

  return intelligence;
}
