import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseStructuredChat } from '../src/services/ai/prompt.builder.js';
import { VisualService } from '../src/services/visual/visual.service.js';
import { WikipediaProvider } from '../src/services/visual/providers/wikipedia.provider.js';

describe('structured chat output', () => {
  it('normalizes the Gemini visual decision', () => {
    const result = parseStructuredChat('```json\n{"answer":"TCP works","visual_type":"mermaid","mermaid":"graph TD; A-->B","wikipedia_search":""}\n```');
    assert.equal(result.answer, 'TCP works');
    assert.equal(result.visualType, 'mermaid');
    assert.equal(result.mermaid, 'graph TD; A-->B');
    assert.deepEqual(result.steps, []);
  });

  it('normalizes three progressive learning steps', () => {
    const result = parseStructuredChat(JSON.stringify({
      answer: 'Overview',
      visual_type: 'none',
      mermaid: '',
      wikipedia_search: '',
      fun_fact: 'Overview fact',
      steps: [
        { title: 'Foundation', answer: 'One', visual_type: 'none', fun_fact: 'Fact one' },
        { title: 'Mechanism', answer: 'Two', visual_type: 'mermaid', mermaid: 'graph TD; A-->B', fun_fact: 'Fact two' },
        { title: 'Context', answer: 'Three', visual_type: 'none', fun_fact: 'Fact three' },
      ],
    }));
    assert.equal(result.steps.length, 3);
    assert.equal(result.steps[1].title, 'Mechanism');
    assert.equal(result.steps[2].funFact, 'Fact three');
  });

  it('degrades malformed model output to text-only', () => {
    const result = parseStructuredChat('plain answer');
    assert.equal(result.answer, 'plain answer');
    assert.equal(result.visualType, 'none');
    assert.deepEqual(result.steps, []);
  });
});

describe('visual service', () => {
  it('returns Mermaid content unchanged', async () => {
    const service = new VisualService();
    const content = 'graph TD\n  A[Client] --> B[Server]';
    assert.deepEqual(await service.resolve({ visualType: 'mermaid', mermaid: content }), {
      type: 'mermaid',
      content,
    });
  });

  it('falls back to no visual when Wikipedia fails', async () => {
    const wikipedia = new WikipediaProvider({
      fetchImpl: async () => ({ ok: false, status: 503 }),
    });
    const service = new VisualService({ wikipediaProvider: wikipedia });
    assert.deepEqual(await service.resolve({ visualType: 'wikipedia', wikipediaSearch: 'Tiger' }), { type: 'none' });
  });
});
