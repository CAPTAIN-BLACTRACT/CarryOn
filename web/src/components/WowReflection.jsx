import { useState } from 'react';

const REACTIONS = [
  { id: 'insight', label: 'Insight', description: 'I saw something clearly.' },
  { id: 'surprise', label: 'Surprise', description: 'That was unexpected.' },
  { id: 'connection', label: 'Connection', description: 'It connected to something I know.' },
  { id: 'possibility', label: 'Possibility', description: 'It made me think of what could be built.' },
  { id: 'depth', label: 'Depth', description: 'I want to understand the layers beneath it.' },
  { id: 'no-wow', label: 'No wow', description: 'It has not clicked yet.' },
];

export function WowReflection({ loading = false, result, error = '', onSubmit, onClose, onExploreNext, onRest }) {
  const [stage, setStage] = useState(1);
  const [score, setScore] = useState(50);
  const [reactions, setReactions] = useState([]);

  function toggleReaction(id) {
    setReactions((current) => {
      if (id === 'no-wow') return current.includes(id) ? [] : ['no-wow'];
      return current.includes('no-wow')
        ? [id]
        : current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id];
    });
  }

  function submit() {
    const wowScore = reactions.includes('no-wow')
      ? 0
      : Math.min(100, score + reactions.length * 5);
    onSubmit({ wowScore, wowSignals: reactions });
  }

  return (
    <aside className="wow-panel" role="dialog" aria-modal="false" aria-label="Wow reflection">
      <button type="button" className="curiosity-popup-close" onClick={onClose} aria-label="Close wow reflection">×</button>

      {!result && stage === 1 && (
        <div className="wow-stage">
          <span className="eyebrow">The wow moment</span>
          <h2>How much did this idea land?</h2>
          <p className="wow-copy">Your instinct helps CarryOn choose what to show you next.</p>
          <output className="wow-score-preview" aria-live="polite">{score}</output>
          <input
            className="wow-range"
            type="range"
            min="0"
            max="100"
            step="25"
            value={score}
            onChange={(event) => setScore(Number(event.target.value))}
            aria-label="Wow score"
          />
          <div className="wow-scale" aria-hidden="true">
            {[0, 25, 50, 75, 100].map((value) => <span key={value}>{value}</span>)}
          </div>
          <button type="button" className="wow-primary-btn" onClick={() => setStage(2)}>Okay, continue</button>
        </div>
      )}

      {!result && stage === 2 && (
        <div className="wow-stage">
          <span className="eyebrow">Name the feeling</span>
          <h2>What made it stand out?</h2>
          <p className="wow-copy">Choose any that fit. This shapes your next learning path.</p>
          <div className="wow-reactions">
            {REACTIONS.map((reaction) => (
              <label className={`wow-reaction ${reactions.includes(reaction.id) ? 'selected' : ''}`} key={reaction.id}>
                <input
                  type="checkbox"
                  checked={reactions.includes(reaction.id)}
                  onChange={() => toggleReaction(reaction.id)}
                />
                <span>
                  <strong>{reaction.label}</strong>
                  <small>{reaction.description}</small>
                </span>
              </label>
            ))}
          </div>
          <button type="button" className="wow-primary-btn" disabled={loading} onClick={submit}>
            {loading ? 'Finding your next thread…' : 'Find my next thread →'}
          </button>
          {error && <p className="wow-error">{error}</p>}
        </div>
      )}

      {result && (
        <div className="wow-stage wow-result">
          <span className="eyebrow">Your next thread · {result.learningMode === 'deepen' ? 'Go deeper' : 'Try another angle'}</span>
          <h2>{result.nextTopic || 'Keep exploring this idea'}</h2>
          <p className="wow-copy">{result.reason || 'CarryOn shaped this next path from your reflection.'}</p>
          <ol className="wow-learning-path">
            {(result.learningPath || []).map((item) => <li key={item}>{item}</li>)}
          </ol>
          <div className="wow-result-actions">
            <button type="button" className="wow-primary-btn" onClick={onExploreNext}>Explore this next →</button>
            <button type="button" className="wow-rest-btn" onClick={onRest}>Rest for now</button>
          </div>
        </div>
      )}
    </aside>
  );
}
