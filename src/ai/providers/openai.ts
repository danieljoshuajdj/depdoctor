import type { AiExplanationRequest, AiProvider } from './types.js';

export class OpenAiProvider implements AiProvider {
  name = 'openai';

  constructor(
    private readonly apiKey: string,
    private readonly model = 'gpt-4.1-mini',
    private readonly baseUrl = 'https://api.openai.com/v1'
  ) {}

  async explain(request: AiExplanationRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a senior Node.js dependency architect. Summarize deterministic dependency analysis. Do not invent findings.'
          },
          {
            role: 'user',
            content: JSON.stringify({
              score: request.result.score,
              findings: request.result.findings.slice(0, 20),
              remediation: request.result.remediation.slice(0, 8)
            })
          }
        ],
        temperature: 0.2
      })
    });
    if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
    const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return json.choices?.[0]?.message?.content ?? '';
  }
}
