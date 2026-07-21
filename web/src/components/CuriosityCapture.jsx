import { useEffect, useRef, useState } from 'react';

export function CuriosityCapture({ visual, onSubmit, onCancel }) {
  const imageRef = useRef(null);
  const [selectedText, setSelectedText] = useState('');
  const [selection, setSelection] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function updateTextSelection() {
      setSelectedText(window.getSelection()?.toString().trim() || '');
    }
    document.addEventListener('selectionchange', updateTextSelection);
    return () => document.removeEventListener('selectionchange', updateTextSelection);
  }, []);

  function pointFromEvent(event) {
    const rect = imageRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
    };
  }

  function beginImageSelection(event) {
    if (!imageRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    setSelection({ start: point, end: point });
    setDragging(true);
    setError('');
  }

  function moveImageSelection(event) {
    if (!dragging) return;
    setSelection((current) => current ? { ...current, end: pointFromEvent(event) } : current);
  }

  function finishImageSelection(event) {
    if (!dragging || !selection || !imageRef.current) return;
    setDragging(false);
    const end = pointFromEvent(event);
    const start = selection.start;
    const left = Math.min(start.x, end.x);
    const top = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    setSelection({ start, end });

    if (width < 12 || height < 12) {
      setError('Drag across the part you want to explore.');
      return;
    }

    try {
      const image = imageRef.current;
      const scale = Math.min(1, 768 / Math.max(width, height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * (image.naturalWidth / image.clientWidth) * scale));
      canvas.height = Math.max(1, Math.round(height * (image.naturalHeight / image.clientHeight) * scale));
      const context = canvas.getContext('2d');
      context.drawImage(image, left * (image.naturalWidth / image.clientWidth), top * (image.naturalHeight / image.clientHeight), width * (image.naturalWidth / image.clientWidth), height * (image.naturalHeight / image.clientHeight), 0, 0, canvas.width, canvas.height);
      setImageDataUrl(canvas.toDataURL('image/jpeg', 0.75));
    } catch {
      setError('This image cannot be captured in the browser. Try selecting text instead.');
    }
  }

  const box = selection && {
    left: `${Math.min(selection.start.x, selection.end.x)}px`,
    top: `${Math.min(selection.start.y, selection.end.y)}px`,
    width: `${Math.abs(selection.end.x - selection.start.x)}px`,
    height: `${Math.abs(selection.end.y - selection.start.y)}px`,
  };
  const canSubmit = Boolean(selectedText || imageDataUrl);

  return (
    <div className="curiosity-capture">
      <div className="curiosity-instruction">
        <span className="eyebrow">Curiosity check</span>
        <p>{visual?.type === 'image' ? 'Drag over a detail in the image, or select text anywhere on the page.' : 'Select a phrase anywhere on the page to explore it in context.'}</p>
      </div>
      {visual?.type === 'image' && (
        <div className="image-capture-stage" onPointerDown={beginImageSelection} onPointerMove={moveImageSelection} onPointerUp={finishImageSelection}>
          <img ref={imageRef} crossOrigin="anonymous" className="capture-image" src={visual.url} alt="Select a region to explore" draggable="false" />
          {box && <span className="capture-selection" style={box} />}
        </div>
      )}
      {selectedText && <p className="selected-context">“{selectedText.slice(0, 180)}{selectedText.length > 180 ? '…' : ''}”</p>}
      {imageDataUrl && <p className="selected-context">Image region captured.</p>}
      {error && <p className="curiosity-error">{error}</p>}
      <div className="curiosity-actions">
        <button type="button" className="curiosity-cancel" onClick={onCancel}>Cancel</button>
        <button type="button" className="curiosity-submit" disabled={!canSubmit} onMouseDown={(event) => event.preventDefault()} onClick={() => onSubmit({ selectedText, imageDataUrl })}>Ask once</button>
      </div>
    </div>
  );
}
