import React, { useEffect, useRef } from 'react';
import { CHAPTERS, CHAPTER_TOTAL } from './chapters.js';

// The conclusion of the guided tour. It restates only what the source data already
// says: chapter ranges, titles and event counts, with a way to restart or return.
export default function HistoricalRecap({ open, onRestart, onClose }) {
  const panelRef = useRef(null);
  const returnFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const siblings = [...document.querySelectorAll('.atlas > :not(.recap)')];
    siblings.forEach((node) => { node.inert = true; });
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      siblings.forEach((node) => { node.inert = false; });
      returnFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const controls = [...panelRef.current.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')]
      .filter((node) => !node.disabled && !node.hidden);
    if (!controls.length) { event.preventDefault(); return; }
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  if (!open) return null;
  return <div className="recap" role="dialog" aria-modal="true" aria-label="Tổng kết hành trình lịch sử">
    <div className="recap__panel" ref={panelRef} tabIndex={-1} onKeyDown={handleKeyDown}>
      <p className="recap__kicker">Hoàn tất hành trình</p>
      <h2 className="recap__title">Sáu chặng, {CHAPTER_TOTAL} sự kiện</h2>
      <p className="recap__note">Toàn bộ mốc đã đi qua, trình bày theo sáu giai đoạn của giáo trình 2021.</p>
      <ol className="recap__chapters">
        {CHAPTERS.map((chapter) => <li key={chapter.id} className="recap__chapter">
          <span className="recap__chapter-range">{chapter.range}</span>
          <span className="recap__chapter-title">{chapter.title}</span>
          <span className="recap__chapter-count">{chapter.count}</span>
        </li>)}
      </ol>
      <div className="recap__actions">
        <button type="button" className="recap__action" onClick={onRestart}>Phát lại từ đầu</button>
        <button type="button" className="recap__action recap__action--quiet" onClick={onClose}>Đóng</button>
      </div>
    </div>
  </div>;
}
