import { EVENTS, PERIODS } from './history.js';

// The six learning periods already in the source data become chapters. Nothing here
// adds interpretation: each chapter carries the period's own title, range, textbook
// chapter label and description, plus derived counts and progress.
export const CHAPTERS = PERIODS.map((period, index) => {
  const events = EVENTS.filter((event) => event.period === period.id);
  return {
    id: period.id,
    position: index + 1,
    label: period.chapter,
    range: period.range,
    title: period.title,
    thesis: period.description,
    count: events.length,
    firstEventId: events[0]?.id || null,
    lastEventId: events.at(-1)?.id || null,
    startYear: events[0]?.year ?? null,
    endYear: events.at(-1)?.year ?? null,
  };
});

export const CHAPTER_TOTAL = CHAPTERS.reduce((total, chapter) => total + chapter.count, 0);

export function chapterForEvent(event) {
  if (!event) return null;
  return CHAPTERS.find((chapter) => chapter.id === event.period) || null;
}

export function chapterProgress(event) {
  const chapter = chapterForEvent(event);
  if (!chapter) return null;
  const events = EVENTS.filter((item) => item.period === chapter.id);
  const index = events.findIndex((item) => item.id === event.id);
  if (index < 0) return null;
  return {
    chapter,
    position: index + 1,
    total: events.length,
    ratio: (index + 1) / events.length,
  };
}
