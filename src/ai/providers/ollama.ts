import type { AiExplanationRequest, AiProvider } from './types.js';

export class OllamaProvider implements AiProvider {
  name = 'ollama';

  constructor(
    private readonly model = 'llama3.1',
    private readonly baseUrl = 'http://localhost:11434'
  ) {}

  async explain(request: AiExplanationRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        prompt: `Summarize this Node.js dependency analysis for a senior engineer without inventing data:\n${JSON.stringify({
          score: request.result.score,
          findings: request.result.findings.slice(0, 20),
          remediation: request.result.remediation.slice(0, 8)
        })}`
      })
    });
    if (!response.ok) throw new Error(`Ollama request failed: ${response.status}`);
    const json = (await response.json()) as { response?: string };
    return json.response ?? '';
  }
}
