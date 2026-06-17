export { analyzeProject } from './core/analyzer.js';
export { explainPackage } from './core/explain.js';
export { buildDependencyGraph, traceChains } from './graph/graph.js';
export { scoreFindings } from './health/scoring.js';
export { predictInstallRisk } from './risk/predictor.js';
export { createFixPlan, runFixes } from './fixers/fix-engine.js';
export { defineConfig, loadConfig } from './config/index.js';
export type * from './types/index.js';
