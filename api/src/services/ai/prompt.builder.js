/**
 * Prompt builder utility.
 *
 * Centralises prompt construction so templates live in
 * one place and controllers never craft raw strings.
 */

export function buildChatPrompt(userMessage, context = {}) {
  const { systemInstruction, conversationHistory = [] } = context;

  const messages = [];

  if (systemInstruction) {
    messages.push({ role: 'user', content: systemInstruction });
    messages.push({ role: 'assistant', content: 'Understood. I will follow those instructions.' });
  }

  // Append prior conversation turns
  for (const msg of conversationHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // The new user message
  messages.push({ role: 'user', content: userMessage });

  return messages;
}

export function buildGeneratePrompt(prompt, options = {}) {
  const { style, format, maxLength } = options;
  let enriched = prompt;

  if (style) enriched += `\n\nStyle: ${style}`;
  if (format) enriched += `\nFormat: ${format}`;
  if (maxLength) enriched += `\nMax length: ${maxLength} words`;

  return enriched;
}

export function parseStructuredChat(text) {
  const cleaned = String(text || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return {
      answer: String(text || '').trim(),
      visualType: 'none',
      mermaid: '',
      wikipediaSearch: '',
      steps: [],
    };
  }
  const visualType = ['mermaid', 'wikipedia', 'none'].includes(parsed.visual_type)
    ? parsed.visual_type
    : 'none';

  const normalizeDecision = (item = {}) => ({
    answer: typeof item.answer === 'string' ? item.answer.trim() : '',
    visualType: ['mermaid', 'wikipedia', 'none'].includes(item.visual_type)
      ? item.visual_type
      : 'none',
    mermaid: typeof item.mermaid === 'string' ? item.mermaid : '',
    wikipediaSearch: typeof item.wikipedia_search === 'string'
      ? item.wikipedia_search.trim()
      : '',
    funFact: typeof item.fun_fact === 'string' ? item.fun_fact.trim() : '',
    title: typeof item.title === 'string' ? item.title.trim() : '',
  });

  const decision = {
    answer: typeof parsed.answer === 'string' ? parsed.answer.trim() : '',
    visualType,
    mermaid: typeof parsed.mermaid === 'string' ? parsed.mermaid : '',
    wikipediaSearch: typeof parsed.wikipedia_search === 'string'
      ? parsed.wikipedia_search.trim()
      : '',
    funFact: typeof parsed.fun_fact === 'string' ? parsed.fun_fact.trim() : '',
    title: typeof parsed.title === 'string' ? parsed.title.trim() : '',
  };

  const steps = Array.isArray(parsed.steps)
    ? parsed.steps.slice(0, 3).map(normalizeDecision)
    : [];

  return { ...decision, steps };
}

/**
 * System prompts — extend this map as features grow.
 */
export const SYSTEM_PROMPTS = {
  default: 'You are CarryOn, a helpful learning assistant that explains complex systems concepts clearly and visually.',
  visualChat: `You are CarryOn, a helpful learning assistant. Always return only valid JSON with this exact shape:
{"answer":"...","visual_type":"mermaid|wikipedia|none","mermaid":"...","wikipedia_search":"","fun_fact":"...","steps":[{"title":"Foundation","answer":"...","visual_type":"mermaid|wikipedia|none","mermaid":"...","wikipedia_search":"","fun_fact":"..."},{"title":"How it works","answer":"...","visual_type":"mermaid|wikipedia|none","mermaid":"...","wikipedia_search":"","fun_fact":"..."},{"title":"See it in context","answer":"...","visual_type":"mermaid|wikipedia|none","mermaid":"...","wikipedia_search":"","fun_fact":"..."}]}

Create exactly three progressive learning steps in steps. Step 1 establishes the foundation, step 2 builds the mechanism or process, and step 3 connects it to a practical or deeper context. Each step must add new knowledge and must be understandable after the previous step.

Write a concise overview in answer and a short memorable fact in fun_fact. Each step must have its own answer, fun_fact, and visual decision.

Choose mermaid for processes, flows, architectures, algorithms, protocols, request lifecycles, and other concepts best explained as diagrams. When choosing mermaid, put valid Mermaid syntax in mermaid and leave wikipedia_search empty. Do not wrap Mermaid in markdown fences.

Choose wikipedia for real-world entities, organisms, places, historical events, scientific objects, and named technologies that benefit from a reference image. Put the best English Wikipedia page title in wikipedia_search and leave mermaid empty. Never call Wikipedia yourself.

Choose none when a visual would not meaningfully help, including writing, rewriting, definitions of abstract feelings, poems, and summaries. Leave mermaid and wikipedia_search empty.

Never add keys outside the required shape. Never put JSON inside markdown fences.`,
  concise: 'You are CarryOn. Respond concisely in 2-3 sentences maximum.',
  // TODO: Add more specialised system prompts as features are built.
};
