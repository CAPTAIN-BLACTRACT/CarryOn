import { useState, useCallback, useEffect } from 'react';
import { EntryPhase } from './components/EntryPhase.jsx';
import { LoadingScreen } from './components/LoadingScreen.jsx';
import { AIJourney } from './components/AIJourney.jsx';
import { AuthPanel } from './components/AuthPanel.jsx';
import { supabase } from './supabase.js';
import { chat, saveJourney } from './api.js';

export default function App() {
  const [screen, setScreen] = useState('entry');
  const [loaded, setLoaded] = useState(false);
  const [userInput, setUserInput] = useState(null);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingInput, setPendingInput] = useState(null);
  const [journeyResult, setJourneyResult] = useState(null);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setAccessToken(data.session?.access_token || '');
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAccessToken(session?.access_token || '');
      if (session?.user && pendingInput) {
        startJourney(pendingInput, session.access_token);
        setPendingInput(null);
        setAuthOpen(false);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [pendingInput]);

  const startJourney = useCallback(async (input, token = null) => {
    const session = token ? { access_token: token } : (await supabase?.auth.getSession())?.data?.session;
    if (!session) {
      setPendingInput(input);
      setAuthOpen(true);
      return;
    }
    setUserInput(input);
    setAccessToken(session.access_token);
    setLoaded(false);
    setJourneyResult(null);
    setScreen('loading');
    Promise.all([
      chat({ prompt: input.question }, session.access_token),
      saveJourney({ nextTopic: input.question, curiosityScores: {}, wowFactor: null }, session.access_token).catch(() => null),
    ])
      .then(([result]) => setJourneyResult(result))
      .catch((error) => setJourneyResult({ answer: error.message, visual: { type: 'none' } }))
      .finally(() => setLoaded(true));
  }, []);

  const goHome = useCallback(() => {
    setScreen('entry');
    setLoaded(false);
    setUserInput(null);
    setJourneyResult(null);
  }, []);

  if (screen === 'loading') {
    return (
      <LoadingScreen
        topic={userInput?.question || 'your concept'}
        loaded={loaded}
        onFinished={() => setScreen('journey')}
      />
    );
  }

  if (screen === 'journey') {
    return <AIJourney topic={userInput?.question || 'your concept'} result={journeyResult} accessToken={accessToken} onNewTopic={goHome} />;
  }

  return (
    <>
      <EntryPhase onSubmit={startJourney} user={user} onLogin={() => setAuthOpen(true)} onLogout={() => supabase?.auth.signOut()} />
      {authOpen && <AuthPanel onClose={() => setAuthOpen(false)} />}
    </>
  );
}
