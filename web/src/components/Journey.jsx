import { useState, useCallback } from 'react';
import { explainTrace, simulate } from '../api.js';

const DEFAULT_PROCESSES = [
  { id: 'P1', burst: 5 },
  { id: 'P2', burst: 3 },
  { id: 'P3', burst: 4 },
];

export function Journey({ tool, onNewTopic }) {
  const [tab, setTab] = useState('visual');
  const [hotspotId, setHotspotId] = useState('scheduler');
  const [quantum, setQuantum] = useState(2);
  const [output, setOutput] = useState('Ready: P1(5), P2(3), P3(4)\nAwaiting simulation run.');
  const [insight, setInsight] = useState(
    'Run the simulator to see step-by-step execution. CarryOn will then explain the result.'
  );
  const [simRunning, setSimRunning] = useState(false);

  const hotspot = tool.hotspots.find((h) => h.id === hotspotId) || tool.hotspots[0];

  const runSimulation = useCallback(async () => {
    setSimRunning(true);
    try {
      const trace = await simulate({ processes: DEFAULT_PROCESSES, quantum });
      setOutput(trace.summary);
      const explanation = await explainTrace({ quantum, summary: trace.summary });
      setInsight(explanation.explanation);
    } catch (error) {
      setOutput(error.message);
    } finally {
      setSimRunning(false);
    }
  }, [quantum]);

  const reset = useCallback(() => {
    setQuantum(2);
    setOutput('Ready: P1(5), P2(3), P3(4)\nAwaiting simulation run.');
    setInsight('Run the simulator to see step-by-step execution. CarryOn will then explain the result.');
  }, []);

  return (
    <section className="journey-phase screen-enter">
      {/* Header */}
      <header className="journey-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          <nav className="journey-breadcrumb" aria-label="Breadcrumb">
            <span>CarryOn</span>
            <span className="sep" aria-hidden="true">›</span>
            <span>CPU Scheduling</span>
            <span className="sep" aria-hidden="true">›</span>
            <span style={{ color: 'var(--text-primary)' }}>{tool.title}</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="journey-tool-badge">
              <span className="check" aria-hidden="true">✓</span>
              Verified tool
            </span>
            <h1 className="journey-title">{tool.title}</h1>
          </div>
        </div>
        <button className="journey-back-btn" onClick={onNewTopic}>
          ← New topic
        </button>
      </header>

      {/* Tabs */}
      <nav className="journey-tabs" aria-label="Journey tabs">
        <button
          className={`tab-btn ${tab === 'visual' ? 'active' : ''}`}
          onClick={() => setTab('visual')}
        >
          Visual & theory
        </button>
        <button
          className={`tab-btn ${tab === 'simulator' ? 'active' : ''}`}
          onClick={() => setTab('simulator')}
        >
          Simulator & code
        </button>
      </nav>

      {/* Visual & Theory */}
      {tab === 'visual' && (
        <div className="workspace" key="visual">
          <div className="visual-stage">
            <div className="queue-section">
              <span className="section-label">Ready queue</span>
              <div className="queue-track">
                {DEFAULT_PROCESSES.map((p) => (
                  <span key={p.id} className="process-chip">
                    {p.id} · {p.burst} ticks
                  </span>
                ))}
              </div>
            </div>

            <div className="flow-diagram">
              <button
                className="flow-node"
                onClick={() => setHotspotId('scheduler')}
                onMouseEnter={() => setHotspotId('scheduler')}
              >
                <div className="node-title">Scheduler</div>
                <div className="node-sub">selects next task</div>
              </button>
              <div className="flow-arrow" aria-hidden="true">→</div>
              <button
                className="flow-node"
                onClick={() => setHotspotId('cpu')}
                onMouseEnter={() => setHotspotId('cpu')}
              >
                <div className="node-title">CPU</div>
                <div className="node-sub">executes for ≤ 1 quantum</div>
              </button>
            </div>

            <div className="hotspot-row">
              {tool.hotspots.map((h) => (
                <button
                  key={h.id}
                  className={`hotspot-btn ${hotspotId === h.id ? 'active' : ''}`}
                  onClick={() => setHotspotId(h.id)}
                  onMouseEnter={() => setHotspotId(h.id)}
                >
                  {h.title}
                </button>
              ))}
            </div>
          </div>

          <aside className="detail-panel">
            <span className="verified-badge">✓ Verified explanation</span>
            <h3>{hotspot.title}</h3>
            <p>{hotspot.body}</p>
            <p className="footnote">
              This content is from the {tool.title}, not AI-generated.
            </p>
          </aside>
        </div>
      )}

      {/* Simulator & Code */}
      {tab === 'simulator' && (
        <div className="workspace" key="simulator">
          <div className="visual-stage">
            <div className="sim-controls">
              <label>
                Time quantum:
                <output>{quantum}</output>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={quantum}
                  onChange={(e) => setQuantum(Number(e.target.value))}
                />
              </label>
              <button className="sim-run-btn" onClick={runSimulation} disabled={simRunning}>
                {simRunning ? 'Running…' : 'Run simulation'}
              </button>
              <button className="sim-reset-btn" onClick={reset}>Reset</button>
            </div>

            <pre className="sim-output">{output}</pre>

            <div className="ai-insight-card">
              <span className="ai-badge">AI-generated interpretation</span>
              <p>{insight}</p>
            </div>
          </div>

          <aside className="code-panel">
            <span className="verified-badge">✓ Verified source bridge</span>
            <h3>Teaching pseudocode</h3>
            <pre>{tool.code.source}</pre>
            <p className="footnote">
              Curated teaching excerpt from the {tool.title}.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
