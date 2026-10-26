import React, { useEffect, useState } from 'react';
import { TEXTBOOK } from './history.js';

function pageUrl(src) {
  return `${import.meta.env.BASE_URL}${src}`;
}

// The evidence surface: a cited textbook reproduction with its page number and a way
// to open the full source. Pages are scans without a text layer, so the card marks the
// page rather than inventing an excerpt. External records get the same treatment as a
// clearly different kind of source.
export default function EvidenceCard({ event, evidence, fullPageUrl, variant = 'dock' }) {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => { setZoomed(false); }, [evidence?.src, evidence?.url]);

  if (!evidence) return null;
  const isPage = evidence.kind === 'page';

  return <figure className={`evidence-card evidence-card--${variant}`}>
    <div className="evidence-card__head">
      <span className="evidence-card__kind">{isPage ? 'Bản sao trang giáo trình' : 'Nguồn tư liệu ngoài'}</span>
      {isPage && <span className="evidence-card__page">{evidence.page ? `tr. ${evidence.page}` : 'trang nguồn'}</span>}
    </div>
    {isPage && <div className={`evidence-card__frame${zoomed ? ' is-zoomed' : ''}`}>
      <img src={pageUrl(evidence.src)} alt={`Bản sao trang ${evidence.page || ''} của ${TEXTBOOK.title}`} decoding="async" />
    </div>}
    <figcaption className="evidence-card__meta">
      <p className="evidence-card__source">{event?.short}</p>
      <p className="evidence-card__reference">
        {isPage
          ? `${TEXTBOOK.title}, ${TEXTBOOK.year}`
          : evidence.title}
      </p>
      {isPage && <p className="evidence-card__note">Bản quét · chưa có lớp chữ để trích đoạn</p>}
      <div className="evidence-card__actions">
        {isPage && <button
          type="button"
          className="evidence-card__action"
          aria-pressed={zoomed}
          onClick={() => setZoomed((value) => !value)}
        >{zoomed ? 'Thu nhỏ' : 'Phóng to'}</button>}
        <a className="evidence-card__action evidence-card__action--link" href={fullPageUrl} target="_blank" rel="noreferrer">
          {isPage ? 'Mở trang đầy đủ' : 'Mở nguồn'} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </figcaption>
  </figure>;
}
