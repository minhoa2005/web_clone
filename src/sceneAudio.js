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
const layer = (name, at, volume, seconds) => ({ name, at, volume, seconds });
const SCENES = {
  harbor: [layer('harbor', 0, .19, 22)],
  paper: [layer('paper', 0, .13, 7), layer('typewriter', 6, .11, 12)],
  assembly: [layer('crowd', 0, .09, 14), layer('paper', 9, .12, 7)],
  radio: [layer('radio', 0, .09, 10)],
  printing: [layer('printing', 0, .15, 18), layer('paper', 12, .12, 7)],
  classroom: [layer('chalk', 0, .12, 10), layer('paper', 10, .12, 7)],
  crowd: [layer('crowd', 0, .12, 20)],
  forest: [layer('forest', 0, .16, 22), layer('footsteps', 5, .13, 9)],
  'forest-radio': [layer('forest', 0, .14, 22), layer('radio', 12, .09, 7)],
  'crowd-rise': [layer('crowd', 0, .09, 10)],
  silence: [],
  diplomacy: [layer('crowd', 0, .07, 9), layer('paper', 6, .14, 8), layer('shutter', 15, .11, 3)],
  shortwave: [layer('radio', 0, .13, 13)],
  mountain: [layer('forest', 0, .13, 22), layer('footsteps', 2, .16, 14), layer('radio', 16, .08, 5)],
  'march-rise': [layer('footsteps', 0, .1, 9)],
  'tet-radio': [layer('city', 0, .11, 7), layer('radio', 7, .12, 5)],
  'victory-rise': [],
  ceremony: [layer('crowd', 0, .08, 9), layer('paper', 8, .11, 6)],
  field: [layer('forest', 0, .12, 20), layer('footsteps', 5, .1, 8)],
  'market-rise': [layer('typewriter', 0, .12, 7), layer('city', 7, .15, 18)],
  global: [layer('crowd', 0, .1, 18), layer('shutter', 10, .1, 3)],
  'city-rise': [layer('city', 0, .17, 24)],
};
export function startPresentationSoundscape(profileName) {
  const players = [];
  const timers = [];
  let stopped = false;
  for (const item of SCENES[profileName] || []) {
    timers.push(setTimeout(async () => {
      if (stopped) return;
      let source;
      try { source = await getAudioSource(`${import.meta.env.BASE_URL}audio/scenes/${item.name}.audio`); }
      catch { return; }
      if (stopped) return;
      const audio = new Audio(source);
      audio.volume = 0;
      audio.loop = true;
      players.push(audio);
      audio.play().then(() => {
        if (stopped) { audio.pause(); return; }
        fadeAudio(audio, item.volume, 900);
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
