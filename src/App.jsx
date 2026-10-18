import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, LineSegments } from 'three';
import { countryOutlinePositions } from './globeGeometry.js';
import { PLACES, WISHLIST, REGION_ORDER, historicalPins, historicalArcs, highlightedCountries, eventLocation } from './historicalPlaces.js';
import { readEventHash } from './history.js';
import textbookUrl from '../docs/Giao trinh lich su dang cong san viet nam.pdf?url';

const LISTS = { visited: PLACES, wishlist: WISHLIST };
const placeMap = new Map([...PLACES, ...WISHLIST].map((place) => [place.id, place]));

function groupPlaces(places) {
  const regions = new Map();
  places.forEach((place) => {
    const region = place.region;
    if (!regions.has(region)) regions.set(region, new Map());
    const countries = regions.get(region);
    if (!countries.has(place.year)) countries.set(place.year, []);
    countries.get(place.year).push(place);
  });
  return [...regions.entries()].sort(([a], [b]) => {
    const aIndex = REGION_ORDER.indexOf(a);
    const bIndex = REGION_ORDER.indexOf(b);
    return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex);
  });
}

function photoUrl(photo) {
  if (!photo?.src) return '';
  return `${import.meta.env.BASE_URL}${photo.src}`;
}

function Pin({ place, kind, onPick }) {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = `pin${kind ? ` pin--${kind}` : ''}`;
  element.setAttribute('aria-label', `${place.city}, ${place.country}`);
  element.title = `${place.city} · ${place.country}`;
  element.dataset.locationId = place.locationId;
  element.setAttribute('aria-pressed', String(place.focused));
  element.innerHTML = '<span class="pin__dot"></span><span class="pin__pulse"></span><span class="pin__label"></span>';
  element.querySelector('.pin__label').textContent = place.city;
  element.addEventListener('click', (event) => {
    event.stopPropagation();
    onPick(place);
  });
  return element;
}

function GlobeStage({ mode, selected, focusedLocationId, focusRevision, onPick }) {
  const hostRef = useRef(null);
  const globeRef = useRef(null);
  const selectRef = useRef(onPick);
  const list = LISTS[mode];
  const location = useMemo(() => eventLocation(selected, focusedLocationId), [selected, focusedLocationId]);
  const countries = useMemo(() => highlightedCountries(list, selected, focusedLocationId), [list, selected, focusedLocationId]);
  const countriesRef = useRef(countries);
  const highlightRef = useRef(null);
  const highlightDurationRef = useRef(0);
  const wakeRef = useRef(null);
  const cameraTargetRef = useRef(null);

  useEffect(() => { selectRef.current = onPick; }, [onPick]);
  useEffect(() => { countriesRef.current = countries; }, [countries]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let disposed = false;
    let outlines;
    let highlightTimer;
    let idleTimer;
    let pauseFrame;
    let renderUntil = 0;
    let dragging = false;

    const globe = Globe({ rendererConfig: { antialias: false, powerPreference: 'high-performance' } })(host)
      .enablePointerInteraction(false)
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl(`${import.meta.env.BASE_URL}assets/earth-dark.jpg`)
      .bumpImageUrl(`${import.meta.env.BASE_URL}assets/earth-topology.png`)
      .showAtmosphere(true)
      .atmosphereColor('#e6402e')
      .atmosphereAltitude(0.13)
      .htmlLat('lat')
      .htmlLng('lng')
      .htmlAltitude(0.06)
      .htmlElement((place) => Pin({ place, kind: place.kind, onPick: (value) => selectRef.current(placeMap.get(value.id), value.locationId) }))
      .arcColor(() => 'rgba(230,64,46,0.75)')
      .arcStroke(0.32)
      .arcAltitudeAutoScale(0.42)
      .arcDashLength(1)
      .arcDashGap(0)
      .arcDashAnimateTime(0)
      .arcsTransitionDuration(0)
      .polygonsTransitionDuration(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1000)
      .polygonCapCurvatureResolution(3)
      .polygonAltitude((feature) => feature.__hl ? 0.04 : 0.005)
      .polygonCapColor((feature) => feature.__hl ? 'rgba(230,64,46,0.45)' : 'rgba(0,0,0,0)')
      .polygonSideColor((feature) => feature.__hl ? 'rgba(230,64,46,0.5)' : 'rgba(0,0,0,0)')
      .polygonStrokeColor((feature) => feature.__hl ? '#ff6a55' : 'rgba(236,231,222,0.05)')
      .width(host.clientWidth)
      .height(host.clientHeight);

    globeRef.current = globe;
    globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    const controls = globe.controls();
    controls.autoRotate = !selected;
    controls.autoRotateSpeed = 0.55;
    controls.enableDamping = true;
    controls.minDistance = 160;
    controls.maxDistance = 480;
    globe.pointOfView({ lat: 30, lng: -150, altitude: 2.3 }, 0);

    const wake = (duration = 200) => {
      if (disposed || document.hidden) return;
      globe.resumeAnimation();
      window.clearTimeout(idleTimer);
      window.cancelAnimationFrame(pauseFrame);
      renderUntil = Math.max(renderUntil, performance.now() + duration);
      idleTimer = window.setTimeout(() => {
        if (disposed || dragging || controls.autoRotate) return;
        const target = cameraTargetRef.current;
        if (target) {
          const view = globe.pointOfView();
          const lngError = Math.abs(((view.lng - target.lng + 540) % 360) - 180);
          if (Math.abs(view.lat - target.lat) > .0001 || lngError > .0001 || Math.abs(view.altitude - target.altitude) > .0001) { wake(200); return; }
          cameraTargetRef.current = null;
        }
        // Camera tweens run after rendering; allow its completed pose to be presented.
        pauseFrame = window.requestAnimationFrame(() => {
          pauseFrame = window.requestAnimationFrame(() => {
            if (!disposed && !dragging && !controls.autoRotate && !cameraTargetRef.current) globe.pauseAnimation();
          });
        });
      }, Math.max(0, renderUntil - performance.now()));
    };
    wakeRef.current = wake;
    globe.onGlobeReady(() => wake(1000));

    const pauseRotation = () => {
      controls.autoRotate = false;
      cameraTargetRef.current = null;
      dragging = true;
      wake();
    };
    const release = () => { dragging = false; wake(1000); };
    const wheel = () => { controls.autoRotate = false; cameraTargetRef.current = null; wake(1000); };
    const visibility = () => {
      dragging = false;
      if (document.hidden) globe.pauseAnimation();
      else wake(1000);
    };
    host.addEventListener('pointerdown', pauseRotation, { capture: true, passive: true });
    host.addEventListener('wheel', wheel, { capture: true, passive: true });
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', visibility);

    let countryFeatures = [];
    const updateHighlights = (names, duration) => {
      window.clearTimeout(highlightTimer);
      const previous = new Set(globe.polygonsData());
      countryFeatures.forEach((feature) => {
        feature.__hl = names.includes(feature.properties?.ADMIN) || names.includes(feature.properties?.NAME);
      });
      // Only highlighted or departing countries need filled/extruded geometry.
      globe.polygonsTransitionDuration(duration).polygonsData(countryFeatures.filter((feature) => feature.__hl || (duration && previous.has(feature))));
      wake(duration + 200);
      if (duration) highlightTimer = window.setTimeout(() => {
        if (!disposed) { globe.polygonsData(countryFeatures.filter((feature) => feature.__hl)); wake(); }
      }, duration + 50);
    };
    highlightRef.current = updateHighlights;
    fetch(`${import.meta.env.BASE_URL}assets/countries-50m.geojson`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Country outlines unavailable')))
      .then((geo) => {
        if (disposed) return;
        countryFeatures = geo.features || [];
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(countryOutlinePositions(countryFeatures, globe.getGlobeRadius() * 1.0051), 3));
        outlines = new LineSegments(geometry, new LineBasicMaterial({ color: '#ece7de', opacity: .05, transparent: true, depthWrite: false }));
        globe.scene().add(outlines);
        updateHighlights(countriesRef.current, highlightDurationRef.current);
      })
      .catch(() => {});

    const observer = new ResizeObserver(() => {
      globe.width(host.clientWidth).height(host.clientHeight);
      globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      wake();
    });
    observer.observe(host);
    wake(1800);

    return () => {
      disposed = true;
      window.clearTimeout(highlightTimer);
      window.clearTimeout(idleTimer);
      window.cancelAnimationFrame(pauseFrame);
      wakeRef.current = null;
      highlightRef.current = null;
      if (outlines) {
        globe.scene().remove(outlines);
        outlines.geometry.dispose();
        outlines.material.dispose();
      }
      observer.disconnect();
      host.removeEventListener('pointerdown', pauseRotation, true);
      host.removeEventListener('wheel', wheel, true);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', visibility);
      globe._destructor();
      globeRef.current = null;
      host.replaceChildren();
    };
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const points = historicalPins(list, selected).map((place) => ({ ...place, focused: place.locationId === location?.id, kind: mode === 'wishlist' ? 'wish' : '' }));
    globe.htmlElementsData(points);
    globe.arcsData(historicalArcs(selected));
    wakeRef.current?.(1200);
  }, [list, mode, selected, location]);

  useEffect(() => {
    const duration = focusRevision > 0 || !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1000 : 0;
    highlightDurationRef.current = duration;
    highlightRef.current?.(countries, duration);
  }, [countries, focusRevision]);

  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = !selected;
    if (!location) { cameraTargetRef.current = null; wakeRef.current?.(200); return; }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Explicit selection requests camera travel; initial loading respects reduced motion.
    const duration = focusRevision > 0 ? 1500 : reducedMotion ? 0 : 900;
    const target = { lat: location.lat, lng: location.lng, altitude: 1.15 };
    cameraTargetRef.current = target;
    globeRef.current.pointOfView(target, duration);
    wakeRef.current?.(duration + 250);
  }, [selected, location, focusRevision]);

  return <div className="globe-host" ref={hostRef} aria-label="Địa cầu tương tác với các địa danh lịch sử" />;
}

export default function App() {
  const initialPlace = placeMap.get(readEventHash(window.location.hash).id);
  const [mode, setMode] = useState(() => {
    return initialPlace && !PLACES.includes(initialPlace) ? 'wishlist' : 'visited';
  });
  const [selected, setSelected] = useState(initialPlace);
  const [focusedLocationId, setFocusedLocationId] = useState(() => eventLocation(initialPlace, new URLSearchParams(window.location.hash.slice(1)).get('location'))?.id || null);
  const [focusRevision, setFocusRevision] = useState(0);
  const location = eventLocation(selected, focusedLocationId);
  const list = LISTS[mode];
  const groupedPlaces = useMemo(() => groupPlaces(list), [list]);

  const choosePlace = useCallback((place, locationId) => {
    const focus = eventLocation(place, locationId);
    setMode(PLACES.includes(place) ? 'visited' : 'wishlist');
    setSelected(place);
    setFocusedLocationId(focus?.id || null);
    setFocusRevision((value) => value + 1);
    const hash = new URLSearchParams({ event: place.id });
    if (focus) hash.set('location', focus.id);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${hash}`);
  }, []);

  const closePlace = useCallback(() => {
    setSelected(null);
    setFocusedLocationId(null);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }, []);

  const changeMode = (nextMode) => {
    choosePlace(LISTS[nextMode][0]);
  };

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') closePlace(); };
    const onHashChange = () => {
      const place = window.location.hash ? placeMap.get(readEventHash(window.location.hash).id) : null;
      setSelected(place || null);
      setFocusedLocationId(eventLocation(place, new URLSearchParams(window.location.hash.slice(1)).get('location'))?.id || null);
      setFocusRevision((value) => value + 1);
      if (place) setMode(PLACES.includes(place) ? 'visited' : 'wishlist');
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [closePlace]);

  useEffect(() => { document.title = `${selected?.short || 'Lịch sử Đảng'} · Địa cầu lịch sử`; }, [selected]);

  return (
    <main className={`atlas atlas--${mode}`}>
      <div className="grain" aria-hidden="true" />
      <GlobeStage mode={mode} selected={selected} focusedLocationId={focusedLocationId} focusRevision={focusRevision} onPick={choosePlace} />

      <header className="head">
        <p className="head__title">lịch sử <em>Đảng</em></p>
      </header>

      <nav className="controls" aria-label="Điều khiển địa cầu">
        <div className="mode-toggle" role="tablist" aria-label="Giai đoạn lịch sử">
          <button className={`mode-btn${mode === 'visited' ? ' is-active' : ''}`} role="tab" aria-selected={mode === 'visited'} onClick={() => changeMode('visited')}>1911–1945</button>
          <button className={`mode-btn${mode === 'wishlist' ? ' is-active' : ''}`} role="tab" aria-selected={mode === 'wishlist'} onClick={() => changeMode('wishlist')}>1945–2021</button>
        </div>
      </nav>

      <nav key={mode} className="places-nav" tabIndex="0" aria-label="Các sự kiện theo thời gian">
        {groupedPlaces.map(([region, countries]) => {
          const regionCount = [...countries.values()].reduce((total, places) => total + places.length, 0);
          return <section className="places-region" key={region}>
            <h2 className="places-region__title"><span>{region}</span><span>{regionCount}</span></h2>
            {[...countries.entries()].map(([country, places]) => <div className="places-country" key={country}>
              <h3>{country}</h3>
              {places.map((place) => <button
                className={`places-link${selected?.id === place.id ? ' is-active' : ''}`}
                key={place.id}
                onClick={() => choosePlace(place)}
                aria-current={selected?.id === place.id ? 'location' : undefined}
              >
                <span>{place.year}</span>
                <span>{place.city}</span>
              </button>)}
            </div>)}
          </section>;
        })}
      </nav>

      <aside className={`place-panel${selected ? ' place-panel--open' : ''}`} aria-hidden={!selected}>
        <button className="place-panel__close" aria-label="Đóng chi tiết sự kiện" onClick={closePlace}>×</button>
        {selected && <>
          <p className="place-panel__country">{selected.date} · {location?.country || selected.country}</p>
          <h2>{selected.city}</h2>
          <p className="place-panel__note">{selected.note}</p>
          <p className="place-panel__note">{selected.context}</p>
          <p className="place-panel__note">{selected.significance}</p>
          {selected.annotation && <p className="place-panel__note">{selected.annotation}</p>}
          {selected.places.length > 1 && <div className="event-locations" aria-label="Địa danh của sự kiện">{selected.places.map((id) => <button key={id} className={`places-link${location?.id === id ? ' is-active' : ''}`} aria-pressed={location?.id === id} onClick={() => choosePlace(selected, id)}>{eventLocation(selected, id).name}</button>)}</div>}
          <p className="place-panel__note">{location ? `${location.name} · ${location.today}. ` : ''}Địa lý hiện đại chỉ để định hướng, không tái dựng biên giới lịch sử. Đường nối biểu thị quan hệ được chú thích.</p>
          <p className="place-panel__note"><a href={selected.external?.url || textbookUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{selected.external ? selected.external.title : `Giáo trình Lịch sử Đảng Cộng sản Việt Nam, 2021 · tr. ${selected.pages.join(', ')}`}</a></p>
          <div className="place-photos" aria-label={`Trang tư liệu: ${selected.city}`}>
            {(selected.photos || []).filter(Boolean).map((photo, index) => <figure className="place-photo" key={`${photo.src}-${index}`}>
              <a href={photoUrl(photo)} target="_blank" rel="noreferrer"><img src={photoUrl(photo)} alt={`Bản chụp ${photo.title}, không phải ảnh sự kiện`} style={{ objectFit: 'contain' }} loading={index > 1 ? 'lazy' : 'eager'} onError={(event) => { event.currentTarget.closest('figure')?.classList.add('place-photo--missing'); }} /></a>
              <figcaption><span>{photo.title || selected.city}</span><span>{String(index + 1).padStart(2, '0')}</span></figcaption>
            </figure>)}
          </div>
          <p className="place-panel__coordinates">{!location ? 'Phạm vi cả nước · Không gán một tọa độ' : <>{location.lat.toFixed(2)}° {location.lat >= 0 ? 'N' : 'S'} <span>·</span> {Math.abs(location.lng).toFixed(2)}° {location.lng >= 0 ? 'E' : 'W'}</>}</p>
        </>}
      </aside>
    </main>
  );
}
