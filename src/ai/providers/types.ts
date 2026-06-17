import type { AnalysisResult } from '../../types/index.js';

export interface AiExplanationRequest {
  result: AnalysisResult;
  mode: 'doctor' | 'scan' | 'remediation';
}

export interface AiProvider {
  name: string;
  explain(request: AiExplanationRequest): Promise<string>;
}
