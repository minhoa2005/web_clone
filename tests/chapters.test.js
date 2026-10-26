import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, CHAPTER_TOTAL, chapterForEvent, chapterProgress } from '../src/chapters.js';
import { EVENTS, PERIODS } from '../src/history.js';

test('chapters mirror the six source periods and cover every event once', () => {
  assert.equal(CHAPTERS.length, PERIODS.length);
  assert.equal(CHAPTER_TOTAL, EVENTS.length);
  assert.equal(CHAPTERS.reduce((sum, chapter) => sum + chapter.count, 0), EVENTS.length);
  CHAPTERS.forEach((chapter, index) => {
    assert.equal(chapter.position, index + 1);
    assert.equal(chapter.range, PERIODS[index].range);
    assert.equal(chapter.title, PERIODS[index].title);
    assert.ok(chapter.count >= 3, chapter.id);
  });
});

test('every event resolves to its own chapter and position', () => {
  for (const event of EVENTS) {
    const chapter = chapterForEvent(event);
    assert.equal(chapter.id, event.period, event.id);
    const progress = chapterProgress(event);
    assert.equal(progress.chapter.id, event.period, event.id);
    assert.ok(progress.position >= 1 && progress.position <= progress.total, event.id);
    assert.ok(progress.ratio > 0 && progress.ratio <= 1, event.id);
  }
});

test('chapter boundaries are the first and last recorded event', () => {
  const formation = CHAPTERS.find((chapter) => chapter.id === 'formation');
  assert.equal(formation.firstEventId, 'hoi-nghi-1930');
  assert.equal(formation.lastEventId, 'thang-tam-1945');
  assert.equal(chapterProgress(EVENTS.find((event) => event.id === 'hoi-nghi-1930')).position, 1);
});

test('unknown or missing events have no chapter', () => {
  assert.equal(chapterForEvent(null), null);
  assert.equal(chapterProgress(null), null);
  assert.equal(chapterForEvent({ period: 'nope' }), null);
  assert.equal(chapterProgress({ id: 'x', period: 'nope' }), null);
});
