import type { AnalysisResult, RequiredDoctorConfig } from '../types/index.js';
import type { AiProvider } from './providers/types.js';
import { OllamaProvider } from './providers/ollama.js';
import { OpenAiProvider } from './providers/openai.js';
import { AnthropicProvider } from './providers/anthropic.js';

export function createAiProvider(config: RequiredDoctorConfig): AiProvider | undefined {
  const provider = config.ai.provider ?? 'none';
  if (provider === 'none') return undefined;
  if (provider === 'ollama' || provider === 'local') {
    return new OllamaProvider(config.ai.model, config.ai.baseUrl);
  }
  if (provider === 'openai') {
    const key = process.env[config.ai.apiKeyEnv ?? 'OPENAI_API_KEY'];
    if (!key) throw new Error('OPENAI_API_KEY is required for OpenAI explanations.');
    return new OpenAiProvider(key, config.ai.model, config.ai.baseUrl);
  }
  if (provider === 'anthropic') {
    const key = process.env[config.ai.apiKeyEnv ?? 'ANTHROPIC_API_KEY'];
    if (!key) throw new Error('ANTHROPIC_API_KEY is required for Anthropic explanations.');
    return new AnthropicProvider(key, config.ai.model, config.ai.baseUrl);
  }
  return undefined;
}

export async function enrichWithAiSummary(result: AnalysisResult): Promise<AnalysisResult> {
  const provider = createAiProvider(result.context.config);
  if (!provider) return result;
  return {
    ...result,
    aiSummary: await provider.explain({ result, mode: 'doctor' })
  };
}
