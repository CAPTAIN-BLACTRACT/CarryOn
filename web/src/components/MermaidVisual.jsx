import { useEffect, useState } from 'react';
let configured = false;

export function MermaidVisual({ content }) {
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const render = async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        if (!configured) {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict',
            theme: 'base',
            themeVariables: {
              darkMode: true,
              background: '#0b1220',
              primaryColor: '#152b4b',
              primaryTextColor: '#e7f5ff',
              primaryBorderColor: '#60c9f5',
              lineColor: '#8bb7d2',
              secondaryColor: '#172137',
              tertiaryColor: '#101827',
            },
          });
          configured = true;
        }
        const result = await mermaid.render(`carryon-mermaid-${Date.now()}`, content);
        if (active) {
          setSvg(result.svg);
          setFailed(false);
        }
      } catch {
        if (active) setFailed(true);
      }
    };
    render();
    return () => { active = false; };
  }, [content]);

  if (failed) return <pre className="mermaid-fallback">{content}</pre>;
  return svg
    ? <div className="mermaid-canvas" dangerouslySetInnerHTML={{ __html: svg }} />
    : <div className="visual-loading">Preparing diagram…</div>;
}
