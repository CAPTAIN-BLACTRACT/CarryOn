import { useState } from 'react';
import { supabase } from '../supabase.js';

export function AuthPanel({ onClose }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!supabase) {
      setMessage('Supabase is not configured. Add the frontend environment variables first.');
      return;
    }
    setBusy(true);
    setMessage('');
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    if (mode === 'signup' && !result.data.session) {
      setMessage('Account created. You can sign in now.');
      setMode('login');
      return;
    }
    onClose();
  }

  return (
    <div className="auth-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" type="button" onClick={onClose} aria-label="Close">×</button>
        <span className="auth-badge">A small promise</span>
        <h2 id="auth-title">{mode === 'login' ? 'Continue your journey' : 'Create your account'}</h2>
        <p className="auth-note">Your account is only used to store your learning journey — your next topic, curiosity scores, and wow factor. Nothing else.</p>
        <form className="auth-form" onSubmit={submit}>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength="6" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
          {message && <p className="auth-message" role="status">{message}</p>}
          <button className="submit-btn auth-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
        </form>
        <button className="auth-switch" type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>
          {mode === 'login' ? 'Need an account? Create one' : 'Already have an account? Log in'}
        </button>
      </section>
    </div>
  );
}
