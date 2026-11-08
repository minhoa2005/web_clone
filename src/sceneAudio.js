const audioSources = new Map();
export function getAudioSource(url) {
  if (!audioSources.has(url)) {
    audioSources.set(url, fetch(url).then(response => {
      if (!response.ok) throw new Error(`Audio request failed: ${response.status}`);
      return response.arrayBuffer();
    }).then(bytes => URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }))).catch(error => {
      audioSources.delete(url);
      throw error;
    }));
  }
  return audioSources.get(url);
}
export function musicStartTime(climax, narrationDuration, rate) {
  return Math.max(0, climax - narrationDuration / rate);
}
const fades = new WeakMap();
export function liftMusic(audio) {
  const position = audio.currentTime;
  fadeAudio(audio, .75, 180);
  return position;
}
export function fadeAudio(audio, target, duration = 600, complete) {
  if (!audio) return;
  clearInterval(fades.get(audio));
  const start = audio.volume;
  const began = performance.now();
  if (!duration) { audio.volume = target; complete?.(); return; }
  const timer = setInterval(() => {
    const progress = Math.min(1, (performance.now() - began) / duration);
    audio.volume = start + (target - start) * (progress * progress * (3 - 2 * progress));
    if (progress >= 1) { clearInterval(timer); fades.delete(audio); complete?.(); }
  }, 25);
  fades.set(audio, timer);
}
// Action sounds play once; only sustained environment beds loop.
const layer = (name, at, volume, seconds, loop = false, fadeIn = 120) => ({ name, at, volume: volume * .55, seconds, loop, fadeIn });
const SCENES = {
  harbor: [layer('harbor', 0, .2, 18, true, 600), layer('ship-horn', .15, .5, 6), layer('ship-engine', 2, .3, 12), layer('wheel-creak', 9, .32, 5)],
  paper: [layer('paper', 0, .42, 5), layer('mechanical-type', 2, .4, 1.4), layer('typewriter', 5, .32, 8)],
  assembly: [layer('gavel', 0, .44, 3), layer('crowd', 1, .16, 12, true, 600), layer('paper', 5, .34, 5)],
  radio: [layer('radio', 0, .42, 5)],
  printing: [layer('printing', 0, .4, 10), layer('paper', 9, .36, 5)],
  classroom: [layer('chalk', 0, .44, 5), layer('paper', 5, .38, 5)],
  crowd: [layer('crowd', 0, .26, 15, true, 500), layer('applause', 8, .34, 6)],
  forest: [layer('forest', 0, .25, 17, true, 700), layer('footsteps', 1, .42, 8, true)],
  'forest-radio': [layer('forest', 0, .22, 17, true, 700), layer('footsteps', 1, .34, 6, true), layer('radio', 9, .38, 5)],
  'crowd-rise': [layer('crowd', 0, .23, 10, true, 500), layer('applause', 5, .3, 5)],
  'border-campaign': [layer('forest', 0, .18, 18, true, 600), layer('diesel', 0, .44, 8), layer('footsteps', 5, .38, 8, true), layer('radio', 12, .38, 5)],
  silence: [],
  diplomacy: [layer('paper', 0, .4, 5), layer('shutter', 3, .42, 2), layer('crowd', 1, .14, 12, true, 700), layer('shutter', 9, .38, 2)],
  shortwave: [layer('radio', 0, .44, 5), layer('mechanical-type', 6, .38, 1.4)],
  'artillery-haul': [layer('wheel-creak', 0, .42, 8), layer('footsteps', 3, .36, 8, true)],
  'tet-radio': [layer('city', 0, .3, 7), layer('radio', 6, .44, 5)],
  'victory-rise': [],
  ceremony: [layer('paper', 0, .36, 5), layer('applause', 7, .36, 6)],
  field: [layer('forest', 0, .22, 17, true, 700), layer('footsteps', 2, .4, 8, true)],
  'market-rise': [layer('typewriter', 0, .38, 7), layer('city', 6, .32, 16)],
  global: [layer('crowd', 0, .16, 14, true, 600), layer('shutter', 1, .42, 2), layer('applause', 7, .34, 6)],
  'city-rise': [layer('city', 0, .32, 16)],
};
export function startPresentationSoundscape(profileName) {
  const players = [];
  const timers = [];
  let stopped = false;
  for (const item of SCENES[profileName] || []) {
    const sourcePromise = getAudioSource(`${import.meta.env.BASE_URL}audio/scenes/${item.name}.audio`).catch(() => null);
    timers.push(setTimeout(async () => {
      if (stopped) return;
      const source = await sourcePromise;
      if (stopped || !source) return;
      const audio = new Audio(source);
      audio.volume = 0;
      audio.loop = item.loop;
      players.push(audio);
      audio.play().then(() => {
        if (stopped) { audio.pause(); return; }
        fadeAudio(audio, item.volume, item.fadeIn);
        timers.push(setTimeout(() => fadeAudio(audio, 0, 1000, () => audio.pause()), item.seconds * 1000));
      }).catch(() => {});
    }, item.at * 1000));
  }
  return () => {
    stopped = true;
    timers.forEach(clearTimeout);
    players.forEach(audio => fadeAudio(audio, 0, 700, () => audio.pause()));
  };
}
