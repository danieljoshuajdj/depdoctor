import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import Arborist from '@npmcli/arborist';
import type { DependencyEdge, DependencyGraph, DependencyNode, ProjectContext } from '../types/index.js';

type ArboristNode = {
  name?: string;
  version?: string;
  location?: string;
  path?: string;
  depth?: number;
  package?: {
    name?: string;
    version?: string;
    deprecated?: string;
    license?: string;
    engines?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    peerDependenciesMeta?: Record<string, { optional?: boolean }>;
    dependencies?: Record<string, string>;
    scripts?: Record<string, string>;
    repository?: string | { url?: string };
    homepage?: string;
  };
  children?: Map<string, ArboristNode>;
  edgesOut?: Map<string, { to?: ArboristNode; type?: string; spec?: string }>;
  dev?: boolean;
  optional?: boolean;
  peer?: boolean;
  bundled?: boolean;
};

export async function buildDependencyGraph(context: ProjectContext): Promise<DependencyGraph> {
  try {
    return await buildWithArborist(context);
  } catch {
    return buildFromPackageJson(context);
  }
}

async function buildWithArborist(context: ProjectContext): Promise<DependencyGraph> {
  const arborist = new Arborist({ path: context.root });
  const tree = (await arborist.loadActual()) as ArboristNode;
  const graph = emptyGraph('root@0.0.0');
  await visitArboristNode(tree, graph, 0);
  graph.rootId = nodeId(tree.package?.name ?? context.rootProject.name, tree.package?.version ?? '0.0.0');
  return graph;
}

async function visitArboristNode(node: ArboristNode, graph: DependencyGraph, depth: number): Promise<string> {
  const name = node.package?.name ?? node.name ?? 'root';
  const version = node.package?.version ?? node.version ?? '0.0.0';
  const id = nodeId(name, version);
  const repository =
    typeof node.package?.repository === 'string'
      ? node.package.repository
      : node.package?.repository?.url;

  if (graph.nodes.has(id)) return id;

  const path = node.path;
  graph.nodes.set(id, {
    id,
    name,
    version,
    path,
    depth,
    dev: node.dev,
    optional: node.optional,
    peer: node.peer,
    bundled: node.bundled,
    deprecated: node.package?.deprecated,
    license: node.package?.license,
    engines: node.package?.engines,
    peerDependencies: node.package?.peerDependencies ?? {},
    peerDependenciesMeta: node.package?.peerDependenciesMeta,
    dependencies: node.package?.dependencies ?? {},
    dependents: [],
    sizeBytes: path ? await directorySize(path, depth > 0 ? 1 : 0) : 0,
    scripts: node.package?.scripts ?? {},
    repository,
    homepage: node.package?.homepage
  });
  addByName(graph, name, id);

  for (const edge of node.edgesOut?.values() ?? []) {
    if (!edge.to) continue;
    const toId = await visitArboristNode(edge.to, graph, depth + 1);
    graph.edges.push({
      from: id,
      to: toId,
      type: normalizeEdgeType(edge.type),
      spec: edge.spec
    });
    graph.nodes.get(toId)?.dependents.push(id);
  }

  for (const child of node.children?.values() ?? []) {
    await visitArboristNode(child, graph, depth + 1);
  }

  return id;
}

function buildFromPackageJson(context: ProjectContext): DependencyGraph {
  const rootId = nodeId(context.rootProject.name, '0.0.0');
  const graph = emptyGraph(rootId);
  graph.nodes.set(rootId, {
    id: rootId,
    name: context.rootProject.name,
    version: '0.0.0',
    depth: 0,
    peerDependencies: context.rootProject.peerDependencies,
    peerDependenciesMeta: context.rootProject.peerDependenciesMeta,
    dependencies: context.rootProject.dependencies,
    dependents: [],
    sizeBytes: 0,
    scripts: {}
  });
  addByName(graph, context.rootProject.name, rootId);

  for (const [type, deps] of [
    ['prod', context.rootProject.dependencies],
    ['dev', context.rootProject.devDependencies],
    ['peer', context.rootProject.peerDependencies],
    ['optional', context.rootProject.optionalDependencies]
  ] as const) {
    for (const [name, spec] of Object.entries(deps)) {
      const id = nodeId(name, spec);
      graph.nodes.set(id, {
        id,
        name,
        version: spec,
        spec,
        depth: 1,
        dev: type === 'dev',
        optional: type === 'optional',
        peer: type === 'peer',
        peerDependencies: {},
        dependencies: {},
        dependents: [rootId],
        sizeBytes: 0,
        scripts: {}
      });
      addByName(graph, name, id);
      graph.edges.push({ from: rootId, to: id, type, spec });
    }
  }
  return graph;
}

export function traceChains(graph: DependencyGraph, targetId: string, maxChains = 12): DependencyNode[][] {
  const chains: DependencyNode[][] = [];
  const reverse = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const list = reverse.get(edge.to) ?? [];
    list.push(edge.from);
    reverse.set(edge.to, list);
  }

  function walk(id: string, path: string[]): void {
    if (chains.length >= maxChains) return;
    if (id === graph.rootId || !reverse.has(id)) {
      chains.push([id, ...path].map((node) => graph.nodes.get(node)).filter(Boolean) as DependencyNode[]);
      return;
    }
    for (const parent of reverse.get(id) ?? []) {
      if (path.includes(parent)) continue;
      walk(parent, [id, ...path]);
    }
  }

  walk(targetId, []);
  return chains;
}

export function nodeId(name: string, version: string): string {
  return `${name}@${version}`;
}

function emptyGraph(rootId: string): DependencyGraph {
  return {
    rootId,
    nodes: new Map(),
    edges: [],
    byName: new Map()
  };
}

function addByName(graph: DependencyGraph, name: string, id: string): void {
  const ids = graph.byName.get(name) ?? [];
  if (!ids.includes(id)) ids.push(id);
  graph.byName.set(name, ids);
}

function normalizeEdgeType(type?: string): DependencyEdge['type'] {
  if (type === 'dev' || type === 'peer' || type === 'optional' || type === 'workspace') return type;
  return type === 'prod' ? 'prod' : 'transitive';
}

async function directorySize(path: string, depth: number): Promise<number> {
  if (depth <= 0) return 0;
  try {
    const entries = await readdir(path, { withFileTypes: true });
    const sizes = await Promise.all(
      entries.slice(0, 200).map(async (entry) => {
        const full = join(path, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === '.git') return 0;
          return directorySize(full, depth - 1);
        }
        return (await stat(full)).size;
      })
    );
    return sizes.reduce((sum, value) => sum + value, 0);
  } catch {
    return 0;
  }
}

export function relativePackagePath(context: ProjectContext, node: DependencyNode): string {
  return node.path ? relative(context.root, node.path) : node.id;
}
