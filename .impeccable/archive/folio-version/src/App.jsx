import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EVENTS, LOCATIONS, PERIODS, TEXTBOOK, readEventHash, searchEvents } from './history.js';
import { loadGeography, mapPath } from './geography.js';
import textbookUrl from '../docs/Giao trinh lich su dang cong san viet nam.pdf?url';

const GlobeStage = lazy(() => import('./GlobeStage.jsx'));
const sourcePage = (page) => `${import.meta.env.BASE_URL}assets/sources/page-${page}.webp`;

function Icon({ name, ...props }) {
  const shapes = {
    arrow: <path d="M4 12h16M14 6l6 6-6 6" />,
    book: <path d="M12 5v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2Z" />,
    grid: <><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    reset: <path d="M4 9a8 8 0 1 1 0 6M4 3v6h6" />,
    external: <path d="M14 3h7v7M21 3 10 14M10 3H3v18h18v-7" />,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{shapes[name]}</svg>;
}

function MapFallback({ event, visible }) {
  const [paths, setPaths] = useState([]);
  useEffect(() => {
    let active = true;
    loadGeography().then((geo) => { if (active) setPaths(geo.features.map(mapPath)); }).catch(() => {});
    return () => { active = false; };
  }, []);
  return <div className={`flat-map${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
    <svg viewBox="0 0 1000 500" role="img" aria-label="Bản đồ định hướng hiện đại; địa danh lịch sử được chú thích riêng">
      <g className="map-graticule">{[125, 250, 375].map((y) => <path key={y} d={`M0 ${y}H1000`} />)}{[166, 333, 500, 666, 833].map((x) => <path key={x} d={`M${x} 0V500`} />)}</g>
      <g className="map-land">{paths.map((path, i) => <path d={path} key={i} />)}</g>
      {event.places.map((id) => {
        const place = LOCATIONS[id];
        return <g key={id} transform={`translate(${(place.lng + 180) * 2.7778},${(90 - place.lat) * 2.7778})`}><circle className="map-marker" r="6" /><text x="12" y="4">{place.name}</text></g>;
      })}
    </svg>
  </div>;
}

function Timeline({ event, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const period = PERIODS.find((item) => item.id === event.period);
  const events = EVENTS.filter((item) => item.period === period.id);
  const current = EVENTS.indexOf(event);
  const tickRef = useRef(null);
  const periodRef = useRef(null);
  useEffect(() => {
    tickRef.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' });
    periodRef.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' });
  }, [event]);
  const move = (direction) => { if (EVENTS[current + direction]) onSelect(EVENTS[current + direction]); };
  return <footer className={`timeline${expanded ? ' is-expanded' : ''}`} aria-label="Dòng thời gian lịch sử">
    <div className="mobile-dock"><button className="timeline-expander" aria-expanded={expanded} aria-controls="period-navigation" onClick={() => setExpanded((value) => !value)}><time>{event.year}</time><span>{expanded ? 'Thu gọn' : 'Dòng thời gian'}</span><Icon name={expanded ? 'minus' : 'plus'} /></button><div className="mobile-steps"><button className="icon-button previous" aria-label="Sự kiện trước" disabled={current === 0} onClick={() => move(-1)}><Icon name="arrow" /></button><button className="icon-button mobile-next" aria-label="Sự kiện tiếp theo" disabled={current === EVENTS.length - 1} onClick={() => move(1)}><Icon name="arrow" /></button></div></div>
    <div className="period-tabs" id="period-navigation" aria-label="Chọn giai đoạn">
      {PERIODS.map((item, i) => <button key={item.id} ref={item.id === period.id ? periodRef : undefined} className={item.id === period.id ? 'is-active' : ''} aria-current={item.id === period.id ? 'step' : undefined} onClick={() => onSelect(EVENTS.find((entry) => entry.period === item.id))}>
        <span className="period-number">{String(i + 1).padStart(2, '0')}</span><span><b>{item.range}</b><span>{item.title}</span></span>
      </button>)}
    </div>
    <div className="timeline-bottom">
      <div className="timeline-position"><span>{String(current + 1).padStart(2, '0')}<small> / {EVENTS.length}</small></span><p>Mốc lịch sử</p></div>
      <div className="event-track" aria-label={`Chuỗi sự kiện ${period.range}; khoảng cách không biểu thị độ dài thời gian`}>
        {events.map((item) => <button key={item.id} ref={item.id === event.id ? tickRef : undefined} aria-label={`${item.date}: ${item.short}`} aria-current={item.id === event.id ? 'step' : undefined} className={`event-tick${item.id === event.id ? ' is-active' : ''}`} onClick={() => onSelect(item)} onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); }
        }}><span className="tick-dot" /><b>{item.year}</b><span>{item.short}</span></button>)}
      </div>
      <div className="step-controls"><button className="icon-button previous" aria-label="Sự kiện trước" disabled={current === 0} onClick={() => move(-1)}><Icon name="arrow" /></button><button className="next-button" disabled={current === EVENTS.length - 1} onClick={() => move(1)}><span>Tiếp theo</span><Icon name="arrow" /></button></div>
    </div>
  </footer>;
}

function Drawer({ kind, event, onClose, onSelect }) {
  const dialogRef = useRef(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(event.pages[0]);
  const [imageFailed, setImageFailed] = useState(false);
  const results = useMemo(() => searchEvents(query, filter), [query, filter]);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);
  useEffect(() => { setImageFailed(false); }, [page]);
  return <dialog ref={dialogRef} className={`drawer drawer--${kind}`} aria-labelledby="drawer-title" onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="drawer-inner">
      <header className="drawer-header"><h2 id="drawer-title">{kind === 'index' ? 'Mục lục hành trình' : 'Đọc cùng tư liệu'}</h2><button className="icon-button" aria-label="Đóng cửa sổ" onClick={onClose}><Icon name="close" /></button></header>
      {kind === 'index' ? <>
        <p className="drawer-intro">Tìm một dấu mốc, hoặc bắt đầu từ một giai đoạn.</p>
        <label className="search-box"><Icon name="search" /><input autoFocus placeholder="Tìm sự kiện, năm, địa danh…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Tìm sự kiện" /></label>
        <label className="filter-label">Giai đoạn<select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">Toàn bộ hành trình</option>{PERIODS.map((period) => <option key={period.id} value={period.id}>{period.range} · {period.title}</option>)}</select></label>
        <p className="result-count" role="status">{results.length} sự kiện</p>
        <div className="search-results">{results.map((entry) => <button key={entry.id} className={entry.id === event.id ? 'is-active' : ''} onClick={() => { onSelect(entry); onClose(); }}><time>{entry.year}</time><span><b>{entry.short}</b><small>{entry.date}</small></span><Icon name="arrow" /></button>)}</div>
        {results.length === 0 && <div className="empty-results"><h3>Chưa tìm thấy sự kiện</h3><p>Thử một năm, địa danh hoặc từ khóa khác. Bạn có thể tìm không dấu.</p><button onClick={() => { setQuery(''); setFilter(''); }}>Xem toàn bộ sự kiện</button></div>}
      </> : <>
        <p className="drawer-intro">Các bài viết là phần diễn giải phục vụ học tập. Đối chiếu nội dung với nguồn được dẫn bên dưới.</p>
        <div className="source-book"><Icon name="book" /><div><h3>{TEXTBOOK.title}</h3><p>{TEXTBOOK.publisher}, {TEXTBOOK.year}.</p><p>Dành cho bậc đại học hệ không chuyên lý luận chính trị.</p></div></div>
        <a className="text-link" href={textbookUrl} target="_blank" rel="noreferrer">Mở giáo trình đầy đủ (PDF · 17,9 MB)<Icon name="external" /></a>
        <section className="source-event"><h3>{event.short}</h3>{event.note && <p className="source-note">{event.note}</p>}
          {event.external ? <><p>Sự kiện này có thông tin bổ sung từ tổ chức liên quan; được phân biệt với phần diễn giải giáo trình.</p><a className="text-link" href={event.external.url} target="_blank" rel="noreferrer">{event.external.title}<Icon name="external" /></a></> : <>
            <p>Giáo trình 2021 · Trang {event.pages.join(', ')}. Các ảnh dưới đây là trang giáo trình, không phải ảnh chụp sự kiện.</p>
            <div className="page-tabs" aria-label="Chọn trang nguồn">{event.pages.map((number) => <button key={number} className={page === number ? 'is-active' : ''} aria-pressed={page === number} onClick={() => setPage(number)}>Trang {number}</button>)}</div>
            {imageFailed ? <p role="status">Không tải được ảnh trang. Bạn có thể mở giáo trình PDF ở trên.</p> : <a href={sourcePage(page)} target="_blank" rel="noreferrer" aria-label={`Mở ảnh lớn trang ${page}`}><img className="source-page" src={sourcePage(page)} alt={`Bản chụp trang ${page}, Giáo trình Lịch sử Đảng Cộng sản Việt Nam, 2021`} width="840" height="1200" onError={() => setImageFailed(true)} /></a>}
          </>}
        </section>
        <section className="source-method"><h3>Phạm vi & cách đọc</h3><p>Nội dung theo phạm vi ấn bản năm 2021. Những mốc sau năm 2021 không nằm trong hành trình này. Các mục tiêu tương lai được trình bày như định hướng, không phải kết quả đã đạt được.</p><p>Hình dạng địa lý là lớp định hướng hiện đại; không tái dựng biên giới hoặc chủ quyền trong quá khứ. Đường nối biểu thị quan hệ được chú thích, không phải hành trình thực địa.</p></section>
      </>}
    </div>
  </dialog>;
}

export default function App() {
  const [event, setEvent] = useState(() => readEventHash(window.location.hash));
  const [drawer, setDrawer] = useState(null);
  const [flat, setFlat] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const [globeFailed, setGlobeFailed] = useState(false);
  const [focusedPlace, setFocusedPlace] = useState(null);
  const [zoom, setZoom] = useState(1.65);
  const [viewRevision, setViewRevision] = useState(0);
  const [sourceThumbFailed, setSourceThumbFailed] = useState(false);
  const [readingRevision, setReadingRevision] = useState(0);
  const narrativeRef = useRef(null);
  const period = PERIODS.find((item) => item.id === event.period);
  const periodIndex = PERIODS.indexOf(period);
  const currentIndex = EVENTS.indexOf(event);
  const onReady = useCallback(() => setGlobeReady(true), []);
  const onError = useCallback(() => { setGlobeFailed(true); setGlobeReady(false); }, []);
  const selectEvent = useCallback((next) => {
    setEvent(next);
    setFocusedPlace(null);
    setSourceThumbFailed(false);
    setZoom(1.65);
    const hash = `#event=${encodeURIComponent(next.id)}`;
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    setReadingRevision((value) => value + 1);
  }, []);
  useEffect(() => {
    const restore = () => {
      setEvent(readEventHash(window.location.hash)); setFocusedPlace(null); setSourceThumbFailed(false); setZoom(1.65); setDrawer(null);
      setReadingRevision((value) => value + 1);
    };
    window.addEventListener('popstate', restore);
    window.addEventListener('hashchange', restore);
    return () => { window.removeEventListener('popstate', restore); window.removeEventListener('hashchange', restore); };
  }, []);
  useEffect(() => { document.title = `${event.short} · Dòng chảy lịch sử`; }, [event]);
  useEffect(() => {
    if (!readingRevision) return;
    const frame = window.requestAnimationFrame(() => {
      if (window.matchMedia('(max-width: 760px)').matches) narrativeRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
      else narrativeRef.current?.scrollTo({ top: 0 });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [readingRevision]);
  const flatVisible = flat || globeFailed || !globeReady;

  return <div className="history-app">
    <a className="skip-link" href="#event-narrative" onClick={(e) => { e.preventDefault(); narrativeRef.current?.focus(); }}>Đến nội dung sự kiện</a>
    <header className="site-header">
      <button className="brand" onClick={() => selectEvent(EVENTS[0])} aria-label="Dòng chảy lịch sử — về đầu hành trình"><span className="brand-mark"><Icon name="book" /></span><span><span className="brand-name">Dòng chảy <em>lịch sử</em></span><span className="brand-subtitle">Đảng Cộng sản Việt Nam · 1911–2021</span></span></button>
      <nav aria-label="Điều hướng chính"><span className="edition-label">Một hành trình qua thời gian & không gian</span><button aria-label="Mục lục" onClick={() => setDrawer('index')}><Icon name="grid" /><span>Mục lục</span></button><button className="sources-button" aria-label="Nguồn tư liệu" onClick={() => setDrawer('sources')}><Icon name="book" /><span>Nguồn tư liệu</span></button></nav>
    </header>
    <main className="workspace">
      <article className="narrative" id="event-narrative" ref={narrativeRef} tabIndex="-1">
        <div className="chapter-reference"><span>{period.chapter}</span><span>{String(periodIndex + 1).padStart(2, '0')} / 06</span></div>
        <div className="event-year" aria-hidden="true">{event.year}<span className="year-rule" /></div>
        <h1>{event.title}</h1>
        <div className="event-meta"><time>{event.date}</time><span>{event.tag}</span></div>
        <p className="event-summary">{event.summary}</p>
        <section className="narrative-section"><h2>Bối cảnh lịch sử</h2><p>{event.context}</p></section>
        <section className="narrative-section"><h2>Ý nghĩa & kết nối</h2><p>{event.significance}</p></section>
        {event.note && <details className="date-note"><summary>Lưu ý khi đọc mốc thời gian</summary><p>{event.note}</p></details>}
        <button className="evidence-preview" onClick={() => setDrawer('sources')}>
          {!event.external && !sourceThumbFailed ? <img src={sourcePage(event.pages[0])} alt="" width="64" height="88" loading="lazy" onError={() => setSourceThumbFailed(true)} /> : <span className="evidence-icon"><Icon name="book" /></span>}
          <span><small>Đối chiếu tư liệu</small><b>{event.external ? event.external.title : `Giáo trình 2021 · tr. ${event.pages[0]}`}</b><span>Đọc nguồn và chú thích</span></span><Icon name="external" />
        </button>
        <details className="review-question"><summary>Cùng suy ngẫm</summary><p>{event.question}</p></details>
        <div className="reading-footer"><span>Biên soạn theo giáo trình 2021</span><span>{String(currentIndex + 1).padStart(2, '0')} / {EVENTS.length}</span></div>
      </article>
      <section className="world-stage" aria-label="Không gian lịch sử">
        <div className="map-heading"><span><span className="location-dot" />Không gian lịch sử</span><button onClick={() => { setFlat((value) => !value); setGlobeReady(false); }} aria-pressed={flat}>{flat ? 'Địa cầu 3D' : 'Bản đồ 2D'}<Icon name="globe" /></button></div>
        <div className="globe-viewport">
          <MapFallback event={event} visible={flatVisible} />
          {!flat && !globeFailed && <Suspense fallback={null}><GlobeStage event={event} focusedPlace={focusedPlace} zoom={zoom} viewRevision={viewRevision} onReady={onReady} onError={onError} onPick={setFocusedPlace} /></Suspense>}
          {!flat && !globeReady && !globeFailed && <p className="map-status" role="status">Đang mở địa cầu… Bản đồ và nội dung đã sẵn sàng.</p>}
          {globeFailed && <div className="map-status" role="status"><span>Địa cầu 3D chưa khả dụng. Bạn vẫn có thể khám phá bằng bản đồ.</span><button onClick={() => { setGlobeFailed(false); setFlat(false); }}>Thử lại</button></div>}
          <div className="globe-controls" aria-label="Điều khiển địa cầu"><button className="icon-button" disabled={flat || globeFailed || zoom <= .8} aria-label="Phóng to địa cầu" onClick={() => setZoom((value) => Math.max(.8, value - .3))}><Icon name="plus" /></button><button className="icon-button" disabled={flat || globeFailed || zoom >= 3.5} aria-label="Thu nhỏ địa cầu" onClick={() => setZoom((value) => Math.min(3.5, value + .3))}><Icon name="minus" /></button><button className="icon-button" disabled={flat || globeFailed} aria-label="Đặt lại góc nhìn" onClick={() => { setFocusedPlace(null); setZoom(1.65); setViewRevision((value) => value + 1); }}><Icon name="reset" /></button></div>
        </div>
        <div className="geographic-context"><div className="location-label"><Icon name="pin" /><span>{event.places.length ? 'Địa danh liên quan' : 'Phạm vi chính sách'}</span></div><div className="place-buttons">{event.places.length ? event.places.map((id) => <button key={id} className={(focusedPlace || event.places[0]) === id ? 'is-active' : ''} onClick={() => setFocusedPlace(id)}><b>{LOCATIONS[id].name}</b><span>{LOCATIONS[id].today}</span></button>) : <p>Việt Nam · Sự kiện được trình bày theo phạm vi cả nước, không gán một địa điểm cụ thể.</p>}</div></div>
        <div className="map-footnote"><span>{flatVisible ? 'Bản đồ định hướng' : 'Kéo để xoay · Cuộn để thu phóng'}</span><span>Địa lý hiện đại · Không tái dựng biên giới lịch sử</span></div>
      </section>
    </main>
    <Timeline event={event} onSelect={selectEvent} />
    <span className="sr-only" role="status" aria-live="polite">{event.year}. {event.short}. {currentIndex + 1} trên {EVENTS.length} sự kiện.</span>
    {drawer && <Drawer key={drawer} kind={drawer} event={event} onClose={() => setDrawer(null)} onSelect={selectEvent} />}
  </div>;
}
