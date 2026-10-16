import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { HOME, PLACES, WISHLIST, REGION_ORDER, historicalPins, historicalArcs } from './historicalPlaces.js';
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
  element.innerHTML = '<span class="pin__dot"></span><span class="pin__pulse"></span><span class="pin__label"></span>';
  element.querySelector('.pin__label').textContent = place.city;
  if (kind !== 'home') {
    element.addEventListener('click', (event) => {
      event.stopPropagation();
      onPick(place);
    });
  } else {
    element.tabIndex = -1;
    element.setAttribute('aria-label', 'Việt Nam · điểm định hướng');
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
      .globeImageUrl(`${import.meta.env.BASE_URL}assets/earth-dark.jpg`)
      .bumpImageUrl(`${import.meta.env.BASE_URL}assets/earth-topology.png`)
      .showAtmosphere(true)
      .atmosphereColor('#e6402e')
      .atmosphereAltitude(0.13)
      .htmlLat('lat')
      .htmlLng('lng')
      .htmlAltitude(0.012)
      .htmlElement((place) => Pin({ place, kind: place.kind, onPick: (value) => selectRef.current(placeMap.get(value.id)) }))
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
    fetch(`${import.meta.env.BASE_URL}assets/countries-50m.geojson`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Country outlines unavailable')))
      .then((geo) => {
        countryFeatures = geo.features || [];
        countryFeatures.forEach((feature) => {
          feature.__hl = Boolean(selectedRef.current?.mapCountry && (feature.properties?.ADMIN === selectedRef.current.mapCountry || feature.properties?.NAME === selectedRef.current.mapCountry));
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
    const points = [...historicalPins(list, selected).map((place) => ({ ...place, kind: mode === 'wishlist' ? 'wish' : '' })), { ...HOME, kind: 'home' }];
    globe.htmlElementsData(points);
    globe.arcsData(historicalArcs(selected));
  }, [list, mode, selected]);

  useEffect(() => {
    const features = globeRef.current?.polygonsData();
    if (!Array.isArray(features)) return;
    features.forEach((feature) => {
      feature.__hl = Boolean(selected?.mapCountry && (feature.properties?.ADMIN === selected.mapCountry || feature.properties?.NAME === selected.mapCountry));
    });
    globeRef.current
      .polygonAltitude((feature) => feature.__hl ? 0.04 : 0.005)
      .polygonCapColor((feature) => feature.__hl ? 'rgba(230,64,46,0.45)' : 'rgba(0,0,0,0)')
      .polygonSideColor((feature) => feature.__hl ? 'rgba(230,64,46,0.5)' : 'rgba(0,0,0,0)')
      .polygonStrokeColor((feature) => feature.__hl ? '#ff6a55' : 'rgba(236,231,222,0.05)');
  }, [selected]);

  useEffect(() => {
    if (!selected || selected.lat === null || !globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = false;
    window.clearTimeout(idleTimerRef.current);
    globeRef.current.pointOfView({ lat: selected.lat, lng: selected.lng - 18, altitude: 1.15 }, 1300);
    idleTimerRef.current = window.setTimeout(() => { controls.autoRotate = true; }, 9000);
  }, [selected]);

  return <div className="globe-host" ref={hostRef} aria-label="Địa cầu tương tác với các địa danh lịch sử" />;
}

export default function App() {
  const initialPlace = placeMap.get(readEventHash(window.location.hash).id);
  const [mode, setMode] = useState(() => {
    return initialPlace && !PLACES.includes(initialPlace) ? 'wishlist' : 'visited';
  });
  const [selected, setSelected] = useState(initialPlace);
  const list = LISTS[mode];
  const countryCount = useMemo(() => new Set(list.map((place) => place.mapCountry).filter(Boolean)).size, [list]);
  const groupedPlaces = useMemo(() => groupPlaces(list), [list]);

  const choosePlace = useCallback((place) => {
    setSelected(place);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#event=${encodeURIComponent(place.id)}`);
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
      const place = window.location.hash ? placeMap.get(readEventHash(window.location.hash).id) : null;
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

  useEffect(() => { document.title = `${selected?.short || 'Lịch sử Đảng'} · Địa cầu lịch sử`; }, [selected]);

  const surprise = () => choosePlace(list[Math.floor(Math.random() * list.length)]);

  return (
    <main className={`atlas atlas--${mode}`}>
      <div className="grain" aria-hidden="true" />
      <GlobeStage mode={mode} selected={selected} onPick={choosePlace} />

      <header className="head">
        <div className="head__brand">
          <span className="head__logo">LS<sup>VN</sup></span>
          <span className="head__gallery">ĐẢNG CỘNG SẢN VIỆT NAM</span>
        </div>
        <p className="head__title">lịch sử <em>Đảng</em></p>
        <div className="head__stats" aria-live="polite">
          <span><b>{countryCount}</b> quốc gia</span>
          <span className="head__dot" />
          <span><b>{list.length}</b> sự kiện</span>
        </div>
      </header>

      <h1 className={`hero-title${selected ? ' hero-title--hidden' : ''}`}>
        <span>HÀNH TRÌNH</span>
        <span className="hero-title__italic">LỊCH SỬ</span>
      </h1>

      <nav className="controls" aria-label="Điều khiển địa cầu">
        <div className="mode-toggle" role="tablist" aria-label="Giai đoạn lịch sử">
          <button className={`mode-btn${mode === 'visited' ? ' is-active' : ''}`} role="tab" aria-selected={mode === 'visited'} onClick={() => changeMode('visited')}>1911–1945</button>
          <button className={`mode-btn${mode === 'wishlist' ? ' is-active' : ''}`} role="tab" aria-selected={mode === 'wishlist'} onClick={() => changeMode('wishlist')}>1945–2021</button>
        </div>
        <button className="shuffle-btn" onClick={surprise}><span aria-hidden="true">⤮</span> khám phá</button>
      </nav>

      <p className="hint">KÉO ĐỂ XOAY <span>—</span> CHỌN ĐỊA DANH</p>

      <nav className="places-nav" aria-label="Các sự kiện theo thời gian">
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
          <p className="place-panel__country">{selected.date} · {selected.country}</p>
          <h2>{selected.city}</h2>
          <p className="place-panel__note">{selected.note}</p>
          <p className="place-panel__note">{selected.context}</p>
          <p className="place-panel__note">{selected.significance}</p>
          {selected.annotation && <p className="place-panel__note">{selected.annotation}</p>}
          <p className="place-panel__note">{selected.locationName ? `${selected.locationName} · ${selected.locationToday}. ` : ''}Địa lý hiện đại chỉ để định hướng, không tái dựng biên giới lịch sử. Đường nối biểu thị quan hệ được chú thích.</p>
          <p className="place-panel__note"><a href={selected.external?.url || textbookUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{selected.external ? selected.external.title : `Giáo trình Lịch sử Đảng Cộng sản Việt Nam, 2021 · tr. ${selected.pages.join(', ')}`}</a></p>
          <div className="place-photos" aria-label={`Trang tư liệu: ${selected.city}`}>
            {(selected.photos || []).filter(Boolean).map((photo, index) => <figure className="place-photo" key={`${photo.src}-${index}`}>
              <a href={photoUrl(photo)} target="_blank" rel="noreferrer"><img src={photoUrl(photo)} alt={`Bản chụp ${photo.title}, không phải ảnh sự kiện`} style={{ objectFit: 'contain' }} loading={index > 1 ? 'lazy' : 'eager'} onError={(event) => { event.currentTarget.closest('figure')?.classList.add('place-photo--missing'); }} /></a>
              <figcaption><span>{photo.title || selected.city}</span><span>{String(index + 1).padStart(2, '0')}</span></figcaption>
            </figure>)}
          </div>
          <p className="place-panel__coordinates">{selected.lat === null ? 'Phạm vi cả nước · Không gán một tọa độ' : <>{selected.lat.toFixed(2)}° {selected.lat >= 0 ? 'N' : 'S'} <span>·</span> {Math.abs(selected.lng).toFixed(2)}° {selected.lng >= 0 ? 'E' : 'W'}</>}</p>
        </>}
      </aside>
    </main>
  );
}
