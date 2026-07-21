import { useState } from 'react';

const SAMPLE_TOPICS = [
  'Round Robin scheduling',
  'CPU scheduling',
  'Priority scheduling',
  'FCFS algorithm',
];

export function EntryPhase({ onSubmit, user, onLogin, onLogout }) {
  const [question, setQuestion] = useState('');
  const [pdfName, setPdfName] = useState('');

  function submit(event) {
    event.preventDefault();
    if (!question.trim() && !pdfName) return;
    onSubmit({ question, uploadedPdfName: pdfName });
  }

  function pickTopic(topic) {
    setQuestion(topic);
  }

  return (
    <section className="entry-phase screen-enter">
      <header className="entry-header">
        <a className="wordmark" href="/">
          <span className="wordmark-dot" aria-hidden="true" />
          CarryOn
        </a>
        {user ? (
          <button className="header-action" type="button" onClick={onLogout}>Log out</button>
        ) : (
          <button className="header-action" type="button" onClick={onLogin}>Log in to begin</button>
        )}
      </header>

      <div className="entry-hero">
        <h1 className="hero-title">CarryOn</h1>
        <p className="entry-tagline">
          <strong>See difficult systems ideas clearly.</strong><br />
          Verified visual labs, simulators, and curated code — before any AI explains.
        </p>

        <form className="entry-form" onSubmit={submit}>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about a system, paper, or concept…"
            autoComplete="off"
          />
          <label className="upload-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{pdfName || 'PDF'}</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfName(e.target.files[0]?.name || '')}
            />
          </label>
          <button className="submit-btn" type="submit">
            Begin journey
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <div className="topic-chips">
          {SAMPLE_TOPICS.map((topic) => (
            <button key={topic} className="chip" type="button" onClick={() => pickTopic(topic)}>
              {topic}
            </button>
          ))}
        </div>

        <small className="entry-footnote">
          <span className="dot" aria-hidden="true" />
          Checks for a verified learning tool before responding
        </small>
      </div>
    </section>
  );
}
