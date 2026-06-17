import { writeFile } from 'node:fs/promises';
import type { AnalysisResult, ReporterOptions } from '../types/index.js';
import { renderCiAnnotations } from './ci.js';
import { renderHtml } from './html.js';
import { renderJson } from './json.js';
import { renderMarkdown } from './markdown.js';
import { renderTerminal } from './terminal.js';

export async function renderReport(result: AnalysisResult, options: ReporterOptions = {}): Promise<string> {
  const format = options.format ?? (options.ci ? 'ci' : 'terminal');
  const output =
    format === 'json'
      ? renderJson(result)
      : format === 'markdown'
        ? renderMarkdown(result)
        : format === 'html'
          ? renderHtml(result)
          : format === 'ci'
            ? renderCiAnnotations(result)
            : renderTerminal(result, options);

  if (options.output) {
    await writeFile(options.output, output, 'utf8');
  }

  return output;
}
