import { cpuSchedulingTool } from '../../../packages/knowledge-tools/cpuScheduling.js';

const tools = [cpuSchedulingTool];

export function findKnowledgeTool(text) {
  const normalized = text.toLowerCase();
  return tools.find(tool => tool.matchedTerms.some(term => normalized.includes(term))) ?? null;
}

export function inventory() {
  return tools.map(({ id, title, matchedTerms }) => ({ id, title, matchedTerms }));
}
