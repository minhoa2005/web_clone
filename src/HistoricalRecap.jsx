import React from 'react';
import { CHAPTERS, CHAPTER_TOTAL } from './chapters.js';

// The conclusion of the guided tour. It restates only what the source data already
// says: chapter ranges, titles and event counts, with a way to restart or return.
export default function HistoricalRecap({ open, onRestart, onClose }) {
  if (!open) return null;
  return <div className="recap" role="dialog" aria-modal="true" aria-label="Tổng kết hành trình lịch sử">
    <div className="recap__panel">
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
