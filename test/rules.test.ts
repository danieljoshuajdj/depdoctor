import { describe, expect, it } from 'vitest';
import { builtinRules } from '../src/rules/builtin.js';
import { duplicateGraph, testContext } from './fixtures/simple-package.js';

describe('builtin rules', () => {
  it('detects duplicate package versions', async () => {
    const rule = builtinRules.find((item) => item.id === 'duplicates');
    const findings = await rule?.run({
      context: testContext(),
      graph: duplicateGraph(),
      intelligence: new Map()
    });
    expect(findings?.[0]?.packageName).toBe('lodash');
  });
});
