import type { AiExplanationRequest, AiProvider } from './types.js';

export class AnthropicProvider implements AiProvider {
  name = 'anthropic';

  constructor(
    private readonly apiKey: string,
    private readonly model = 'claude-3-5-sonnet-latest',
    private readonly baseUrl = 'https://api.anthropic.com/v1'
  ) {}

  async explain(request: AiExplanationRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1200,
        system:
          'You are a senior Node.js dependency architect. Summarize deterministic dependency analysis. Do not invent findings.',
        messages: [
          {
            role: 'user',
            content: JSON.stringify({
              score: request.result.score,
              findings: request.result.findings.slice(0, 20),
              remediation: request.result.remediation.slice(0, 8)
            })
          }
        ]
      })
    });
    if (!response.ok) throw new Error(`Anthropic request failed: ${response.status}`);
    const json = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
    return json.content?.find((part) => part.type === 'text')?.text ?? '';
  }
}
