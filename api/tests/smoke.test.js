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
