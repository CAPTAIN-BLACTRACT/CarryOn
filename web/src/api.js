const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

async function request(path, options = {}, accessToken) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}`, ...(options.headers || {}) },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || 'Request failed.');
  return body.data;
}

export function saveJourney(journey, accessToken) {
  return request('/api/v1/journey', { method: 'POST', body: JSON.stringify(journey) }, accessToken);
}

export function getLatestJourney(accessToken) {
  return request('/api/v1/journey/latest', {}, accessToken);
}

export function chat({ prompt, conversationId = null }, accessToken) {
  return request('/api/v1/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt, conversationId }),
  }, accessToken);
}

export function askCuriosity({ topic, selectedText = '', imageDataUrl = '' }, accessToken) {
  return request('/api/v1/ai/curiosity', {
    method: 'POST',
    body: JSON.stringify({ topic, selectedText, imageDataUrl }),
  }, accessToken);
}

export function reflectWow({ topic, wowScore, wowSignals, steps }, accessToken) {
  return request('/api/v1/ai/wow', {
    method: 'POST',
    body: JSON.stringify({ topic, wowScore, wowSignals, steps }),
  }, accessToken);
}
