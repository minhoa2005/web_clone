import React, { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'globe.gl';
import {
  BoxGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  FrontSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from 'three';
import { countryOutlinePositions } from './globeGeometry.js';
import './pivot-demos.css';

const DEMOS = [
  {
    id: 'slow',
    index: '01',
    label: 'Nhịp chậm',
    title: 'Đủ thời gian để quan sát.',
    description: 'Một vòng quay chậm, ổn định để người xem đọc và đối chiếu từng tư liệu.',
    speed: 0.2,
    tag: 'SLOW ORBIT · 0.20 RAD/S',
  },
  {
    id: 'balanced',
    index: '02',
    label: 'Cân bằng',
    title: 'Chuyển động liền mạch.',
    description: 'Nhịp mặc định đưa ảnh qua mặt trước liên tục trong khi địa cầu vẫn tự quay độc lập.',
    speed: 0.34,
    tag: 'BALANCED ORBIT · 0.34 RAD/S',
  },
  {
    id: 'fast',
    index: '03',
    label: 'Nhanh',
    title: 'Một dòng tư liệu liên tục.',
    description: 'Tăng tốc vòng carousel để trình chiếu nhanh; từng ảnh vẫn mờ và rõ theo góc nhìn.',
    speed: 0.5,
    tag: 'FAST ORBIT · 0.50 RAD/S',
  },
];

const PHOTO_PAGES = ['98', '97', '96', '95', '82', '81', '79'];
const TAU = Math.PI * 2;
const IDLE_START_ANGLE = Math.PI * 110 / 180;
const IDLE_ARC_SPAN = Math.PI * 140 / 180;
const ENTER_MS = 1450;
const BASE_REAR_OPACITY = 0.2;

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function idleAngleFor(index, count, startAngle = IDLE_START_ANGLE) {
  const step = IDLE_ARC_SPAN / Math.max(1, count - 1);
  return startAngle + index * step;
}

function setCardAngle(card, angle, radius) {
  card.userData.angle = angle;
  card.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
  card.rotation.y = angle;
}

function buildCarouselRig(scene, globe, width) {
  const radius = globe.getGlobeRadius();
  const orbitRadius = radius * 1.62;
  const sceneRoot = new Group();
  const carousel = new Group();
  const owned = [];
  const loader = new TextureLoader();
  const cardWidth = radius * 0.7;
  const cardHeight = radius * 0.9;
  const cardDepth = radius * 0.035;
  const frameGeometry = new BoxGeometry(cardWidth + radius * 0.045, cardHeight + radius * 0.045, cardDepth);
  const imageGeometry = new PlaneGeometry(cardWidth, cardHeight);
  const backImageGeometry = imageGeometry.clone();
  const backUv = backImageGeometry.getAttribute('uv');

  for (let index = 0; index < backUv.count; index += 1) backUv.setX(index, 1 - backUv.getX(index));
  backUv.needsUpdate = true;
  owned.push(frameGeometry, imageGeometry, backImageGeometry);

  sceneRoot.add(carousel);

  const cards = [];
  const imageOffset = cardDepth * 0.52;
  PHOTO_PAGES.forEach((page, index) => {
    const texture = loader.load(`${import.meta.env.BASE_URL}assets/sources/page-${page}.webp`);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = Math.min(globe.renderer().capabilities.getMaxAnisotropy(), 4);
    owned.push(texture);

    const frameMaterial = new MeshBasicMaterial({
      color: '#151619', transparent: true, opacity: 0, depthTest: true, depthWrite: false,
    });
    const frontMaterial = new MeshBasicMaterial({
      map: texture, side: FrontSide, transparent: true, opacity: 0,
      depthTest: true, depthWrite: false, toneMapped: false,
    });
    const backMaterial = new MeshBasicMaterial({
      map: texture, side: FrontSide, transparent: true, opacity: 0,
      depthTest: true, depthWrite: false, toneMapped: false,
    });
    owned.push(frameMaterial, frontMaterial, backMaterial);

    const card = new Group();
    const frame = new Mesh(frameGeometry, frameMaterial);
    const front = new Mesh(imageGeometry, frontMaterial);
    const back = new Mesh(backImageGeometry, backMaterial);
    front.position.z = imageOffset;
    back.position.z = -imageOffset;
    back.rotation.y = Math.PI;
    card.add(frame, front, back);
    card.userData = {
      index,
      materials: [frameMaterial, frontMaterial, backMaterial],
      meshes: [frame, front, back],
      angle: idleAngleFor(index, PHOTO_PAGES.length),
    };
    setCardAngle(card, card.userData.angle, orbitRadius);
    cards.push(card);
    carousel.add(card);
  });

  const scale = width < 720 ? 0.8 : width < 980 ? 0.9 : 1;
  carousel.scale.setScalar(scale);
  scene.add(sceneRoot);

  return {
    radius,
    orbitRadius,
    sceneRoot,
    carousel,
    cards,
    owned,
    idleStartAngle: IDLE_START_ANGLE,
    mode: 'idle',
    transition: null,
    lastFrame: 0,
    earthGroup: null,
  };
}

function positionOpacity(card, rig, camera, mode, transitionProgress, settings) {
  const angle = card.userData.angle + rig.carousel.rotation.y;
  const radialX = Math.sin(angle);
  const radialZ = Math.cos(angle);
  const target = camera.userData.controlsTarget;
  const viewX = camera.position.x - (target?.x || 0);
  const viewZ = camera.position.z - (target?.z || 0);
  const viewLength = Math.hypot(viewX, viewZ) || 1;
  const facing = (radialX * viewX + radialZ * viewZ) / viewLength;
  const frontWeight = smoothstep(0.52, 0.98, facing);
  const rearOpacity = settings.rearOpacity;
  const idleOpacity = rearOpacity * (1 - smoothstep(-0.04, 0.12, facing));
  const presentationOpacity = rearOpacity + (settings.maxOpacity - rearOpacity) * frontWeight;

  let opacity = idleOpacity;
  if (mode === 'entering') opacity = idleOpacity + (presentationOpacity - idleOpacity) * transitionProgress;
  if (mode === 'playing') opacity = presentationOpacity;
  if (mode === 'exiting') opacity = presentationOpacity + (idleOpacity - presentationOpacity) * transitionProgress;
  opacity = clamp(opacity);

  card.userData.materials.forEach((material, index) => {
    material.opacity = index === 0 ? opacity * 0.78 : opacity;
  });
  card.userData.meshes.forEach((mesh) => { mesh.visible = opacity > 0.004; });
}

function worldCardAngles(rig) {
  return rig.cards.map((card) => card.userData.angle + rig.carousel.rotation.y);
}

function startTransition(rig, kind, durationMs) {
  const starts = worldCardAngles(rig);
  rig.carousel.rotation.y = 0;
  starts.forEach((angle, index) => setCardAngle(rig.cards[index], angle, rig.orbitRadius));

  let targets;
  let targetStart;
  if (kind === 'entering') {
    targetStart = starts[0];
    const step = TAU / rig.cards.length;
    targets = rig.cards.map((_, index) => targetStart + index * step);
  } else {
    targetStart = IDLE_START_ANGLE + Math.round((starts[0] - IDLE_START_ANGLE) / TAU) * TAU;
    targets = rig.cards.map((_, index) => idleAngleFor(index, rig.cards.length, targetStart));
    rig.idleStartAngle = targetStart;
  }

  rig.mode = kind;
  rig.transition = { kind, starts, targets, targetStart, elapsed: 0, duration: durationMs };
}

function completeTransition(rig) {
  const transition = rig.transition;
  if (!transition) return;
  transition.targets.forEach((angle, index) => setCardAngle(rig.cards[index], angle, rig.orbitRadius));
  if (transition.kind === 'entering') {
    rig.mode = 'playing';
    rig.carousel.rotation.y = 0;
  } else {
    rig.mode = 'idle';
    rig.carousel.rotation.y = 0;
    rig.idleStartAngle = transition.targetStart;
  }
  rig.transition = null;
}

export default function PivotDemos() {
  const hostRef = useRef(null);
  const rigRef = useRef(null);
  const modeRef = useRef('idle');
  const settingsRef = useRef(null);
  const [demoId, setDemoId] = useState(DEMOS[1].id);
  const [mode, setMode] = useState('idle');
  const [speed, setSpeed] = useState(DEMOS[1].speed);
  const [maxOpacity, setMaxOpacity] = useState(1);
  const [rearOpacity, setRearOpacity] = useState(BASE_REAR_OPACITY);
  const [returnSeconds, setReturnSeconds] = useState(1.6);
  const activeDemo = useMemo(() => DEMOS.find((item) => item.id === demoId) || DEMOS[1], [demoId]);
  const basePath = window.location.pathname.replace(/pivot-demos\/?$/, '') || '/';
  settingsRef.current = { speed, maxOpacity, rearOpacity, returnSeconds };

  useEffect(() => {
    document.title = 'Carousel quỹ đạo · Địa cầu lịch sử';
    return () => { document.title = 'Lịch sử Đảng · Địa cầu lịch sử'; };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let disposed = false;
    let observer;
    let outlines;
    let animationFrame = 0;

    const globe = Globe({ rendererConfig: { antialias: true, alpha: true, powerPreference: 'high-performance' } })(host)
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl(`${import.meta.env.BASE_URL}assets/earth-dark.jpg`)
      .bumpImageUrl(`${import.meta.env.BASE_URL}assets/earth-topology.png`)
      .showAtmosphere(true)
      .atmosphereColor('#e6402e')
      .atmosphereAltitude(0.13)
      .width(host.clientWidth)
      .height(host.clientHeight);

    globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    const controls = globe.controls();
    controls.autoRotate = false;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.minDistance = 160;
    controls.maxDistance = 480;
    globe.pointOfView({ lat: 0, lng: 0, altitude: 3.15 }, 0);
    controls.object.userData.controlsTarget = controls.target;

    let earthGroup;
    globe.scene().traverse((object) => {
      if (object.__globeObjType === 'globe') earthGroup = object;
    });
    const rig = buildCarouselRig(globe.scene(), globe, host.clientWidth);
    rig.earthGroup = earthGroup;
    rigRef.current = rig;

    fetch(`${import.meta.env.BASE_URL}assets/countries-50m.geojson`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Country outlines unavailable')))
      .then((geo) => {
        if (disposed || !earthGroup) return;
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(countryOutlinePositions(geo.features || [], rig.radius * 1.0051), 3));
        const material = new LineBasicMaterial({ color: '#ece7de', opacity: 0.07, transparent: true, depthWrite: false });
        outlines = new LineSegments(geometry, material);
        earthGroup.add(outlines);
      })
      .catch(() => {});

    let lastEarthFrame = performance.now();
    const animate = (now) => {
      if (disposed) return;
      const deltaSeconds = Math.min((now - lastEarthFrame) / 1000, 0.05);
      lastEarthFrame = now;
      if (earthGroup) earthGroup.rotation.y += deltaSeconds * (TAU / 60 * 0.55);

      const transition = rig.transition;
      let transitionProgress = 1;
      if (transition) {
        transition.elapsed += deltaSeconds * 1000;
        const linearProgress = transition.duration <= 0 ? 1 : clamp(transition.elapsed / transition.duration);
        transitionProgress = easeInOutCubic(linearProgress);
        transition.starts.forEach((start, index) => {
          const angle = start + (transition.targets[index] - start) * transitionProgress;
          setCardAngle(rig.cards[index], angle, rig.orbitRadius);
        });
        if (linearProgress >= 1) completeTransition(rig);
      } else if (rig.mode === 'playing') {
        rig.carousel.rotation.y += deltaSeconds * settingsRef.current.speed;
      }

      rig.cards.forEach((card) => positionOpacity(card, rig, controls.object, rig.mode, transition ? transitionProgress : 0, settingsRef.current));
      if (modeRef.current !== rig.mode) {
        modeRef.current = rig.mode;
        setMode(rig.mode);
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);

    observer = new ResizeObserver(() => {
      globe.width(host.clientWidth).height(host.clientHeight);
      globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      const nextScale = host.clientWidth < 720 ? 0.8 : host.clientWidth < 980 ? 0.9 : 1;
      rig.carousel.scale.setScalar(nextScale);
    });
    observer.observe(host);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      observer?.disconnect();
      if (outlines) {
        earthGroup?.remove(outlines);
        outlines.geometry.dispose();
        outlines.material.dispose();
      }
      rig.sceneRoot.traverse((object) => {
        if (object.geometry && !rig.owned.includes(object.geometry)) object.geometry.dispose();
      });
      rig.owned.forEach((asset) => asset.dispose?.());
      globe.scene().remove(rig.sceneRoot);
      globe._destructor();
      rigRef.current = null;
      host.replaceChildren();
    };
  }, []);

  const togglePresentation = () => {
    const rig = rigRef.current;
    if (!rig) return;
    if (rig.mode === 'idle' || rig.mode === 'exiting') {
      startTransition(rig, 'entering', ENTER_MS);
    } else {
      startTransition(rig, 'exiting', settingsRef.current.returnSeconds * 1000);
    }
    modeRef.current = rig.mode;
    setMode(rig.mode);
  };

  const selectDemo = (demo) => {
    setDemoId(demo.id);
    setSpeed(demo.speed);
  };

  const isActive = mode === 'entering' || mode === 'playing';
  const modeText = {
    idle: 'GLOBE MODE · MẶT TRƯỚC TRỐNG',
    entering: 'ĐANG MỞ VÒNG TRÌNH CHIẾU',
    playing: 'PRESENTATION · ORBIT LIÊN TỤC',
    exiting: 'CAROUSEL ĐANG THU HỒI',
  }[mode];

  return (
    <main className="pivot-page">
      <div className="pivot-page__grain" aria-hidden="true" />
      <header className="pivot-header">
        <a className="pivot-header__brand" href={basePath}>
          <span>FIELD ATLAS</span><small>HISTORICAL GLOBE</small>
        </a>
        <span className="pivot-header__section">STUDIES / 03</span>
        <a className="pivot-header__back" href={basePath}>Về địa cầu <span>↗</span></a>
      </header>

      <section className="pivot-intro">
        <p className="pivot-kicker"><span /> CAROUSEL 3D · ORBIT AROUND THE GLOBE</p>
        <h1>Tư liệu<br /><em>trong quỹ đạo.</em></h1>
        <p className="pivot-intro__summary">Một vòng ảnh 3D ôm quanh địa cầu. Bắt đầu trình chiếu để mở vòng quay liên tục; kết thúc để toàn bộ ảnh thu về phía sau.</p>
      </section>

      <section className="pivot-stage" aria-label="Carousel ảnh 3D quanh địa cầu">
        <div className="pivot-globe" ref={hostRef} role="img" aria-label="Địa cầu 3D có thể xoay độc lập và carousel ảnh 3D quanh một tâm chung" />
        <div className="pivot-stage__frame" aria-hidden="true"><span>SHARED CENTER / VERTICAL ORBIT</span><span>{activeDemo.tag}</span></div>
        <div className="pivot-stage__depth" aria-live="polite">
          <span className={`pivot-stage__depth-dot${isActive ? ' is-front' : ''}`} />
          {modeText}
        </div>
        <p className="pivot-stage__axis-label" aria-hidden="true">ẢNH MẶT SAU · GƯƠNG · DEPTH OCCLUSION</p>
      </section>

      <section className="pivot-console" aria-label="Điều khiển carousel 3D">
        <div className="pivot-console__selector">
          <p className="pivot-console__label">BA NHỊP QUỸ ĐẠO</p>
          <div className="pivot-tabs" role="tablist" aria-label="Chọn nhịp carousel">
            {DEMOS.map((item) => <button
              className={`pivot-tab${item.id === demoId ? ' is-active' : ''}`}
              key={item.id}
              role="tab"
              aria-selected={item.id === demoId}
              onClick={() => selectDemo(item)}
            >
              <span>{item.index}</span>{item.label}
            </button>)}
          </div>
        </div>

        <div className="pivot-console__detail" role="tabpanel">
          <p className="pivot-console__label">{activeDemo.tag}</p>
          <h2>{activeDemo.title}</h2>
          <p>{activeDemo.description}</p>
        </div>

        <div className="pivot-console__actions">
          <button className="pivot-action pivot-action--primary" onClick={togglePresentation} aria-label={mode === 'idle' ? 'Bắt đầu trình chiếu carousel liên tục' : mode === 'exiting' ? 'Mở lại carousel trình chiếu' : 'Kết thúc trình chiếu và thu hồi carousel'}>
            <span className="pivot-action__icon">{mode === 'idle' ? '↻' : mode === 'exiting' ? '↷' : '↶'}</span>
            {mode === 'idle' ? 'Bắt đầu trình chiếu' : mode === 'exiting' ? 'Mở lại trình chiếu' : 'Kết thúc trình chiếu'}
          </button>
          <p className="pivot-console__motion" aria-live="polite">{modeText}</p>
        </div>

        <div className="pivot-console__sliders" aria-label="Tinh chỉnh chuyển động">
          <label className="pivot-range">
            <span><span>Tốc độ quay</span><output>{speed.toFixed(2)} rad/s</output></span>
            <input type="range" min="0.12" max="0.72" step="0.01" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
          </label>
          <label className="pivot-range">
            <span><span>Độ rõ phía trước</span><output>{Math.round(maxOpacity * 100)}%</output></span>
            <input type="range" min="0.55" max="1" step="0.05" value={maxOpacity} onChange={(event) => setMaxOpacity(Number(event.target.value))} />
          </label>
          <label className="pivot-range">
            <span><span>Thời gian thu hồi</span><output>{returnSeconds.toFixed(1)} giây</output></span>
            <input type="range" min="0.8" max="3" step="0.1" value={returnSeconds} onChange={(event) => setReturnSeconds(Number(event.target.value))} />
          </label>
        </div>
      </section>

      <footer className="pivot-footer">
        <span><b>01</b> Tâm chung với địa cầu</span>
        <span><b>02</b> Orbit liên tục · không dừng</span>
        <span><b>03</b> Fade theo góc nhìn 3D</span>
      </footer>
    </main>
  );
}
