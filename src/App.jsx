import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, LineSegments } from 'three';
import { countryOutlinePositions } from './globeGeometry.js';
import { PLACES, WISHLIST, REGION_ORDER, historicalPins, historicalArcs, highlightedCountries, eventLocation } from './historicalPlaces.js';
import { EVENTS, readEventHash } from './history.js';
import { getNarration } from './narration.js';
import { prefersReducedMotion } from './motion.js';
import { PHASE, createExperience, displayPhase, evidenceDocked, globeArrived, restoreEvent, selectEvent, skipTransition as skipPhase, transitionIsRunning } from './experience.js';
import EventImageField from './EventImageField.jsx';
import textbookUrl from '../docs/Giao trinh lich su dang cong san viet nam.pdf?url';

const LISTS = { visited: PLACES, wishlist: WISHLIST };
const placeMap = new Map([...PLACES, ...WISHLIST].map((place) => [place.id, place]));
const NARRATION_REVEAL_RATIO = 0.7;
const NARRATION_SYNC_INTERVAL = 80;
// Fallback only: the reading panel normally opens on a real completion signal.
const TRANSITION_WATCHDOG = 6000;

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

function audioClipUrl(eventId) {
  return `${import.meta.env.BASE_URL}audio/${eventId}.mp3`;
}

function narrationSegments(text) {
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((segment) => segment.trim()).filter(Boolean) || [];
}

function narrationWeight(segment) {
  return segment.length + ((segment.match(/[,;:]/g) || []).length * 8);
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

function GlobeStage({ mode, selected, focusedLocationId, focusRevision, onPick, onFocusReady }) {
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
  const focusReadyRef = useRef(onFocusReady);
  const focusReadyTimerRef = useRef(null);

  useEffect(() => { selectRef.current = onPick; }, [onPick]);
  useEffect(() => { focusReadyRef.current = onFocusReady; }, [onFocusReady]);
  useEffect(() => { countriesRef.current = countries; }, [countries]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let disposed = false;
    let outlines;
    let highlightTimer;
    let idleTimer;
    let pauseFrame;
    let depthFrame;
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
      .polygonsTransitionDuration(prefersReducedMotion() ? 0 : 1000)
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

    const syncImageDepth = () => {
      if (depthFrame) return;
      depthFrame = window.requestAnimationFrame(() => {
        depthFrame = null;
        if (disposed) return;
        const view = globe.pointOfView();
        const altitude = view.altitude;
        const depthScale = Math.max(.94, Math.min(1.08, 1 + (2.3 - altitude) * .055));
        const depthX = Math.sin((view.lng + 150) * Math.PI / 180) * 22;
        const depthY = Math.max(-14, Math.min(14, (view.lat - 30) * -.18));
        const atlas = host.closest('.atlas');
        atlas?.style.setProperty('--image-depth-scale', depthScale.toFixed(4));
        atlas?.style.setProperty('--image-depth-x', `${depthX.toFixed(2)}px`);
        atlas?.style.setProperty('--image-depth-y', `${depthY.toFixed(2)}px`);
      });
    };
    controls.addEventListener('change', syncImageDepth);
    syncImageDepth();

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
      window.clearTimeout(focusReadyTimerRef.current);
      focusReadyTimerRef.current = null;
      window.clearTimeout(idleTimer);
      window.cancelAnimationFrame(pauseFrame);
      window.cancelAnimationFrame(depthFrame);
      wakeRef.current = null;
      highlightRef.current = null;
      if (outlines) {
        globe.scene().remove(outlines);
        outlines.geometry.dispose();
        outlines.material.dispose();
      }
      observer.disconnect();
      controls.removeEventListener('change', syncImageDepth);
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
    const duration = prefersReducedMotion() ? 0 : focusRevision > 0 ? 500 : 700;
    highlightDurationRef.current = duration;
    highlightRef.current?.(countries, duration);
  }, [countries, focusRevision]);

  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = !selected;
    window.clearTimeout(focusReadyTimerRef.current);
    focusReadyTimerRef.current = null;
    if (!location) { cameraTargetRef.current = null; wakeRef.current?.(200); return; }
    const reducedMotion = prefersReducedMotion();
    // Explicit selection requests camera travel; reduced motion skips the camera tween.
    const duration = reducedMotion ? 0 : focusRevision > 0 ? 1500 : 900;
    const highlightDuration = reducedMotion ? 0 : focusRevision > 0 ? 500 : 0;
    const holdDuration = location && focusRevision > 0 ? 1000 : 0;
    const target = { lat: location.lat, lng: location.lng, altitude: 1.15 };
    cameraTargetRef.current = target;
    globeRef.current.pointOfView(target, duration);
    wakeRef.current?.(duration + 250);
    if (focusRevision > 0) {
      focusReadyTimerRef.current = window.setTimeout(() => {
        focusReadyRef.current?.(focusRevision);
      }, Math.max(duration, highlightDuration) + holdDuration);
    }
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
  const [tourStatus, setTourStatus] = useState('idle');
  const [tourIndex, setTourIndex] = useState(-1);
  const [tourError, setTourError] = useState('');
  const [focusReadyRevision, setFocusReadyRevision] = useState(-1);
  const [experience, setExperience] = useState(() => initialPlace
    ? restoreEvent({ eventId: initialPlace.id, revision: 0, hasEvidence: Boolean(initialPlace.photos?.length) })
    : createExperience());
  const [promotionCancelled, setPromotionCancelled] = useState(false);
  const experienceWatchdogRef = useRef(null);
  const focusRevisionRef = useRef(0);
  const tourStatusRef = useRef('idle');
  const tourIndexRef = useRef(-1);
  const tourTokenRef = useRef(0);
  const tourTimerRef = useRef(null);
  const tourPhaseRef = useRef('idle');
  const tourLocationRef = useRef(null);
  const audioRef = useRef(null);
  const playStepRef = useRef(null);
  const [narrationText, setNarrationText] = useState('');
  const narrationTimingRef = useRef([]);
  const narrationSyncRef = useRef(null);
  const location = eventLocation(selected, focusedLocationId);
  const list = LISTS[mode];
  const groupedPlaces = useMemo(() => groupPlaces(list), [list]);

  const updateTourStatus = (next) => {
    tourStatusRef.current = next;
    setTourStatus(next);
  };
  const updateTourIndex = (next) => {
    tourIndexRef.current = next;
    setTourIndex(next);
  };
  const clearTourTimer = () => {
    window.clearTimeout(tourTimerRef.current);
    tourTimerRef.current = null;
  };
  const clearExperienceWatchdog = useCallback(() => {
    window.clearTimeout(experienceWatchdogRef.current);
    experienceWatchdogRef.current = null;
  }, []);
  const nextFocusRevision = useCallback(() => {
    focusRevisionRef.current += 1;
    setFocusRevision(focusRevisionRef.current);
    return focusRevisionRef.current;
  }, []);
  const clearNarrationSync = useCallback(() => {
    window.clearInterval(narrationSyncRef.current);
    narrationSyncRef.current = null;
  }, []);
  const syncNarration = useCallback((audio) => {
    const timing = narrationTimingRef.current;
    const duration = audio?.duration;
    if (!timing.length || !Number.isFinite(duration) || duration <= 0) return;

    const currentTime = Math.max(0, Math.min(audio.currentTime, duration));
    const totalWeight = timing.reduce((total, item) => total + item.weight, 0);
    let elapsed = 0;
    let active = timing[timing.length - 1];
    let activeProgress = 1;

    for (let index = 0; index < timing.length; index += 1) {
      const item = timing[index];
      const segmentDuration = duration * item.weight / totalWeight;
      const segmentEnd = elapsed + segmentDuration;
      if (currentTime < segmentEnd || index === timing.length - 1) {
        active = item;
        activeProgress = segmentDuration > 0 ? Math.max(0, Math.min(1, (currentTime - elapsed) / segmentDuration)) : 1;
        break;
      }
      elapsed = segmentEnd;
    }

    const revealProgress = prefersReducedMotion()
      ? 1
      : Math.min(1, activeProgress / NARRATION_REVEAL_RATIO);
    const visibleLength = Math.max(1, Math.ceil(active.text.length * revealProgress));
    const nextText = active.text.slice(0, visibleLength);
    setNarrationText((previous) => previous === nextText ? previous : nextText);
  }, []);
  const startNarrationSync = useCallback((audio) => {
    clearNarrationSync();
    syncNarration(audio);
    narrationSyncRef.current = window.setInterval(() => syncNarration(audio), NARRATION_SYNC_INTERVAL);
  }, [clearNarrationSync, syncNarration]);
  const cancelAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    clearNarrationSync();
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  }, [clearNarrationSync]);

  const choosePlace = useCallback((place, locationId) => {
    const focus = eventLocation(place, locationId);
    const revision = nextFocusRevision();
    const reducedMotion = prefersReducedMotion();
    const hasEvidence = Boolean(place.photos?.length);
    clearExperienceWatchdog();
    setMode(PLACES.includes(place) ? 'visited' : 'wishlist');
    setSelected(place);
    setFocusedLocationId(focus?.id || null);
    setFocusReadyRevision(-1);
    setPromotionCancelled(false);
    setExperience((state) => selectEvent(state, { eventId: place.id, revision, hasEvidence, reducedMotion }));
    if (!reducedMotion) {
      experienceWatchdogRef.current = window.setTimeout(() => {
        experienceWatchdogRef.current = null;
        setExperience((state) => skipPhase(state));
      }, TRANSITION_WATCHDOG);
    }
    const hash = new URLSearchParams({ event: place.id });
    if (focus) hash.set('location', focus.id);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${hash}`);
  }, [clearExperienceWatchdog, nextFocusRevision]);

  const playStep = useCallback((index, token, locationId = null) => {
    if (token !== tourTokenRef.current || tourStatusRef.current !== 'playing') return;
    if (index >= EVENTS.length) {
      tourPhaseRef.current = 'complete';
      updateTourIndex(EVENTS.length - 1);
      updateTourStatus('complete');
      cancelAudio();
      return;
    }
    const place = placeMap.get(EVENTS[index].id);
    if (!place) return;
    const focus = eventLocation(place, locationId);
    updateTourIndex(index);
    tourLocationRef.current = focus?.id || null;
    setTourError('');
    choosePlace(place, focus?.id || null);
    tourPhaseRef.current = 'focus';

    const reducedMotion = prefersReducedMotion();
    const cameraDelay = focus ? (reducedMotion ? 100 : 1750) : 100;

    tourTimerRef.current = window.setTimeout(() => {
      if (token !== tourTokenRef.current || tourStatusRef.current !== 'playing') return;

      const audio = audioRef.current;
      if (!audio) {
        tourPhaseRef.current = 'idle';
        updateTourStatus('idle');
        setTourError('Không tìm thấy trình phát âm thanh.');
        return;
      }

      tourPhaseRef.current = 'playing';

      let settled = false;
      const handleAudioError = (errorMsg) => {
        if (token !== tourTokenRef.current || settled) return;
        settled = true;
        cancelAudio();
        tourPhaseRef.current = 'idle';
        updateTourStatus('idle');
        setTourError(errorMsg || `Không tìm thấy tệp âm thanh (public/audio/${place.id}.mp3).`);
      };

      audio.onended = () => {
        if (token !== tourTokenRef.current || tourStatusRef.current !== 'playing' || settled) return;
        settled = true;
        clearNarrationSync();
        audio.onended = null;
        audio.onerror = null;
        tourPhaseRef.current = 'gap';
        tourTimerRef.current = window.setTimeout(() => {
          if (token !== tourTokenRef.current || tourStatusRef.current !== 'playing') return;
          playStepRef.current?.(index + 1, token);
        }, 700);
      };

      audio.onerror = () => {
        handleAudioError(`Không tìm thấy tệp âm thanh (public/audio/${place.id}.mp3).`);
      };

      audio.src = audioClipUrl(place.id);
      audio.currentTime = 0;
      startNarrationSync(audio);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          if (token !== tourTokenRef.current || tourStatusRef.current !== 'playing') return;
          handleAudioError(error?.name === 'NotAllowedError'
            ? 'Trình duyệt chặn tự động phát âm thanh.'
            : `Không thể phát tệp âm thanh (public/audio/${place.id}.mp3).`);
        });
      }
    }, cameraDelay);
  }, [choosePlace, cancelAudio, clearNarrationSync, startNarrationSync]);
  playStepRef.current = playStep;

  const stopTour = useCallback(() => {
    tourTokenRef.current += 1;
    clearTourTimer();
    cancelAudio();
    tourPhaseRef.current = 'idle';
    tourLocationRef.current = null;
    updateTourIndex(-1);
    updateTourStatus('idle');
    setTourError('');
  }, [cancelAudio]);

  const startTour = useCallback(() => {
    const selectedIndex = EVENTS.findIndex((event) => event.id === selected?.id);
    const startIndex = tourStatusRef.current === 'complete' ? 0 : Math.max(0, selectedIndex);
    tourTokenRef.current += 1;
    clearTourTimer();
    cancelAudio();
    setTourError('');
    updateTourStatus('playing');
    playStepRef.current?.(startIndex, tourTokenRef.current);
  }, [selected, cancelAudio]);

  const pauseTour = useCallback(() => {
    if (tourStatusRef.current !== 'playing') return;
    updateTourStatus('paused');
    if (tourPhaseRef.current === 'playing') {
      audioRef.current?.pause();
      clearNarrationSync();
    } else {
      clearTourTimer();
    }
  }, [clearNarrationSync]);

  const resumeTour = useCallback(() => {
    if (tourStatusRef.current !== 'paused') return;
    const audio = audioRef.current;
    if (tourPhaseRef.current === 'playing' && audio && audio.src && !audio.ended) {
      updateTourStatus('playing');
      startNarrationSync(audio);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (tourStatusRef.current !== 'playing') return;
          tourPhaseRef.current = 'idle';
          updateTourStatus('idle');
          setTourError('Không thể tiếp tục phát âm thanh: ' + (err.message || 'Lỗi phát tệp.'));
        });
      }
      return;
    }
    const phase = tourPhaseRef.current;
    const nextIndex = phase === 'gap' ? tourIndexRef.current + 1 : tourIndexRef.current;
    tourTokenRef.current += 1;
    clearTourTimer();
    cancelAudio();
    updateTourStatus('playing');
    playStepRef.current?.(Math.max(0, nextIndex), tourTokenRef.current, tourLocationRef.current);
  }, [cancelAudio, startNarrationSync]);

  useEffect(() => {
    const source = tourIndex >= 0 ? getNarration(EVENTS[tourIndex]?.id) : '';
    narrationTimingRef.current = narrationSegments(source).map((text) => ({ text, weight: narrationWeight(text) }));
    setNarrationText('');
  }, [tourIndex]);

  useEffect(() => {
    if (!['playing', 'paused'].includes(tourStatus)) {
      clearNarrationSync();
      setNarrationText('');
    }
  }, [tourStatus, clearNarrationSync]);

  useEffect(() => () => clearNarrationSync(), [clearNarrationSync]);

  const moveTour = useCallback((offset) => {
    const selectedIndex = EVENTS.findIndex((event) => event.id === selected?.id);
    const currentIndex = tourIndexRef.current >= 0 ? tourIndexRef.current : Math.max(0, selectedIndex);
    const nextIndex = Math.max(0, Math.min(EVENTS.length - 1, currentIndex + offset));
    const place = placeMap.get(EVENTS[nextIndex].id);
    const status = tourStatusRef.current;
    if (status === 'playing' || status === 'paused') {
      tourTokenRef.current += 1;
      clearTourTimer();
      cancelAudio();
      setTourError('');
      updateTourIndex(nextIndex);
      updateTourStatus(status);
      tourPhaseRef.current = 'focus';
      tourLocationRef.current = eventLocation(place)?.id || null;
      if (status === 'playing') playStepRef.current?.(nextIndex, tourTokenRef.current);
      else choosePlace(place);
      return;
    }
    if (status === 'complete') updateTourStatus('idle');
    setTourError('');
    updateTourIndex(-1);
    choosePlace(place);
  }, [choosePlace, selected, cancelAudio]);

  const selectPlace = useCallback((place, locationId) => {
    const eventIndex = EVENTS.findIndex((event) => event.id === place.id);
    const status = tourStatusRef.current;
    if (status === 'playing' && eventIndex >= 0) {
      tourTokenRef.current += 1;
      clearTourTimer();
      cancelAudio();
      setTourError('');
      updateTourStatus('playing');
      playStepRef.current?.(eventIndex, tourTokenRef.current, locationId);
      return;
    }
    if (status === 'paused' && eventIndex >= 0) {
      tourTokenRef.current += 1;
      clearTourTimer();
      cancelAudio();
      setTourError('');
      updateTourIndex(eventIndex);
      tourLocationRef.current = eventLocation(place, locationId)?.id || null;
      tourPhaseRef.current = 'focus';
      choosePlace(place, locationId);
      return;
    }
    if (status === 'complete') updateTourStatus('idle');
    setTourError('');
    updateTourIndex(-1);
    choosePlace(place, locationId);
  }, [choosePlace, cancelAudio]);

  const closePlace = useCallback(() => {
    stopTour();
    clearExperienceWatchdog();
    setPromotionCancelled(true);
    setExperience(createExperience());
    setSelected(null);
    setFocusedLocationId(null);
    setFocusReadyRevision(-1);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }, [clearExperienceWatchdog, stopTour]);

  const openReadingNow = useCallback(() => {
    clearExperienceWatchdog();
    setPromotionCancelled(true);
    setExperience((state) => skipPhase(state));
  }, [clearExperienceWatchdog]);

  const changeMode = (nextMode) => {
    selectPlace(LISTS[nextMode][0]);
  };

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') closePlace(); };
    const onHashChange = () => {
      const place = window.location.hash ? placeMap.get(readEventHash(window.location.hash).id) : null;
      stopTour();
      clearExperienceWatchdog();
      setPromotionCancelled(false);
      setSelected(place || null);
      setFocusedLocationId(eventLocation(place, new URLSearchParams(window.location.hash.slice(1)).get('location'))?.id || null);
      const revision = nextFocusRevision();
      setFocusReadyRevision(-1);
      setExperience(place
        ? restoreEvent({ eventId: place.id, revision, hasEvidence: Boolean(place.photos?.length) })
        : createExperience());
      if (place) setMode(PLACES.includes(place) ? 'visited' : 'wishlist');
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [clearExperienceWatchdog, closePlace, nextFocusRevision, stopTour]);

  useEffect(() => () => {
    tourTokenRef.current += 1;
    clearTourTimer();
    clearExperienceWatchdog();
    cancelAudio();
  }, [cancelAudio, clearExperienceWatchdog]);

  useEffect(() => { document.title = `${selected?.short || 'Lịch sử Đảng'} · Địa cầu lịch sử`; }, [selected]);

  useEffect(() => {
    if (!['playing', 'paused'].includes(tourStatus)) return;
    const nav = document.querySelector('.places-nav');
    if (!nav || window.getComputedStyle(nav).display === 'none') return;
    const activeRow = nav.querySelector('[aria-current="location"]');
    const reducedMotion = prefersReducedMotion();
    activeRow?.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [selected, tourStatus]);

  const selectedPosition = EVENTS.findIndex((event) => event.id === selected?.id);
  const tourPosition = tourIndex >= 0 ? tourIndex : selectedPosition;
  const tourPositionLabel = tourStatus === 'complete'
    ? `Hoàn tất · ${EVENTS.length}/${EVENTS.length}`
    : tourPosition >= 0 ? `${tourPosition + 1} / ${EVENTS.length}` : `${EVENTS.length} sự kiện`;
  const playLabel = tourStatus === 'playing' ? 'Tạm dừng thuyết minh'
    : tourStatus === 'paused' ? 'Tiếp tục thuyết minh'
      : tourStatus === 'complete' ? 'Phát lại từ đầu' : 'Phát thuyết minh';
  const onPlayClick = tourStatus === 'playing' ? pauseTour
    : tourStatus === 'paused' ? resumeTour : startTour;
  const handleFocusReady = useCallback((revision) => {
    setFocusReadyRevision(revision);
    setExperience((state) => globeArrived(state, revision));
  }, []);
  const handlePromotionComplete = useCallback((revision) => {
    if (revision !== focusRevisionRef.current) return;
    clearExperienceWatchdog();
    setExperience((state) => evidenceDocked(state, revision));
  }, [clearExperienceWatchdog]);
  const transitionActive = Boolean(selected) && experience.eventId === selected?.id && transitionIsRunning(experience);

  return (
    <main className={`atlas atlas--${mode}${selected ? ' atlas--has-selection' : ''}`} data-phase={displayPhase(experience, tourStatus)}>
      <audio ref={audioRef} preload="auto" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <EventImageField
        list={list}
        selected={selected}
        focusRevision={focusRevision}
        focusReadyRevision={focusReadyRevision}
        promotionCancelled={promotionCancelled}
        onPromotionComplete={handlePromotionComplete}
      />
      <GlobeStage
        mode={mode}
        selected={selected}
        focusedLocationId={focusedLocationId}
        focusRevision={focusRevision}
        onPick={selectPlace}
        onFocusReady={handleFocusReady}
      />

      <header className="head">
        <p className="head__title">lịch sử <em>Đảng</em></p>
      </header>

      {transitionActive && <div className="transit" role="status">
        <p className="transit__meta">{selected.year} · {location?.country || selected.country}</p>
        <p className="transit__title">{selected.short}</p>
        <p className="transit__state">{experience.phase === PHASE.presentingEvidence ? 'Đang đưa trang nguồn vào…' : 'Đang di chuyển đến địa danh…'}</p>
        <button type="button" className="transit__skip" onClick={openReadingNow}>Mở ngay</button>
      </div>}

      <nav className="controls" aria-label="Điều khiển địa cầu">
        <div className="mode-toggle" role="tablist" aria-label="Giai đoạn lịch sử">
          <button className={`mode-btn${mode === 'visited' ? ' is-active' : ''}`} role="tab" aria-selected={mode === 'visited'} onClick={() => changeMode('visited')}>1911–1945</button>
          <button className={`mode-btn${mode === 'wishlist' ? ' is-active' : ''}`} role="tab" aria-selected={mode === 'wishlist'} onClick={() => changeMode('wishlist')}>1945–2021</button>
        </div>
      </nav>

      <div className="guided-controls" role="group" aria-label="Thuyết minh theo dòng thời gian">
        <button type="button" className="guided-controls__button" aria-label="Sự kiện trước" title="Sự kiện trước" onClick={() => moveTour(-1)}>‹</button>
        <button type="button" className="guided-controls__button guided-controls__play" aria-label={playLabel} title={playLabel} onClick={onPlayClick}>{tourStatus === 'playing' ? 'Ⅱ' : '▶'}</button>
        <button type="button" className="guided-controls__button" aria-label="Dừng thuyết minh" title="Dừng thuyết minh" onClick={stopTour} disabled={tourStatus === 'idle' || tourStatus === 'complete'}>■</button>
        <button type="button" className="guided-controls__button" aria-label="Sự kiện tiếp theo" title="Sự kiện tiếp theo" onClick={() => moveTour(1)}>›</button>
        <span className="guided-controls__position" aria-live="polite">{tourPositionLabel}</span>
        {tourError && <span className="guided-controls__error" role="alert">{tourError}</span>}
      </div>

      {narrationText && ['playing', 'paused'].includes(tourStatus) && <section className="narration-caption" aria-label="Lời thuyết minh">
        <p className="narration-caption__label">{tourStatus === 'paused' ? 'Đã tạm dừng' : 'Thuyết minh'}</p>
        <p className="narration-caption__text" aria-hidden="true">{narrationText}<span className="narration-caption__cursor" /></p>
        <span className="sr-only" aria-live="polite">{getNarration(EVENTS[tourIndex]?.id)}</span>
      </section>}

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
                onClick={() => selectPlace(place)}
                aria-current={selected?.id === place.id ? 'location' : undefined}
              >
                <span>{place.year}</span>
                <span>{place.city}</span>
              </button>)}
            </div>)}
          </section>;
        })}
      </nav>

      <aside className={`place-panel${selected && experience.ready ? ' place-panel--open' : ''}`} aria-hidden={!selected || !experience.ready}>
        <button className="place-panel__close" aria-label="Đóng chi tiết sự kiện" onClick={closePlace}>×</button>
        {selected && <>
          <p className="place-panel__country">{selected.date} · {location?.country || selected.country}</p>
          <h2>{selected.city}</h2>
          <p className="place-panel__note">{selected.note}</p>
          <p className="place-panel__note">{selected.context}</p>
          <p className="place-panel__note">{selected.significance}</p>
          {selected.annotation && <p className="place-panel__note">{selected.annotation}</p>}
          {selected.places.length > 1 && <div className="event-locations" aria-label="Địa danh của sự kiện">{selected.places.map((id) => <button key={id} className={`places-link${location?.id === id ? ' is-active' : ''}`} aria-pressed={location?.id === id} onClick={() => selectPlace(selected, id)}>{eventLocation(selected, id).name}</button>)}</div>}
          <p className="place-panel__note">{location ? `${location.name} · ${location.today}. ` : ''}Địa lý hiện đại chỉ để định hướng, không tái dựng biên giới lịch sử. Đường nối biểu thị quan hệ được chú thích.</p>
          <p className="place-panel__note"><a href={selected.external?.url || textbookUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{selected.external ? selected.external.title : `Giáo trình Lịch sử Đảng Cộng sản Việt Nam, 2021 · tr. ${selected.pages.join(', ')}`}</a></p>
          <p className="place-panel__coordinates">{!location ? 'Phạm vi cả nước · Không gán một tọa độ' : <>{location.lat.toFixed(2)}° {location.lat >= 0 ? 'N' : 'S'} <span>·</span> {Math.abs(location.lng).toFixed(2)}° {location.lng >= 0 ? 'E' : 'W'}</>}</p>
        </>}
      </aside>
    </main>
  );
}
