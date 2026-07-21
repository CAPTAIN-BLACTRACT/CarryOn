import { useState } from 'react';

export function EntryPhase({ onSubmit, user, savedJourney, onExploreSaved, onLogin, onLogout }) {
  const [question, setQuestion] = useState('');

  function submit(event) {
    event.preventDefault();
    if (!question.trim()) return;
    onSubmit({ question });
  }

  return (
    <section className="entry-phase screen-enter">
      <header className="entry-header">
        {user ? (
          <button className="header-action" type="button" onClick={onLogout}>Log out</button>
        ) : (
          <button className="header-action" type="button" onClick={onLogin}>Log in to begin</button>
        )}
      </header>

      <div className="entry-hero">
        <h1 className="hero-title">CarryOn</h1>

        <form className="entry-form" onSubmit={submit}>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Explore…"
            autoComplete="off"
          />
          <button className="submit-btn" type="submit">
            Explore
            <span aria-hidden="true">→</span>
          </button>
        </form>

        {savedJourney && (
          <section className="saved-thread" aria-label="Saved next topic">
            <span className="eyebrow">Next thread</span>
            <h2>{savedJourney.next_topic}</h2>
            <p>Wow score · {savedJourney.wow_factor}</p>
            <button type="button" className="saved-thread-btn" onClick={onExploreSaved}>Explore this →</button>
          </section>
        )}
      </div>
    </section>
  );
}
