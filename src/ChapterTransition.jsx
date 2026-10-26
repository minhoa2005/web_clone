import React from 'react';

// A quiet boundary marker shown when a selection or tour step enters another chapter.
// It never blocks interaction and never pauses narration; the chronology underneath
// stays usable while it is visible.
export default function ChapterTransition({ chapter }) {
  if (!chapter) return null;
  return <div className="chapter-card" role="status" data-chapter-card={chapter.id}>
    <p className="chapter-card__kicker">Chặng {chapter.position} · {chapter.label} · {chapter.range}</p>
    <p className="chapter-card__title">{chapter.title}</p>
    <p className="chapter-card__thesis">{chapter.thesis}</p>
    <p className="chapter-card__count">{chapter.count} sự kiện</p>
  </div>;
}
