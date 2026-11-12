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
// Action sounds play once; only sustained environment beds loop. Small rate
// differences keep recurring source material from sounding like an identical
// sample pasted across unrelated historical moments.
const layer = (name, at, volume, seconds, loop = false, fadeIn = 120, rate = 1) => ({
  name,
  at,
  volume: volume * .55,
  seconds,
  loop,
  fadeIn,
  rate,
});
const SCENES = {
  'harbor-departure': [layer('harbor', 0, .2, 18, true, 600, .96), layer('ship-horn', .15, .5, 6), layer('ship-engine', 2, .3, 12, false, 180, .92), layer('wheel-creak', 9, .32, 5, false, 120, .95)],
  'petition-desk': [layer('paper', 0, .42, 5, false, 100, .94), layer('mechanical-type', 2.2, .4, 1.4), layer('typewriter', 5.1, .3, 8, false, 150, .96)],
  'tours-congress': [layer('crowd', 0, .13, 14, true, 700, .93), layer('paper', 1.5, .3, 5), layer('gavel', 7.2, .4, 3, false, 80, .95)],
  'moscow-shortwave': [layer('radio', 0, .42, 5, false, 100, .9), layer('paper', 5.4, .24, 5, false, 180, .92), layer('mechanical-type', 9.1, .34, 1.4, false, 80, .9)],
  'youth-printshop': [layer('printing', 0, .4, 10, false, 180, 1.03), layer('paper', 8.8, .34, 5, false, 120, 1.05), layer('typewriter', 11.2, .2, 6, false, 180, 1.04)],
  'cadre-classroom': [layer('chalk', 0, .44, 5, false, 100, .9), layer('paper', 4.8, .36, 5), layer('mechanical-type', 9.2, .28, 1.4, false, 80, .92)],
  'founding-conference': [layer('paper', 0, .33, 5, false, 100, .9), layer('gavel', 3.6, .44, 3), layer('crowd', 5, .11, 10, true, 700, .9)],
  'first-platform': [layer('paper', 0, .4, 5, false, 120, .88), layer('printing', 4.7, .27, 8, false, 220, .92), layer('mechanical-type', 10.4, .32, 1.4, false, 80, .88)],
  'movement-street': [layer('footsteps', 0, .4, 8, true, 220, .96), layer('crowd', 2.5, .24, 14, true, 600, .96), layer('applause', 10.2, .25, 5, false, 180, .94)],
  'macau-congress': [layer('crowd', 0, .1, 13, true, 700, .88), layer('paper', 1.2, .31, 5, false, 120, .92), layer('gavel', 8.6, .38, 3, false, 80, .9)],
  'border-return': [layer('forest', 0, .25, 17, true, 700, .92), layer('footsteps', 1, .42, 8, true, 220, .9), layer('radio', 11.5, .24, 5, false, 160, .88)],
  'vietminh-gathering': [layer('forest', 0, .2, 17, true, 700, .96), layer('crowd', 2.5, .11, 12, true, 700, .9), layer('radio', 8.8, .38, 5, false, 140, .94)],
  'august-uprising': [layer('footsteps', 0, .3, 7, true, 180, 1.02), layer('crowd', 1.4, .23, 12, true, 500, 1.01), layer('applause', 7.2, .3, 5, false, 160, 1.02)],
  silence: [],
  'preliminary-accord': [layer('paper', 0, .38, 5, false, 100, .92), layer('gavel', 4.2, .36, 3, false, 80, .9), layer('shutter', 8.6, .33, 2, false, 80, .95)],
  'recognition-shortwave': [layer('radio', 0, .44, 5, false, 120, .86), layer('mechanical-type', 5.8, .38, 1.4, false, 80, .9), layer('typewriter', 8, .2, 7, false, 180, .92)],
  'border-logistics': [layer('diesel', 0, .44, 8, false, 160, .92), layer('forest', 1.2, .16, 17, true, 700, .9), layer('footsteps', 5, .38, 8, true, 180, .94), layer('radio', 12, .34, 5, false, 120, .9)],
  'vietbac-congress': [layer('forest', 0, .18, 17, true, 700, .94), layer('crowd', 1.5, .1, 12, true, 700, .9), layer('gavel', 5.8, .38, 3, false, 80, .88), layer('paper', 9.2, .26, 5, false, 100, .92)],
  'artillery-haul': [layer('wheel-creak', 0, .42, 8, false, 120, .88), layer('footsteps', 2.4, .36, 8, true, 200, .92), layer('diesel', 8.5, .24, 6, false, 180, .86)],
  'geneva-table': [layer('paper', 0, .34, 5, false, 120, .94), layer('crowd', 1.2, .09, 12, true, 700, .9), layer('shutter', 4.8, .42, 2), layer('gavel', 9.2, .3, 3, false, 80, .92)],
  'reunification-congress': [layer('gavel', 0, .4, 3, false, 80, .9), layer('crowd', 1.2, .1, 12, true, 700, .92), layer('paper', 5.4, .3, 5, false, 120, .96), layer('applause', 10.2, .25, 5, false, 180, .94)],
  'tet-broadcast': [layer('radio', 0, .44, 5, false, 120, .86), layer('footsteps', 4.2, .34, 7, true, 180, .94), layer('crowd', 8.2, .1, 7, true, 500, .88)],
  'paris-negotiation': [layer('typewriter', 0, .26, 7, false, 140, .9), layer('paper', 3.8, .34, 5, false, 100, .94), layer('shutter', 8.4, .4, 2), layer('crowd', 9.5, .08, 6, true, 600, .9)],
  'victory-city': [layer('radio', 0, .28, 5, false, 120, .94), layer('city', 4.4, .24, 12, false, 500, .98), layer('crowd', 7, .13, 10, true, 500, 1.02)],
  'national-assembly': [layer('gavel', 0, .38, 3, false, 80, .92), layer('paper', 3.5, .32, 5, false, 120, .98), layer('applause', 8.2, .34, 6, false, 180, .96)],
  'reconstruction-congress': [layer('mechanical-type', 0, .35, 1.4, false, 80, .94), layer('paper', 2.4, .3, 5, false, 120, .98), layer('gavel', 7, .36, 3, false, 80, .96), layer('crowd', 8.5, .08, 6, true, 500, .92)],
  'policy-workroom': [layer('typewriter', 0, .3, 7, false, 180, .9), layer('paper', 5.4, .36, 5, false, 120, .94), layer('mechanical-type', 10.2, .3, 1.4, false, 80, .92)],
  'cooperative-ledger': [layer('paper', 0, .38, 5, false, 120, .96), layer('typewriter', 2.6, .3, 8, false, 180, .94), layer('mechanical-type', 9.4, .28, 1.4, false, 80, .92)],
  'reform-congress': [layer('crowd', 0, .09, 13, true, 650, .96), layer('paper', 1.4, .3, 5, false, 120, .98), layer('gavel', 6.2, .36, 3, false, 80, .96), layer('applause', 9.2, .3, 6, false, 180, .98)],
  'renewal-platform': [layer('paper', 0, .36, 5, false, 120, .98), layer('mechanical-type', 3.2, .32, 1.4, false, 80, 1.02), layer('typewriter', 6.2, .22, 8, false, 180, .96)],
  'asean-accession': [layer('crowd', 0, .11, 13, true, 600, .98), layer('shutter', 1.4, .42, 2), layer('paper', 4.8, .24, 5, false, 120, 1.02), layer('applause', 8.2, .3, 6, false, 180, 1.01)],
  'industrialization-congress': [layer('mechanical-type', 0, .34, 1.4, false, 80, 1.04), layer('gavel', 2.5, .38, 3, false, 80, 1.01), layer('crowd', 4, .09, 10, true, 600, .98), layer('applause', 10, .28, 5, false, 180, 1.02)],
  'wto-accession': [layer('crowd', 0, .1, 13, true, 600, 1.01), layer('paper', 1.2, .28, 5, false, 120, 1.02), layer('shutter', 4.8, .42, 2), layer('applause', 8.4, .32, 6, false, 180, 1.03)],
  'modern-platform': [layer('mechanical-type', 0, .3, 1.4, false, 80, 1.06), layer('paper', 2.2, .32, 5, false, 120, 1.04), layer('typewriter', 6.4, .2, 8, false, 180, 1.02)],
  'reform-review': [layer('crowd', 0, .08, 12, true, 600, 1.01), layer('shutter', 1.4, .36, 2), layer('gavel', 5.1, .34, 3, false, 80, 1.02), layer('paper', 8, .26, 5, false, 120, 1.04)],
  'party-congress-2021': [layer('crowd', 0, .09, 13, true, 600, 1.02), layer('shutter', 1.4, .36, 2), layer('paper', 4, .28, 5, false, 120, 1.04), layer('applause', 8.2, .3, 6, false, 180, 1.03)],
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
      audio.playbackRate = item.rate;
      audio.preservesPitch = false;
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
