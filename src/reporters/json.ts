import type { AnalysisResult } from '../types/index.js';

export function renderJson(result: AnalysisResult): string {
  return JSON.stringify(
    {
      ...result,
      graph: {
        rootId: result.graph.rootId,
        nodes: [...result.graph.nodes.values()],
        edges: result.graph.edges
      }
    },
    null,
    2
  );
}
