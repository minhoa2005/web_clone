// Explicit experience state machine for event selection.
//
// overview → focusing → presenting-evidence → reading → narrating → complete
//
// The machine owns whether the reading panel may open. It is driven by real
// completion signals (globe camera settled, evidence docked), never by a blind
// delay; a caller-side watchdog exists only so a failed signal cannot strand the
// interface. `narrating` and `complete` are derived from the tour status because
// the tour can start, pause and finish independently of a selection.

export const PHASE = Object.freeze({
  overview: 'overview',
  focusing: 'focusing',
  presentingEvidence: 'presenting-evidence',
  reading: 'reading',
  narrating: 'narrating',
  complete: 'complete',
});

export function createExperience() {
  return { phase: PHASE.overview, eventId: null, revision: 0, hasEvidence: false, ready: false };
}

export function selectEvent(state, { eventId, revision, hasEvidence = false, reducedMotion = false }) {
  if (reducedMotion) {
    // Reduced motion jumps straight to the readable state: no camera travel,
    // no evidence flight, no waiting.
    return { phase: PHASE.reading, eventId, revision, hasEvidence, ready: true };
  }
  return { phase: PHASE.focusing, eventId, revision, hasEvidence, ready: false };
}

export function globeArrived(state, revision) {
  if (state.phase !== PHASE.focusing || revision !== state.revision) return state;
  return state.hasEvidence
    ? { ...state, phase: PHASE.presentingEvidence, ready: false }
    : { ...state, phase: PHASE.reading, ready: true };
}

export function evidenceDocked(state, revision) {
  if (revision !== state.revision) return state;
  if (state.phase === PHASE.overview || state.phase === PHASE.reading) return state;
  return { ...state, phase: PHASE.reading, ready: true };
}

export function skipTransition(state) {
  if (state.phase === PHASE.overview || state.phase === PHASE.reading) return state;
  return { ...state, phase: PHASE.reading, ready: true };
}

export function restoreEvent({ eventId, revision, hasEvidence = false }) {
  return { phase: PHASE.reading, eventId, revision, hasEvidence, ready: true };
}

export function transitionIsRunning(state) {
  return state.phase === PHASE.focusing || state.phase === PHASE.presentingEvidence;
}

export function displayPhase(state, tourStatus) {
  if (state.phase === PHASE.overview) return PHASE.overview;
  if (tourStatus === 'playing') return PHASE.narrating;
  if (tourStatus === 'complete') return PHASE.complete;
  return state.phase;
}
