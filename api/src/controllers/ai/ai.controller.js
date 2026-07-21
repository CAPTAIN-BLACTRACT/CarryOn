import { success } from '../../utils/helpers/response.js';
import { validateChatInput, validateWowInput } from '../../validators/index.js';
import { ValidationError } from '../../utils/errors.js';
import { buildChatPrompt, parseStructuredChat, parseWowReflection, SYSTEM_PROMPTS } from '../../services/ai/prompt.builder.js';
import { gemini, ConversationManager } from '../../services/ai/index.js';
import { visualService } from '../../services/visual/index.js';
import * as models from '../../models/index.js';

/**
 * POST /api/v1/ai/chat
 * Conversational chat with the AI provider.
 */
export async function chat(req, res) {
  const { prompt, conversationId: requestedConversationId } = validateChatInput(req.body);
  await models.upsertUser(req.user);
  let conversationId = requestedConversationId;
  let history = [];

  if (conversationId) {
    await models.getConversationById(conversationId, req.user.id);
    history = await models.getMessages(conversationId);
  } else {
    const conversation = await models.createConversation(
      req.user.id,
      ConversationManager.generateTitle(prompt)
    );
    conversationId = conversation.id;
  }

  const messages = buildChatPrompt(prompt, {
    systemInstruction: SYSTEM_PROMPTS.visualChat,
    conversationHistory: ConversationManager.trimHistory(history),
  });
  const completion = await gemini.chat(messages, { responseMimeType: 'application/json' });
  const decision = parseStructuredChat(completion.text);
  const rawSteps = Array.from({ length: 3 }, (_, index) => decision.steps[index] || {
    ...decision,
    title: ['Foundation', 'How it works', 'See it in context'][index],
  });
  let steps = await Promise.all(rawSteps.map(async (step) => ({
    title: step.title,
    answer: step.answer,
    funFact: step.funFact,
    visual: await visualService.resolve(step),
  })));

  // Keep the experience visual if the model still returns `none` for every
  // step or chooses an invalid image title.
  if (!steps.some((step) => step.visual?.type === 'image')) {
    const imageTitle = rawSteps.find((step) => step.wikipediaSearch)?.wikipediaSearch || prompt;
    const fallbackVisual = await visualService.resolve({
      visualType: 'wikipedia',
      wikipediaSearch: imageTitle,
    });
    if (fallbackVisual.type === 'image') {
      steps = steps.map((step, index) => index === steps.length - 1
        ? { ...step, visual: fallbackVisual }
        : step);
    }
  }
  const visual = steps[0]?.visual || { type: 'none' };

  await models.addMessage(conversationId, 'user', prompt);
  await models.addMessage(conversationId, 'assistant', decision.answer);

  return success(res, {
    answer: decision.answer,
    visual,
    steps,
    conversationId,
  }, 'Chat response');
}

export async function curiosity(req, res) {
  const { topic, selectedText = '', imageDataUrl = '' } = req.body || {};

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    throw new ValidationError('topic is required.');
  }
  if (typeof selectedText !== 'string' || typeof imageDataUrl !== 'string') {
    throw new ValidationError('Selected context is invalid.');
  }
  if (!selectedText.trim() && !imageDataUrl) {
    throw new ValidationError('Select text or an image region first.');
  }
  if (imageDataUrl && (!/^data:image\/(?:png|jpeg|webp);base64,/.test(imageDataUrl) || imageDataUrl.length > 950_000)) {
    throw new ValidationError('The selected image region is too large.');
  }

  const result = await gemini.analyzeCuriosity({
    topic: topic.trim(),
    selectedText: selectedText.trim().slice(0, 6000),
    imageDataUrl,
  });

  return success(res, { answer: result.text?.trim() || 'No additional detail was available.' }, 'Curiosity answered');
}

export async function wow(req, res) {
  const { topic, wowScore, wowSignals, steps } = validateWowInput(req.body);
  const reflectionPrompt = [
    `Topic: ${topic}`,
    `Wow score: ${wowScore}/100`,
    `Learner reactions: ${wowSignals.length ? wowSignals.join(', ') : 'none selected'}`,
    `Journey steps: ${steps.length ? steps.join(' | ') : 'not available'}`,
  ].join('\n');

  const completion = await gemini.chat(
    buildChatPrompt(reflectionPrompt, { systemInstruction: SYSTEM_PROMPTS.wowReflection }),
    { responseMimeType: 'application/json' }
  );
  const reflection = parseWowReflection(completion.text);

  return success(res, reflection, 'Wow reflection');
}

/**
 * POST /api/v1/ai/generate
 * One-shot generation (no conversation context).
 */
export async function generate(req, res) {
  // TODO: Implement generation logic
  // 1. Validate input
  // 2. Build prompt
  // 3. Call AI service (gemini.generateText)
  // 4. Return response
  return success(res, {
    text: 'AI generation placeholder',
  }, 'Generated');
}
