import { describe, expect, it } from 'vitest';
import { predictInstallRisk } from '../src/risk/predictor.js';
import { duplicateGraph, testContext } from './fixtures/simple-package.js';

describe('predictInstallRisk', () => {
  it('warns when a package is already installed', () => {
    const prediction = predictInstallRisk('lodash@latest', testContext(), duplicateGraph(), []);
    expect(prediction.risk).not.toBe('low');
    expect(prediction.warnings.join(' ')).toContain('already present');
  });
});
