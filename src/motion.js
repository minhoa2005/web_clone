const PARAM = 'motion';
const FULL_VALUES = ['full', 'on', '1', 'yes', 'no-preference'];
const REDUCE_VALUES = ['reduce', 'reduced', 'off', '0', 'no'];

function readOverride() {
  if (typeof window === 'undefined') return null;
  const search = new URLSearchParams(window.location.search).get(PARAM);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, '')).get(PARAM);
  const value = (search ?? hash ?? '').trim().toLowerCase();
  if (FULL_VALUES.includes(value)) return false;
  if (REDUCE_VALUES.includes(value)) return true;
  return null;
}

export function prefersReducedMotion() {
  const override = readOverride();
  if (override !== null) return override;
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function reducedMotionQuery() {
  return { get matches() { return prefersReducedMotion(); } };
}

export function syncMotionPreference() {
  if (typeof document === 'undefined') return;
  const override = readOverride();
  if (override === false) document.documentElement.dataset.motion = 'full';
  else if (override === true) document.documentElement.dataset.motion = 'reduce';
  else delete document.documentElement.dataset.motion;
}

if (typeof window !== 'undefined') {
  syncMotionPreference();
  window.addEventListener('hashchange', syncMotionPreference);
  window.addEventListener('popstate', syncMotionPreference);
}
