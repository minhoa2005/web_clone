export const TIMELINE_STATE = Object.freeze({
  collapsed: 'collapsed',
  preview: 'preview',
  full: 'full',
});

export function nextTimelineState(state) {
  if (state === TIMELINE_STATE.collapsed) return TIMELINE_STATE.preview;
  if (state === TIMELINE_STATE.preview) return TIMELINE_STATE.full;
  return TIMELINE_STATE.collapsed;
}

export function timelineWindow(events, eventId) {
  if (!events.length) return [];
  const selectedIndex = events.findIndex((event) => event.id === eventId);
  const index = selectedIndex < 0 ? 0 : selectedIndex;
  return events.slice(Math.max(0, index - 1), Math.min(events.length, index + 2));
}
