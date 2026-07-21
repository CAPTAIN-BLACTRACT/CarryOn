import { useEffect, useRef, useState } from 'react';

const LOADING_STAGES = [
  { text: 'Parsing your concept…', icon: '🔍' },
  { text: 'Mapping knowledge graph…', icon: '🧠' },
  { text: 'Finding visual pathways…', icon: '🎯' },
  { text: 'Building your learning journey…', icon: '✨' },
];

export function LoadingScreen({ topic, loaded, onFinished }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  // Cycle through loading stages to keep it alive
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % LOADING_STAGES.length);
    }, 2800);

    return () => clearInterval(intervalRef.current);
  }, []);

  // Animate progress bar — creeps towards 90% then stalls,
  // jumps to 100% when `loaded` flips true.
  useEffect(() => {
    if (loaded) {
      setProgress(100);
      const timeout = setTimeout(onFinished, 600);
      return () => clearTimeout(timeout);
    }

    // Slow creep: starts fast, decelerates near 90%
    const tick = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return prev + 0.05; // near-stall
        if (prev >= 70) return prev + 0.3;
        if (prev >= 40) return prev + 0.8;
        return prev + 1.4;
      });
    }, 120);

    return () => clearInterval(tick);
  }, [loaded, onFinished]);

  const stage = LOADING_STAGES[stageIndex];

  return (
    <section className="loading-screen screen-enter" aria-live="polite">
      {/* Background particles */}
      <div className="loading-particles" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="particle"
            style={{
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`,
              '--delay': `${Math.random() * 5}s`,
              '--duration': `${3 + Math.random() * 4}s`,
              '--size': `${2 + Math.random() * 4}px`,
            }}
          />
        ))}
      </div>

      {/* Orbital ring animation */}
      <div className="loading-orb" aria-hidden="true">
        <div className="orb-ring orb-ring-1" />
        <div className="orb-ring orb-ring-2" />
        <div className="orb-ring orb-ring-3" />
        <div className="orb-core" />
      </div>

      {/* Stage text */}
      <div className="loading-content">
        <span className="loading-badge">CarryOn</span>
        <h2 className="loading-title" key={stageIndex}>
          <span className="loading-icon">{stage.icon}</span>
          {stage.text}
        </h2>
        <p className="loading-topic">
          Topic: <strong>{topic}</strong>
        </p>
      </div>

      {/* Progress bar */}
      <div className="loading-progress-wrap">
        <div className="loading-progress-track">
          <div
            className="loading-progress-fill"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <span className="loading-percent">{Math.round(Math.min(progress, 100))}%</span>
      </div>
    </section>
  );
}
