import test from 'node:test';
import assert from 'node:assert/strict';
import { fadeAudio, liftMusic, musicStartTime, getAudioSource } from '../src/sceneAudio.js';
import { getPresentationAudioCue } from '../src/presentationAudio.js';
import { EVENTS } from '../src/history.js';

test('1975 features the requested song and retains a post-narration climax', () => {
  const cue = getPresentationAudioCue('mua-xuan-1975');
  assert.match(cue.music, /Như có Bác/);
  assert.equal(cue.musicUrl, cue.afterNarration.url);
  assert.ok(cue.afterNarration.duration >= 12);
});

test('each music milestone continues the same song without a separate climax seek', () => {
  for (const id of ['thang-tam-1945', 'dien-bien-1954', 'mua-xuan-1975']) {
    const cue = getPresentationAudioCue(id);
    assert.equal(cue.musicUrl, cue.afterNarration.url);
    assert.ok(cue.afterNarration.climax > 20);
    assert.ok(cue.afterNarration.end > cue.afterNarration.climax);
  }
});

test('milestone excerpts follow their event-specific musical shape', () => {
  const august = getPresentationAudioCue('thang-tam-1945').afterNarration;
  const artillery = getPresentationAudioCue('dien-bien-1954').afterNarration;
  assert.ok(august.duration >= 4.5 && august.duration <= 6, 'August Revolution should resolve as a short sting');
  assert.ok(artillery.duration >= 28, 'Hò kéo pháo should carry past the refrain payoff');
});

test('historical events use distinct reconstructed sound scenes', () => {
  const profiles = EVENTS.map((event) => getPresentationAudioCue(event.id).profile);
  const counts = profiles.reduce((result, profile) => result.set(profile, (result.get(profile) || 0) + 1), new Map());
  assert.ok(new Set(profiles).size >= EVENTS.length - 1);
  assert.ok(Math.max(...counts.values()) <= 2);
});

test('the narration handoff raises music immediately without seeking or restarting', (t) => {
  let now = 0;
  let tick;
  t.mock.method(performance, 'now', () => now);
  t.mock.method(globalThis, 'setInterval', (callback) => { tick = callback; return 1; });
  t.mock.method(globalThis, 'clearInterval', () => {});
  const audio = {
    volume: .13,
    get currentTime() { return 42.5; },
    set currentTime(value) { assert.fail('The continuing song must not seek'); },
    set src(value) { assert.fail('The continuing song must not reload'); },
    play() { assert.fail('The continuing song must not restart'); },
  };
  assert.equal(liftMusic(audio), 42.5);
  assert.equal(audio.volume, .13);
  now = 90;
  tick();
  assert.ok(audio.volume > .13);
  now = 180;
  tick();
  assert.equal(audio.volume, .75);
});

test('resuming a fading player cancels the pending pause callback', (t) => {
  let now = 0;
  let nextId = 0;
  const timers = new Map();
  t.mock.method(performance, 'now', () => now);
  t.mock.method(globalThis, 'setInterval', (callback) => {
    timers.set(++nextId, callback);
    return nextId;
  });
  t.mock.method(globalThis, 'clearInterval', (id) => timers.delete(id));
  const audio = { volume: 1 };
  let paused = false;
  fadeAudio(audio, 0, 600, () => { paused = true; });
  now = 300;
  [...timers.values()].forEach((callback) => callback());
  assert.ok(audio.volume > 0 && audio.volume < 1);
  fadeAudio(audio, 1, 300);
  now = 650;
  [...timers.values()].forEach((callback) => callback());
  assert.equal(audio.volume, 1);
  assert.equal(paused, false);
  assert.equal(timers.size, 0);
});

test('song offset places the chosen vocal cue at the exact narration ending', () => {
  assert.equal(musicStartTime(60, 23, 1.15), 40);
  assert.ok(Math.abs(musicStartTime(30, 17.25, 1.15) - 15) < 1e-9);
});

test('Declaration speech is never stopped by a duration timer', () => {
  assert.equal(getPresentationAudioCue('doc-lap-1945').afterNarration.duration, null);
});

test('audio assets become cached inline media instead of direct download URLs', async (t) => {
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    requests += 1;
    return { ok: true, arrayBuffer: async () => new Uint8Array([73, 68, 51]).buffer };
  });
  const first = await getAudioSource('/test/ambience.audio');
  assert.ok(first.startsWith('blob:'));
  assert.equal(await getAudioSource('/test/ambience.audio'), first);
  assert.equal(requests, 1);
  URL.revokeObjectURL(first);
});
