import { useState } from 'react';

export function Fallback({ result, onBack }) {
  const [requested, setRequested] = useState(false);

  return (
    <section className="fallback-phase screen-enter">
      <div className="fallback-card">
        <span className="ai-badge">AI-only explanation</span>

        <h1>No verified visual lab found</h1>

        <p>{result.explanation}</p>

        <ol className="learning-path">
          {result.learningPath.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <div className="fallback-actions">
          <button className="fallback-back-btn" onClick={onBack}>
            ← Try another topic
          </button>
          <button
            className="fallback-request-btn"
            disabled={requested}
            onClick={() => setRequested(true)}
          >
            {requested ? 'Request captured ✓' : 'Request a visual lab'}
          </button>
        </div>
      </div>
    </section>
  );
}
