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
  Plane,
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
    description: 'Tăng tốc vòng carousel; từng ảnh nối đuôi nhau và giữ rõ nét trong cung phía trước.',
    speed: 0.5,
    tag: 'FAST ORBIT · 0.50 RAD/S',
  },
];

const PHOTO_PAGES = ['98', '97', '96', '95', '82', '81', '79'];
const TAU = Math.PI * 2;

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
  const clipPlane = new Plane(new Vector3(0, 0, 1), 0);
  const rearClipPlane = clipPlane.clone().negate();

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
      clippingPlanes: [clipPlane],
    });
    const frontMaterial = new MeshBasicMaterial({
      map: texture, side: FrontSide, transparent: true, opacity: 0,
      depthTest: true, depthWrite: false, toneMapped: false,
      clippingPlanes: [clipPlane],
    });
    const backMaterial = new MeshBasicMaterial({
      map: texture, side: FrontSide, transparent: true, opacity: 0,
      depthTest: true, depthWrite: false, toneMapped: false,
      clippingPlanes: [clipPlane],
    });
    owned.push(frameMaterial, frontMaterial, backMaterial);

    const card = new Group();
    const frame = new Mesh(frameGeometry, frameMaterial);
    const front = new Mesh(imageGeometry, frontMaterial);
    const back = new Mesh(backImageGeometry, backMaterial);
    front.position.z = imageOffset;
    back.position.z = -imageOffset;
    back.rotation.y = Math.PI;
    const frontSegment = new Group();
    frontSegment.add(frame, front, back);
    const rearSegment = frontSegment.clone();
    const rearMaterials = rearSegment.children.map((mesh) => {
      mesh.material = mesh.material.clone();
      mesh.material.clippingPlanes = [rearClipPlane];
      return mesh.material;
    });
    owned.push(...rearMaterials);
    card.add(frontSegment, rearSegment);
    card.userData = {
      index,
      materials: [frameMaterial, frontMaterial, backMaterial, ...rearMaterials],
      frontSegment,
      rearSegment,
      angle: index * TAU / PHOTO_PAGES.length,
      previouslyInFront: null,
      passVisible: false,
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
    clipPlane,
    rearClipPlane,
    halfCardWidth: frameGeometry.parameters.width / 2,
    halfCardDepth: imageOffset,
    mode: 'idle',
    presentationRequested: false,
    lastFrame: 0,
    earthGroup: null,
  };
}

function updateCardVisibility(card, rig, settings) {
  const angle = card.userData.angle + rig.carousel.rotation.y;
  const normal = rig.clipPlane.normal;
  const radialDistance = Math.sin(angle) * normal.x + Math.cos(angle) * normal.z;
  const tangentDistance = Math.cos(angle) * normal.x - Math.sin(angle) * normal.z;
  const scale = rig.carousel.scale.x;
  const centerDistance = rig.orbitRadius * radialDistance * scale;
  const halfExtent = (rig.halfCardWidth * Math.abs(tangentDistance)
    + rig.halfCardDepth * Math.abs(radialDistance)) * scale;
  // Latch at the leading edge, and release only after the trailing edge clears.
  // The shared clipping plane cuts individual fragments, including the frame.
  const inFront = centerDistance + halfExtent > 0;
  const inRear = centerDistance - halfExtent < 0;
  if (inFront && card.userData.previouslyInFront === false) {
    card.userData.passVisible = rig.presentationRequested;
  }
  if (!inFront) card.userData.passVisible = false;
  card.userData.previouslyInFront = inFront;

  card.userData.materials.forEach((material, index) => {
    material.opacity = index % 3 === 0 ? settings.maxOpacity * 0.78 : settings.maxOpacity;
  });
  card.userData.frontSegment.visible = card.userData.passVisible && inFront;
  // Complementary clipping keeps stopped cards behind the globe, including
  // partial cards at either boundary. The orbit itself never stops.
  card.userData.rearSegment.visible = !rig.presentationRequested && inRear;
  card.visible = card.userData.frontSegment.visible || card.userData.rearSegment.visible;
  return card.userData.frontSegment.visible;
}

function startTransition(rig, kind) {
  // Existing front passes keep their visibility. Changing this gate only
  // affects subsequent arrivals, so opening and closing proceed card by card.
  rig.presentationRequested = kind === 'entering';
  rig.mode = kind;
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
  const activeDemo = useMemo(() => DEMOS.find((item) => item.id === demoId) || DEMOS[1], [demoId]);
  const basePath = window.location.pathname.replace(/pivot-demos\/?$/, '') || '/';
  settingsRef.current = { speed, maxOpacity };

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
    globe.renderer().localClippingEnabled = true;
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

      const settings = settingsRef.current;
      rig.carousel.rotation.y += deltaSeconds * settings.speed;

      const normal = rig.clipPlane.normal;
      const viewX = controls.object.position.x - controls.target.x;
      const viewZ = controls.object.position.z - controls.target.z;
      // Keep the cut aligned with the viewing direction, independently of orbit.
      if (Math.hypot(viewX, viewZ) > 0.0001) normal.set(viewX, 0, viewZ).normalize();
      rig.rearClipPlane.copy(rig.clipPlane).negate();

      let hasRevealedCard = false;
      rig.cards.forEach((card) => {
        if (updateCardVisibility(card, rig, settings)) hasRevealedCard = true;
      });
      if (rig.mode === 'entering' && hasRevealedCard) rig.mode = 'playing';
      if (rig.mode === 'exiting' && !rig.cards.some((card) => card.userData.passVisible)) rig.mode = 'idle';
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
      startTransition(rig, 'entering');
    } else {
      startTransition(rig, 'exiting');
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
    idle: 'GLOBE MODE · ẢNH QUAY PHÍA SAU',
    entering: 'ĐANG CHỜ ẢNH KẾ TIẾP ĐI VÀO',
    playing: 'PRESENTATION · ORBIT LIÊN TỤC',
    exiting: 'ẢNH ĐANG CHUYỂN VỀ PHÍA SAU',
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
        <p className="pivot-intro__summary">Một vòng ảnh 3D luôn chuyển động. Bật trình chiếu để ảnh lần lượt đi vào cung trước; kết thúc để ảnh tiếp tục quay và hiển thị phía sau địa cầu.</p>
      </section>

      <section className="pivot-stage" aria-label="Carousel ảnh 3D quanh địa cầu">
        <div className="pivot-globe" ref={hostRef} role="img" aria-label="Địa cầu 3D có thể xoay độc lập và carousel ảnh 3D quanh một tâm chung" />
        <div className="pivot-stage__frame" aria-hidden="true"><span>SHARED CENTER / VERTICAL ORBIT</span><span>{activeDemo.tag}</span></div>
        <div className="pivot-stage__depth" aria-live="polite">
          <span className={`pivot-stage__depth-dot${isActive ? ' is-front' : ''}`} />
          {modeText}
        </div>
        <p className="pivot-stage__axis-label" aria-hidden="true">RANH GIỚI CẮT · {isActive ? 'CUNG PHÍA TRƯỚC' : 'CUNG PHÍA SAU'}</p>
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
          <button className="pivot-action pivot-action--primary" onClick={togglePresentation} aria-label={mode === 'idle' ? 'Bắt đầu trình chiếu carousel liên tục' : mode === 'exiting' ? 'Mở lại carousel trình chiếu' : 'Kết thúc trình chiếu và chuyển ảnh về phía sau địa cầu'}>
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
            <span><span>Độ rõ của ảnh</span><output>{Math.round(maxOpacity * 100)}%</output></span>
            <input type="range" min="0.55" max="1" step="0.05" value={maxOpacity} onChange={(event) => setMaxOpacity(Number(event.target.value))} />
          </label>
        </div>
      </section>

      <footer className="pivot-footer">
        <span><b>01</b> Tâm chung với địa cầu</span>
        <span><b>02</b> Orbit liên tục · không dừng</span>
        <span><b>03</b> Qua ranh giới · ẩn ngay từng phần</span>
      </footer>
    </main>
  );
}
