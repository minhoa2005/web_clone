/* ============================================================
   FIELD ATLAS — globe.gl world with photo pins
   ============================================================ */

const DATASET = { visited: PLACES, wishlist: WISHLIST };
let mode = "visited";
const currentList = () => DATASET[mode];

/* ---------- pin elements ---------- */
function makePin(place, kind) {
  const el = document.createElement("div");
  el.className = "pin" + (kind ? ` pin--${kind}` : "");
  const label = document.createElement("span");
  label.className = "pin__label";
  label.textContent = place.city;
  el.appendChild(label);
  if (kind === "" || kind === "wish") el.addEventListener("click", () => openPlace(place, true));
  return el;
}

/* ---------- globe ---------- */
const globe = Globe()(document.getElementById("globe"))
  .backgroundColor("rgba(0,0,0,0)")
  .globeImageUrl("https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg")
  .bumpImageUrl("https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png")
  .showAtmosphere(true)
  .atmosphereColor("#e6402e")
  .atmosphereAltitude(0.13)
  .htmlLat("lat").htmlLng("lng").htmlAltitude(0.012)
  .htmlElement((d) => makePin(d, d.kind))
  .arcColor(() => ["rgba(230,64,46,0)", "rgba(230,64,46,0.85)"])
  .arcStroke(0.32)
  .arcAltitudeAutoScale(0.42)
  .arcDashLength(0.45)
  .arcDashGap(2.2)
  .arcDashAnimateTime(3600);

/* (re)draw pins + arcs for the active mode */
function renderGlobeData() {
  const list = currentList();
  globe.htmlElementsData([
    ...list.map((p) => ({ ...p, kind: mode === "wishlist" ? "wish" : "" })),
    { ...HOME, kind: "home" },
  ]);
  globe.arcsData(list.map((p) => ({
    startLat: HOME.lat, startLng: HOME.lng, endLat: p.lat, endLng: p.lng,
  })));
}

const scene = globe.scene();
const controls = globe.controls();
controls.autoRotate = true;
controls.autoRotateSpeed = 0.55;
controls.enableDamping = true;
controls.minDistance = 160;
controls.maxDistance = 480;

/* ---------- country / continent outlines ---------- */
// Load Natural Earth country polygons; keep them invisible until a header is
// clicked, then light up the matching country or whole continent.
const NAME_FIX = {
  "United States": ["United States of America", "United States"],
  "United Kingdom": ["United Kingdom"],
  "Hong Kong": ["Hong Kong", "Hong Kong S.A.R."], // separate at 50m
};
function featNames(f) {
  const p = f.properties || {};
  return [p.ADMIN, p.NAME, p.NAME_LONG, p.SOVEREIGNT, p.geounit].filter(Boolean);
}
function matchCountry(f, country) {
  const want = NAME_FIX[country] || [country];
  const names = featNames(f);
  return want.some((w) => names.includes(w));
}

let polyFeatures = [];
function applyHighlight() {
  globe
    .polygonAltitude((f) => (f.__hl ? 0.04 : 0.005))
    .polygonCapColor((f) => (f.__hl ? "rgba(230,64,46,0.45)" : "rgba(0,0,0,0)"))
    .polygonSideColor((f) => (f.__hl ? "rgba(230,64,46,0.5)" : "rgba(0,0,0,0)"))
    .polygonStrokeColor((f) => (f.__hl ? "#ff6a55" : "rgba(236,231,222,0.05)"));
}
function highlightCountry(country) {
  polyFeatures.forEach((f) => (f.__hl = matchCountry(f, country)));
  applyHighlight();
}
function highlightContinent(cont) {
  polyFeatures.forEach((f) => (f.__hl = (f.properties.CONTINENT === cont)));
  applyHighlight();
}
function clearHighlight() {
  polyFeatures.forEach((f) => (f.__hl = false));
  applyHighlight();
}

fetch("assets/countries-50m.geojson")
  .then((r) => r.json())
  .then((geo) => {
    polyFeatures = geo.features;
    globe
      .polygonsData(polyFeatures)
      .polygonCapCurvatureResolution(3)
      .polygonAltitude(0.005)
      .polygonCapColor(() => "rgba(0,0,0,0)")
      .polygonSideColor(() => "rgba(0,0,0,0)")
      .polygonStrokeColor(() => "rgba(236,231,222,0.05)");
  })
  .catch((e) => console.warn("country polygons unavailable", e));

/* start over the Pacific so both sides of the story are visible */
globe.pointOfView({ lat: 30, lng: -150, altitude: 2.3 }, 0);

window.addEventListener("resize", () => {
  globe.width(window.innerWidth).height(window.innerHeight);
});

/* pause auto-rotate while the user drags; resume after idle */
let idleTimer;
["pointerdown", "wheel"].forEach((ev) =>
  document.getElementById("globe").addEventListener(ev, () => {
    controls.autoRotate = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => (controls.autoRotate = true), 6000);
  }, { passive: true })
);

/* ---------- stats ---------- */
function animateCount(el, to) {
  const o = { v: +el.textContent || 0 };
  gsap.to(o, {
    v: to, duration: 1.2, ease: "power2.out",
    onUpdate: () => (el.textContent = Math.round(o.v)),
  });
}
function renderStats() {
  const list = currentList();
  animateCount(document.getElementById("statCountries"), new Set(list.map((p) => p.country)).size);
  animateCount(document.getElementById("statPlaces"), list.length);
  document.getElementById("statPlacesLabel").textContent = mode === "wishlist" ? "dreams" : "places";
}

/* ---------- place index — grouped by continent › country › place ---------- */
const nav = document.getElementById("placesNav");

const CONTINENT = {
  "United States": "North America", "Mexico": "North America", "Canada": "North America",
  "Japan": "Asia", "Hong Kong": "Asia", "Thailand": "Asia", "China": "Asia", "Jordan": "Asia",
  "Malaysia": "Asia", "Maldives": "Asia", "Indonesia": "Asia", "South Korea": "Asia",
  "Vietnam": "Asia", "Turkey": "Asia", "Bhutan": "Asia", "United Arab Emirates": "Asia",
  "United Kingdom": "Europe", "France": "Europe", "Norway": "Europe", "Iceland": "Europe",
  "Greece": "Europe", "Switzerland": "Europe", "Italy": "Europe", "Vatican City": "Europe",
  "Netherlands": "Europe", "Belgium": "Europe", "Spain": "Europe", "Germany": "Europe", "Austria": "Europe",
  "Peru": "South America", "Chile": "South America", "Bolivia": "South America",
  "New Zealand": "Oceania", "Australia": "Oceania", "Fiji": "Oceania",
  "Egypt": "Africa", "Madagascar": "Africa",
  "Caribbean Sea": "North America", "Bahamas": "North America",
};

function markActiveHeader(el) {
  document.querySelectorAll(".places__continent, .places__country")
    .forEach((h) => h.classList.toggle("is-active", h === el));
}

function renderNav() {
  nav.innerHTML = "";
  const list = currentList();
  // nest continent -> country -> [places]
  const tree = new Map();
  list.forEach((p) => {
    const cont = CONTINENT[p.country] || "Elsewhere";
    if (!tree.has(cont)) tree.set(cont, new Map());
    const cm = tree.get(cont);
    if (!cm.has(p.country)) cm.set(p.country, []);
    cm.get(p.country).push(p);
  });
  const countOf = (cm) => [...cm.values()].reduce((a, l) => a + l.length, 0);
  const continents = [...tree.keys()].sort((a, b) => countOf(tree.get(b)) - countOf(tree.get(a)));

  continents.forEach((cont) => {
    const ch = document.createElement("p");
    ch.className = "places__continent";
    ch.innerHTML = `${cont}<span>${countOf(tree.get(cont))}</span>`;
    ch.addEventListener("click", () => { markActiveHeader(ch); highlightContinent(cont); });
    nav.appendChild(ch);

    const cm = tree.get(cont);
    const countries = [...cm.keys()].sort((a, b) => cm.get(b).length - cm.get(a).length);
    countries.forEach((country) => {
      const head = document.createElement("p");
      head.className = "places__country";
      head.textContent = country;
      head.addEventListener("click", () => { markActiveHeader(head); highlightCountry(country); });
      nav.appendChild(head);

      cm.get(country).forEach((p) => {
        const btn = document.createElement("button");
        btn.className = "place-btn";
        btn.id = `nav-${p.id}`;
        const count = p.photos ? String(p.photos.length).padStart(2, "0") : "○";
        btn.innerHTML = `<i>${count}</i>${p.city}`;
        btn.addEventListener("click", () => openPlace(p, true));
        nav.appendChild(btn);
      });
    });
  });
  // re-stagger the freshly built list
  gsap.from("#placesNav .place-btn, #placesNav .places__country, #placesNav .places__continent", {
    opacity: 0, x: 18, duration: 0.5, stagger: 0.012, ease: "power3.out",
  });
}

/* ---------- detail panel ---------- */
const panel = document.getElementById("panel");
const panelCity = document.getElementById("panelCity");
const panelCountry = document.getElementById("panelCountry");
const panelNote = document.getElementById("panelNote");
const panelPhotos = document.getElementById("panelPhotos");
const panelShare = document.getElementById("panelShare");
let activeId = null;

/* share button — copies the unfurlable /place/<id> link */
panelShare.addEventListener("click", async () => {
  const url = `${location.origin}/place/${panelShare.dataset.id}`;
  try {
    await navigator.clipboard.writeText(url);
    const old = panelShare.textContent;
    panelShare.textContent = "link copied ✓";
    setTimeout(() => (panelShare.textContent = old), 1600);
  } catch {
    panelShare.textContent = url;
  }
});

function openPlace(place, fly) {
  activeId = place.id;
  document.querySelectorAll(".place-btn").forEach((b) =>
    b.classList.toggle("is-active", b.id === `nav-${place.id}`)
  );
  highlightCountry(place.country);  // light up the country this place sits in

  if (fly) {
    controls.autoRotate = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => (controls.autoRotate = true), 9000);
    globe.pointOfView({ lat: place.lat, lng: place.lng - 18, altitude: 1.15 }, 1300);
  }

  const isWish = !place.photos || place.photos.length === 0;
  panelCountry.textContent = isWish ? "On the wishlist · " + place.country : place.country;
  panelCity.textContent = place.city;
  panelNote.textContent = place.note || "";
  panelPhotos.innerHTML = "";
  (place.photos || []).forEach((ph, i) => {
    const fig = document.createElement("figure");
    fig.className = "panel__photo";
    fig.innerHTML = `<img src="${ph.src}" alt="${ph.title}" loading="lazy" />
      <figcaption><span>${ph.title}</span><em>${String(i + 1).padStart(2, "0")}</em></figcaption>`;
    panelPhotos.appendChild(fig);
  });
  // share button — only for visited places (they have OG cards)
  panelShare.style.display = isWish ? "none" : "";
  panelShare.dataset.id = place.id;

  if (location.hash !== "#" + place.id) history.replaceState(null, "", "#" + place.id);

  panel.setAttribute("aria-hidden", "false");
  gsap.to(panel, { xPercent: 0, duration: 0.9, ease: "power4.out", delay: fly ? 0.45 : 0 });
  gsap.fromTo(".panel__photo",
    { opacity: 0, y: 26 },
    { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", delay: fly ? 0.75 : 0.2 });
  gsap.to("#heroTitle", { opacity: 0, duration: 0.4 });
}

function closePanel() {
  activeId = null;
  document.querySelectorAll(".place-btn").forEach((b) => b.classList.remove("is-active"));
  markActiveHeader(null);
  clearHighlight();
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  gsap.to(panel, {
    xPercent: -101, duration: 0.7, ease: "power3.inOut",
    onComplete: () => panel.setAttribute("aria-hidden", "true"),
  });
  gsap.to("#heroTitle", { opacity: 1, duration: 0.6 });
}
document.getElementById("panelClose").addEventListener("click", closePanel);
window.addEventListener("keydown", (e) => { if (e.key === "Escape") closePanel(); });

gsap.set(panel, { x: 0, xPercent: -101, visibility: "visible" });

/* ---------- shareable deep links (map.carlfung.dev/#tokyo) ---------- */
const placeById = Object.fromEntries([...PLACES, ...WISHLIST].map((p) => [p.id, p]));
function openFromHash() {
  const id = decodeURIComponent(location.hash.replace(/^#/, ""));
  const place = placeById[id];
  if (place) {
    // switch to the right mode if the deep-linked place lives in the other list
    const wantMode = PLACES.includes(place) ? "visited" : "wishlist";
    if (mode !== wantMode) setMode(wantMode, false);
    if (activeId !== id) openPlace(place, true);
  } else if (!id && activeId) closePanel();
}
window.addEventListener("hashchange", openFromHash);

/* ---------- mode toggle (visited / wishlist) + shuffle ---------- */
function setMode(m, animate = true) {
  if (m === mode) return;
  mode = m;
  closePanel();
  renderGlobeData();
  renderNav();
  renderStats();
  document.querySelectorAll(".mode-btn").forEach((b) =>
    b.classList.toggle("is-active", b.dataset.mode === m));
  const t = document.getElementById("heroTitle");
  t.querySelector(".hero-title__line:first-child").textContent = "WHERE";
  t.querySelector(".hero-title__line--italic").textContent = m === "wishlist" ? "TO NEXT" : "WE'VE BEEN";
  document.body.classList.toggle("is-wishlist", m === "wishlist");
}
document.querySelectorAll(".mode-btn").forEach((b) =>
  b.addEventListener("click", () => setMode(b.dataset.mode)));

document.getElementById("shuffleBtn").addEventListener("click", () => {
  const list = currentList();
  const pick = list[Math.floor(Math.random() * list.length)];
  openPlace(pick, true);
});

/* initial render */
renderGlobeData();
renderNav();
renderStats();

/* ---------- entrance ---------- */
gsap.from(".hero-title__line", {
  yPercent: 110, duration: 1.1, stagger: 0.12, ease: "power4.out", delay: 0.3,
});
gsap.from(".head > *, .hint", { opacity: 0, y: 12, duration: 0.8, stagger: 0.08, delay: 0.6 });
/* the place index animates itself inside renderNav() */

/* slow approach from space */
const pov0 = { altitude: 3.6 };
globe.pointOfView({ lat: 30, lng: -150, altitude: pov0.altitude }, 0);
gsap.to(pov0, {
  altitude: 2.3, duration: 2.6, ease: "power3.inOut", delay: 0.2,
  onUpdate: () => {
    const cur = globe.pointOfView();
    globe.pointOfView({ lat: cur.lat, lng: cur.lng, altitude: pov0.altitude }, 0);
  },
});

/* if the page was opened with a #place hash, fly there once the intro settles.
   setTimeout (not gsap.delayedCall) so it still fires if the tab loads backgrounded. */
if (location.hash) setTimeout(openFromHash, 2900);
