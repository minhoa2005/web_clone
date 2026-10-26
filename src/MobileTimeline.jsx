import React, { useEffect, useRef, useState } from 'react';
import { chapterForEvent } from './chapters.js';
import { TIMELINE_STATE, nextTimelineState, timelineWindow } from './timeline.js';

export default function MobileTimeline({ groupedPlaces, list, selected, onSelect }) {
  const [state, setState] = useState(TIMELINE_STATE.collapsed);
  const sheetRef = useRef(null);
  const current = selected && list.some((event) => event.id === selected.id) ? selected : null;
  const chapter = chapterForEvent(current);
  const neighbors = timelineWindow(list, current?.id);
  const expanded = state !== TIMELINE_STATE.collapsed;

  useEffect(() => {
    if (state !== TIMELINE_STATE.full) return;
    sheetRef.current?.querySelector('[aria-current="location"]')?.scrollIntoView({ block: 'nearest' });
  }, [selected, state]);

  const choose = (event) => {
    onSelect(event);
    setState(TIMELINE_STATE.preview);
  };

  const stateLabel = state === TIMELINE_STATE.collapsed
    ? 'Mở dòng thời gian'
    : state === TIMELINE_STATE.preview ? 'Mở toàn bộ sự kiện' : 'Thu gọn dòng thời gian';

  return <section
    className={`mobile-timeline mobile-timeline--${state}`}
    aria-label="Dòng thời gian sự kiện"
    ref={sheetRef}
  >
    <button
      type="button"
      className="mobile-timeline__header"
      aria-expanded={expanded}
      aria-label={stateLabel}
      onClick={() => setState((value) => nextTimelineState(value))}
    >
      <span className="mobile-timeline__handle" aria-hidden="true" />
      <span className="mobile-timeline__meta">
        {chapter ? `${chapter.label} · ${chapter.range}` : `${list.length} sự kiện`}
      </span>
      <span className="mobile-timeline__current">
        {current ? current.city : 'Khám phá dòng thời gian'}
      </span>
      <span className="mobile-timeline__action">{stateLabel}</span>
    </button>

    {state === TIMELINE_STATE.preview && <div className="mobile-timeline__preview">
      {neighbors.map((event) => <button
        type="button"
        className={`mobile-timeline__neighbor${current?.id === event.id ? ' is-active' : ''}`}
        aria-current={current?.id === event.id ? 'location' : undefined}
        onClick={() => choose(event)}
        key={event.id}
      >
        <span>{event.year}</span>
        <span>{event.city}</span>
      </button>)}
      <button type="button" className="mobile-timeline__all" onClick={() => setState(TIMELINE_STATE.full)}>
        Xem toàn bộ {list.length} sự kiện
      </button>
    </div>}

    {state === TIMELINE_STATE.full && <div className="mobile-timeline__list">
      {groupedPlaces.map(([region, years]) => <section className="mobile-timeline__chapter" key={region}>
        <h2>{region}</h2>
        {[...years.entries()].map(([year, events]) => <div className="mobile-timeline__year" key={year}>
          <p>{year}</p>
          {events.map((event) => <button
            type="button"
            className={current?.id === event.id ? 'is-active' : ''}
            aria-current={current?.id === event.id ? 'location' : undefined}
            onClick={() => choose(event)}
            key={event.id}
          >{event.city}</button>)}
        </div>)}
      </section>)}
    </div>}
  </section>;
}
