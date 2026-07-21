function localExplanation(concept) {
  return `CarryOn has no verified visual lab for “${concept}” yet. Treat this as an AI-assisted starting point, then verify important details against the original document or authoritative documentation.`;
}

export async function createFallbackExplanation(concept) {
  if (!process.env.OPENAI_API_KEY) {
    return { explanation: localExplanation(concept), source: 'local-demo' };
  }
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.6',
        input: `Explain the operating-systems concept "${concept}" for a beginner in 90 words or fewer. State uncertainty when appropriate. Do not claim a verified interactive lab exists.`
      })
    });
    if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
    const data = await response.json();
    return { explanation: data.output_text || localExplanation(concept), source: 'openai' };
  } catch {
    return { explanation: localExplanation(concept), source: 'local-demo' };
  }
}

export async function explainTrace({ quantum, summary }) {
  const local = quantum <= 2
    ? `A ${quantum}-tick quantum returns processes to the queue quickly. That improves responsiveness, but it creates more context switches.`
    : `A ${quantum}-tick quantum lets each process run longer. It reduces switching, while other ready processes wait longer.`;
  if (!process.env.OPENAI_API_KEY) return { explanation: local, source: 'local-demo' };
  return createFallbackExplanation(`Round Robin trace with quantum ${quantum}: ${summary}`);
}
