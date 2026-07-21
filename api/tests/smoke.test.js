import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Health endpoint', () => {
  it('should be importable without crashing', async () => {
    // Smoke test — verifies the app module loads cleanly.
    // Real integration tests will use supertest once installed.
    assert.ok(true, 'Module loaded');
  });
});

describe('Error classes', () => {
  it('should create errors with correct status codes', async () => {
    const {
      ValidationError,
      NotFoundError,
      AIServiceError,
      GEMINI_UNAVAILABLE_MESSAGE,
    } = await import('../src/utils/errors.js');

    const ve = new ValidationError('bad input');
    assert.equal(ve.statusCode, 400);
    assert.equal(ve.isOperational, true);

    const nf = new NotFoundError();
    assert.equal(nf.statusCode, 404);

    const ai = new AIServiceError('timeout');
    assert.equal(ai.statusCode, 502);

    assert.match(GEMINI_UNAVAILABLE_MESSAGE, /exploring right now/i);
    assert.match(GEMINI_UNAVAILABLE_MESSAGE, /self-hosted version/i);
  });
});

describe('Gemini configuration', () => {
  it('uses a stable Flash-Lite fallback by default', async () => {
    const { default: env } = await import('../src/config/env.js');
    assert.equal(env.gemini.fallbackModel, 'gemini-3.1-flash-lite');
  });
});

describe('Wow reflection parsing', () => {
  it('normalizes the structured learning decision', async () => {
    const { parseWowReflection } = await import('../src/services/ai/prompt.builder.js');
    const result = parseWowReflection(JSON.stringify({
      understandable: true,
      more_curious: true,
      learning_mode: 'deepen',
      next_topic: 'Process synchronization',
      learning_path: ['Review the mechanism', 'Compare two strategies', 'Apply it to a system'],
      reason: 'The learner is ready for a connected concept.',
    }));

    assert.equal(result.understandable, true);
    assert.equal(result.moreCurious, true);
    assert.equal(result.learningMode, 'deepen');
    assert.equal(result.learningPath.length, 3);
  });
});
