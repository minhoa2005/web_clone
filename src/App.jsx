import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { HOME, PLACES, WISHLIST } from './places.js';

const LISTS = { visited: PLACES, wishlist: WISHLIST };
const placeMap = new Map([...PLACES, ...WISHLIST].map((place) => [place.id, place]));

function Pin({ place, kind, onPick }) {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = `pin${kind ? ` pin--${kind}` : ''}`;
  element.setAttribute('aria-label', `${place.city}, ${place.country}`);
  element.title = `${place.city} · ${place.country}`;
  element.innerHTML = '<span class="pin__dot"></span><span class="pin__pulse"></span><span class="pin__label"></span>';
  element.querySelector('.pin__label').textContent = place.city;
  if (kind !== 'home') {
    element.addEventListener('click', (event) => {
      event.stopPropagation();
      onPick(place);
    });
  } else {
    element.tabIndex = -1;
    element.setAttribute('aria-label', 'Home · Newark, California');
  }
  return element;
}

function GlobeStage({ mode, selected, onPick }) {
  const hostRef = useRef(null);
  const globeRef = useRef(null);
  const selectRef = useRef(onPick);
  const selectedRef = useRef(selected);
  const idleTimerRef = useRef(null);
  const list = LISTS[mode];

  useEffect(() => { selectRef.current = onPick; }, [onPick]);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const globe = Globe()(host)
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl('/assets/earth-dark.jpg')
      .bumpImageUrl('/assets/earth-topology.png')
      .showAtmosphere(true)
      .atmosphereColor('#e6402e')
      .atmosphereAltitude(0.13)
      .htmlLat('lat')
      .htmlLng('lng')
      .htmlAltitude(0.012)
      .htmlElement((place) => Pin({ place, kind: place.kind, onPick: (value) => selectRef.current(value) }))
      .arcColor(() => ['rgba(230,64,46,0)', 'rgba(230,64,46,0.85)'])
      .arcStroke(0.32)
      .arcAltitudeAutoScale(0.42)
      .arcDashLength(0.45)
      .arcDashGap(2.2)
      .arcDashAnimateTime(3600)
      .width(host.clientWidth)
      .height(host.clientHeight);

    globeRef.current = globe;
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;
    controls.enableDamping = true;
    controls.minDistance = 160;
    controls.maxDistance = 480;
    globe.pointOfView({ lat: 30, lng: -150, altitude: 2.3 }, 0);

    const pauseAndResume = () => {
      controls.autoRotate = false;
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => { controls.autoRotate = true; }, 6000);
    };
    host.addEventListener('pointerdown', pauseAndResume, { passive: true });
    host.addEventListener('wheel', pauseAndResume, { passive: true });

    let countryFeatures = [];
    fetch('/assets/countries-50m.geojson')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Country outlines unavailable')))
      .then((geo) => {
        countryFeatures = geo.features || [];
        countryFeatures.forEach((feature) => {
          feature.__hl = Boolean(selectedRef.current && (feature.properties?.ADMIN === selectedRef.current.country || feature.properties?.NAME === selectedRef.current.country));
        });
        globe
          .polygonsData(countryFeatures)
          .polygonCapCurvatureResolution(3)
          .polygonAltitude((feature) => feature.__hl ? 0.04 : 0.005)
          .polygonCapColor((feature) => feature.__hl ? 'rgba(230,64,46,0.45)' : 'rgba(0,0,0,0)')
          .polygonSideColor((feature) => feature.__hl ? 'rgba(230,64,46,0.5)' : 'rgba(0,0,0,0)')
          .polygonStrokeColor((feature) => feature.__hl ? '#ff6a55' : 'rgba(236,231,222,0.05)');
      })
      .catch(() => {});

    const observer = new ResizeObserver(() => {
      globe.width(host.clientWidth).height(host.clientHeight);
    });
    observer.observe(host);

    return () => {
      observer.disconnect();
      window.clearTimeout(idleTimerRef.current);
      host.removeEventListener('pointerdown', pauseAndResume);
      host.removeEventListener('wheel', pauseAndResume);
      globe._destructor();
      globeRef.current = null;
      host.replaceChildren();
    };
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const points = [...list.map((place) => ({ ...place, kind: mode === 'wishlist' ? 'wish' : '' })), { ...HOME, kind: 'home' }];
    globe.htmlElementsData(points);
    globe.arcsData(list.map((place) => ({
      startLat: HOME.lat,
      startLng: HOME.lng,
      endLat: place.lat,
      endLng: place.lng,
    })));
  }, [list, mode]);

  useEffect(() => {
    const features = globeRef.current?.polygonsData();
    if (!Array.isArray(features)) return;
    features.forEach((feature) => {
      feature.__hl = Boolean(selected && (feature.properties?.ADMIN === selected.country || feature.properties?.NAME === selected.country));
    });
    globeRef.current
      .polygonAltitude((feature) => feature.__hl ? 0.04 : 0.005)
      .polygonCapColor((feature) => feature.__hl ? 'rgba(230,64,46,0.45)' : 'rgba(0,0,0,0)')
      .polygonSideColor((feature) => feature.__hl ? 'rgba(230,64,46,0.5)' : 'rgba(0,0,0,0)')
      .polygonStrokeColor((feature) => feature.__hl ? '#ff6a55' : 'rgba(236,231,222,0.05)');
  }, [selected]);

  useEffect(() => {
    if (!selected || !globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = false;
    window.clearTimeout(idleTimerRef.current);
    globeRef.current.pointOfView({ lat: selected.lat, lng: selected.lng - 18, altitude: 1.15 }, 1300);
    idleTimerRef.current = window.setTimeout(() => { controls.autoRotate = true; }, 9000);
  }, [selected]);

  return <div className="globe-host" ref={hostRef} aria-label="Interactive rotating Earth with travel pins" />;
}

export default function App() {
  const [mode, setMode] = useState(() => {
    const initial = placeMap.get(decodeURIComponent(window.location.hash.slice(1)));
    return initial && !PLACES.includes(initial) ? 'wishlist' : 'visited';
  });
  const [selected, setSelected] = useState(() => placeMap.get(decodeURIComponent(window.location.hash.slice(1))) || null);
  const list = LISTS[mode];
  const countryCount = useMemo(() => new Set(list.map((place) => place.country)).size, [list]);

  const choosePlace = useCallback((place) => {
    setSelected(place);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${encodeURIComponent(place.id)}`);
  }, []);

  const closePlace = useCallback(() => {
    setSelected(null);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }, []);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    closePlace();
  };

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') closePlace(); };
    const onHashChange = () => {
      const place = placeMap.get(decodeURIComponent(window.location.hash.slice(1)));
      setSelected(place || null);
      if (place) setMode(PLACES.includes(place) ? 'visited' : 'wishlist');
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [closePlace]);

  const surprise = () => choosePlace(list[Math.floor(Math.random() * list.length)]);

  return (
    <main className={`atlas atlas--${mode}`}>
      <div className="grain" aria-hidden="true" />
      <GlobeStage mode={mode} selected={selected} onPick={choosePlace} />

      <header className="head">
        <div className="head__brand">
          <span className="head__logo">CF<sup>®</sup></span>
          <span className="head__gallery">THE PHOTO GALLERY ↗</span>
        </div>
        <p className="head__title">field <em>atlas</em></p>
        <div className="head__stats" aria-live="polite">
          <span><b>{countryCount}</b> countries</span>
          <span className="head__dot" />
          <span><b>{list.length}</b> {mode === 'wishlist' ? 'dreams' : 'places'}</span>
        </div>
      </header>

      <h1 className={`hero-title${selected ? ' hero-title--hidden' : ''}`}>
        <span>WHERE</span>
        <span className="hero-title__italic">{mode === 'wishlist' ? 'TO NEXT' : "WE'VE BEEN"}</span>
      </h1>

      <nav className="controls" aria-label="Globe controls">
        <div className="mode-toggle" role="tablist" aria-label="Map mode">
          <button className={`mode-btn${mode === 'visited' ? ' is-active' : ''}`} role="tab" aria-selected={mode === 'visited'} onClick={() => changeMode('visited')}>Visited</button>
          <button className={`mode-btn${mode === 'wishlist' ? ' is-active' : ''}`} role="tab" aria-selected={mode === 'wishlist'} onClick={() => changeMode('wishlist')}>Wishlist</button>
        </div>
        <button className="shuffle-btn" onClick={surprise}><span aria-hidden="true">⤮</span> surprise me</button>
      </nav>

      <p className="hint">DRAG TO SPIN <span>—</span> CLICK A PIN</p>

      <aside className={`place-panel${selected ? ' place-panel--open' : ''}`} aria-hidden={!selected}>
        <button className="place-panel__close" aria-label="Close place details" onClick={closePlace}>×</button>
        {selected && <>
          <p className="place-panel__country">{mode === 'wishlist' ? `ON THE WISHLIST · ${selected.country}` : selected.country}</p>
          <h2>{selected.city}</h2>
          <p className="place-panel__note">{selected.note || 'A place to remember.'}</p>
          <div className="place-panel__rule" />
          <p className="place-panel__coordinates">{selected.lat.toFixed(2)}° {selected.lat >= 0 ? 'N' : 'S'} <span>·</span> {Math.abs(selected.lng).toFixed(2)}° {selected.lng >= 0 ? 'E' : 'W'}</p>
        </>}
      </aside>
    </main>
  );
}
