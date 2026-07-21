function parseLooseJson(rawText) {
  const direct = rawText.trim();
  if (!direct) return null;

  const attempts = [
    direct,
    direct.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim(),
  ];

  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Continue.
    }
  }

  const firstBrace = direct.indexOf('{');
  const lastBrace = direct.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(direct.slice(firstBrace, lastBrace + 1));
    } catch {
      return null;
    }
  }

  return null;
}

function firstTextValue(source, keys) {
  for (const key of keys) {
    if (typeof source?.[key] === 'string' && source[key].trim()) return source[key].trim();
  }
  return '';
}

function collectStepText(steps) {
  if (!Array.isArray(steps)) return '';
  const parts = steps
    .map((step) => firstTextValue(step, ['answer', 'text', 'content', 'message']))
    .filter(Boolean);
  return parts.length ? parts.join('\n\n') : '';
}

function stringifySafely(value) {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function normalizeAIText(value, fallback = '') {
  const raw = stringifySafely(value).trim();
  if (!raw) return fallback;

  const parsed = parseLooseJson(raw);
  if (parsed == null) return raw;
  if (typeof parsed === 'string') return parsed.trim() || fallback;

  if (Array.isArray(parsed)) {
    const listText = parsed
      .map((item) => (typeof item === 'string' ? item.trim() : firstTextValue(item, ['answer', 'text', 'content', 'message'])))
      .filter(Boolean)
      .join('\n\n');
    return listText || raw;
  }

  const primary = firstTextValue(parsed, ['answer', 'explanation', 'text', 'content', 'message']);
  if (primary) return primary;

  const stepText = collectStepText(parsed.steps);
  if (stepText) return stepText;

  return raw;
}

export function toParagraphs(value, fallback = '') {
  return normalizeAIText(value, fallback)
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}
