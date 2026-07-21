import { useState } from 'react';
import { MermaidVisual } from './MermaidVisual.jsx';
import { CuriosityCapture } from './CuriosityCapture.jsx';
import { askCuriosity } from '../api.js';

function VisualPanel({ visual }) {
  if (visual?.type === 'mermaid') return <MermaidVisual content={visual.content} />;

  if (visual?.type === 'image') {
    return (
      <figure className="journey-image-wrap">
        <img className="journey-image" src={visual.url} alt={visual.caption || 'Reference visual'} />
        <figcaption>{visual.caption}</figcaption>
      </figure>
    );
  }

  return (
    <div className="visual-empty">
      <span className="visual-empty-orbit" aria-hidden="true">◌</span>
      <p>No visual needed for this idea.</p>
      <small>The explanation is the clearest path here.</small>
    </div>
  );
}

function MagnifierIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="14" cy="14" r="8" />
      <path d="m20 20 8 8" />
    </svg>
  );
}

export function AIJourney({ topic, result, accessToken, onNewTopic }) {
  const steps = result?.steps?.length
    ? result.steps
    : [{ title: 'Your idea', answer: result?.answer, funFact: '', visual: result?.visual }];
  const [stepIndex, setStepIndex] = useState(0);
  const [curiosityOpen, setCuriosityOpen] = useState(false);
  const [curiosityUsed, setCuriosityUsed] = useState(false);
  const [curiosityAnswer, setCuriosityAnswer] = useState('');
  const [curiosityLoading, setCuriosityLoading] = useState(false);
  const step = steps[stepIndex] || steps[0];

  async function submitCuriosity(selection) {
    setCuriosityUsed(true);
    setCuriosityOpen(false);
    setCuriosityLoading(true);
    try {
      const response = await askCuriosity({ topic, ...selection }, accessToken);
      setCuriosityAnswer(response.answer);
    } catch (error) {
      setCuriosityAnswer(error.message);
    } finally {
      setCuriosityLoading(false);
    }
  }

  return (
    <main className="ai-journey">
      <header className="ai-journey-header">
        <a className="wordmark" href="/">CarryOn</a>
        <div className="ai-journey-topic">
          <span>Exploring</span>
          <strong>{topic}</strong>
        </div>
        <div className="ai-journey-actions">
          {!curiosityUsed && (
            <button
              type="button"
              className="magnifier-top-button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setCuriosityOpen(true)}
              aria-label="Explore one detail with AI"
              title="Explore one detail with AI"
            >
              <MagnifierIcon />
            </button>
          )}
          <button className="journey-back-btn" type="button" onClick={onNewTopic}>New topic</button>
        </div>
      </header>

      <nav className="journey-stepper" aria-label="Learning steps">
        {steps.map((item, index) => (
          <button key={`${item.title}-${index}`} type="button" className={stepIndex === index ? 'active' : ''} onClick={() => setStepIndex(index)}>
            <span>0{index + 1}</span>
            {item.title || `Step ${index + 1}`}
          </button>
        ))}
      </nav>

      <div className="ai-journey-content">
        <section className="visual-card" aria-label="Visual aid">
          <div className="journey-card-label">
            <span className="eyebrow">Step 0{stepIndex + 1} · Visual aid</span>
            <span className="visual-type">{step.visual?.type === 'none' ? 'Text-led' : step.visual?.type}</span>
          </div>
          <div className="visual-frame visual-frame-large"><VisualPanel visual={step.visual} /></div>
          <p className="visual-note">
            {step.visual?.type === 'image' ? 'Reference image from Wikipedia' : step.visual?.type === 'mermaid' ? 'A map of the idea' : 'A quiet space for the idea to land'}
          </p>
          <p className="visual-disclaimer">
            {curiosityUsed ? 'Curiosity check used for this search session.' : 'One curiosity check is available for this search session.'}
          </p>
        </section>

        <article className="answer-card answer-card-below">
          <span className="eyebrow">AI field notes</span>
          <h1>{step.title || topic}</h1>
          <div className="answer-copy">
            {(step.answer || 'No explanation was returned.').split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
              <p key={`${paragraph.slice(0, 12)}-${index}`}>{paragraph}</p>
            ))}
          </div>
          {step.funFact && (
            <aside className="fun-fact-card">
              <span className="eyebrow">Fun fact</span>
              <p>{step.funFact}</p>
            </aside>
          )}
        </article>
      </div>

      {(curiosityLoading || curiosityAnswer) && (
        <aside className="curiosity-popup" role="status">
          <button type="button" className="curiosity-popup-close" onClick={() => setCuriosityAnswer('')} aria-label="Close curiosity answer">×</button>
          <span className="eyebrow">Curiosity</span>
          <p>{curiosityLoading ? 'Following that thread…' : curiosityAnswer}</p>
        </aside>
      )}

      {curiosityOpen && (
        <div className="curiosity-overlay" role="presentation">
          <section className="curiosity-modal" role="dialog" aria-modal="true" aria-label="Curiosity check">
            <button type="button" className="curiosity-popup-close" onClick={() => setCuriosityOpen(false)} aria-label="Close curiosity check">×</button>
            <CuriosityCapture visual={step.visual} onSubmit={submitCuriosity} onCancel={() => setCuriosityOpen(false)} />
          </section>
        </div>
      )}
    </main>
  );
}
