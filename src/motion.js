// Shared motion tokens for the evidence sequence.
export const MOTION = Object.freeze({
  evidenceFlight: 820,
  evidenceHandoff: 180,
  evidenceBeltLead: 210,
  evidenceBeltRampUp: 320,
  evidenceBeltSettle: 640,
  evidenceBeltMaxHold: 2800,
  evidenceBeltPeakRate: 6.2,
});

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

// Motion is the site default. Only an explicit `?motion=reduce` (or `#motion=reduce`)
// asks for the reduced path; the operating system's prefers-reduced-motion setting is
// deliberately not consulted, so the globe, evidence flight and narration behave the
// same in every browser profile.
export function prefersReducedMotion() {
  return readOverride() === true;
}

export function reducedMotionQuery() {
  return { get matches() { return prefersReducedMotion(); } };
}

export function syncMotionPreference() {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.motion = prefersReducedMotion() ? 'reduce' : 'full';
}

if (typeof window !== 'undefined') {
  syncMotionPreference();
  window.addEventListener('hashchange', syncMotionPreference);
  window.addEventListener('popstate', syncMotionPreference);
}
