import React from 'react';
import { TEXTBOOK } from './history.js';

function pageUrl(src) {
  return `${import.meta.env.BASE_URL}${src}`;
}

// The image is the evidence. Attribution and the full-source link live once in the
// reading panel, so this surface deliberately carries no repeated labels or actions.
export default function EvidenceCard({ evidence, variant = 'dock' }) {
  if (!evidence || evidence.kind !== 'page') return null;

  return <figure className={`evidence-card evidence-card--${variant}`}>
    <div className="evidence-card__frame">
      <img src={pageUrl(evidence.src)} alt={`Bản sao trang ${evidence.page || ''} của ${TEXTBOOK.title}`} decoding="async" />
    </div>
  </figure>;
}
