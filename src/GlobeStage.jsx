import React, { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { LOCATIONS } from './history.js';
import { loadGeography } from './geography.js';
import { prefersReducedMotion, reducedMotionQuery } from './motion.js';

export default function GlobeStage({ event, focusedPlace, zoom, viewRevision, onReady, onError, onPick }) {
  const hostRef = useRef(null);
  const globeRef = useRef(null);
  const wakeRef = useRef(null);
  const pickRef = useRef(onPick);
  const [ready, setReady] = useState(false);
  pickRef.current = onPick;

  useEffect(() => {
    const host = hostRef.current;
    let disposed = false;
    let globe;
    let observer;
    let idleTimer;
    let renderUntil = 0;
    let readyFrame;
    let dragging = false;
    let contextCanvas;
    const reducedMotion = reducedMotionQuery();
    const pause = () => {
      if (!dragging && !disposed) globe?.pauseAnimation();
    };
    const wake = (duration = 180) => {
      if (disposed || !globe || document.hidden) return;
      globe.resumeAnimation();
      window.clearTimeout(idleTimer);
      // A resize or wheel event must not shorten an in-flight camera transition.
      renderUntil = Math.max(renderUntil, performance.now() + duration);
      idleTimer = window.setTimeout(pause, Math.max(0, renderUntil - performance.now()));
    };
    const start = () => { dragging = true; wake(); };
    const end = () => { dragging = false; wake(); };
    const wheel = () => wake(240);
    const visibility = () => {
      dragging = false;
      if (document.hidden) globe?.pauseAnimation();
      else wake();
    };
    const contextLost = (e) => { e.preventDefault(); onError(); };

    loadGeography().then((geo) => {
      if (disposed) return;
      globe = new Globe(host, {
        animateIn: false,
        rendererConfig: { antialias: false, alpha: true, powerPreference: 'low-power' },
      })
        .width(host.clientWidth).height(host.clientHeight)
        .backgroundColor('rgba(0,0,0,0)')
        .showAtmosphere(false)
        .polygonsData(geo.features)
        .polygonCapColor(() => '#64705a')
        .polygonSideColor(() => '#3a4539')
        .polygonStrokeColor(() => '#87907a')
        .polygonAltitude(0.008)
        .polygonCapCurvatureResolution(4)
        .polygonsTransitionDuration(0)
        .pointAltitude(0.025).pointRadius(1).pointResolution(8)
        .pointColor(() => '#e0be7a').pointsTransitionDuration(0)
        .pointLabel('name')
        .onPointClick((place) => pickRef.current(place.id))
        .arcColor(() => '#c6aa72').arcStroke(null)
        .arcDashAnimateTime(0).arcCurveResolution(24)
        .arcsTransitionDuration(0);

      globe.globeMaterial().color.set('#26332d');
      globe.globeMaterial().shininess = 0;
      globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      const controls = globe.controls();
      controls.autoRotate = false;
      controls.enableDamping = false;
      controls.enablePan = false;
      controls.minDistance = 150;
      controls.maxDistance = 600;
      globeRef.current = globe;
      wakeRef.current = wake;
      // Capture wakes the library before its own pointer handlers run.
      host.addEventListener('pointerdown', start, true);
      host.addEventListener('wheel', wheel, { capture: true, passive: true });
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
      window.addEventListener('blur', end);
      document.addEventListener('visibilitychange', visibility);
      contextCanvas = globe.renderer().domElement;
      contextCanvas.addEventListener('webglcontextlost', contextLost);
      observer = new ResizeObserver(() => {
        globe.width(host.clientWidth).height(host.clientHeight);
        globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
        wake();
      });
      observer.observe(host);
      readyFrame = window.requestAnimationFrame(() => {
        if (disposed) return;
        setReady(true);
        onReady();
        wake(reducedMotion.matches ? 180 : 750);
      });
    }).catch(() => { if (!disposed) onError(); });

    return () => {
      disposed = true;
      window.clearTimeout(idleTimer);
      window.cancelAnimationFrame(readyFrame);
      observer?.disconnect();
      host.removeEventListener('pointerdown', start, true);
      host.removeEventListener('wheel', wheel, true);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      window.removeEventListener('blur', end);
      document.removeEventListener('visibilitychange', visibility);
      contextCanvas?.removeEventListener('webglcontextlost', contextLost);
      globe?._destructor();
      globeRef.current = null;
      wakeRef.current = null;
      host.replaceChildren();
    };
  }, [onReady, onError]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !ready) return;
    const places = event.places.map((id) => LOCATIONS[id]);
    const focus = LOCATIONS[focusedPlace] || places[0] || { lat: 18, lng: 107 };
    const reducedMotion = prefersReducedMotion();
    const duration = reducedMotion ? 0 : 550;
    wakeRef.current?.(duration + 200);
    globe.pointsData(places);
    globe.arcsData((event.links || []).map(([from, to]) => ({
      startLat: LOCATIONS[from].lat, startLng: LOCATIONS[from].lng,
      endLat: LOCATIONS[to].lat, endLng: LOCATIONS[to].lng,
    })));
    globe.pointOfView({ lat: focus.lat + 4, lng: focus.lng - 8, altitude: zoom }, duration);
  }, [event, focusedPlace, zoom, viewRevision, ready]);

  return <div className={`globe-host${ready ? ' globe-host--ready' : ''}`} ref={hostRef} role="img" aria-label={`Địa cầu tương tác: ${event.places.map((id) => LOCATIONS[id].name).join(', ') || 'bối cảnh Việt Nam'}`} />;
}
