import React from 'react';
import { TEXTBOOK } from './history.js';

function pageUrl(src) {
  return `${import.meta.env.BASE_URL}${src}`;
}

// The image is the evidence. Attribution and the full-source link live once in the
// reading panel, so this surface deliberately carries no repeated labels or actions.
export default function EvidenceCard({ evidence, variant = 'dock' }) {
  if (!evidence || evidence.kind !== 'page') return null;

  const illustration = evidence.illustration;
  const initialSrc = illustration?.src ? pageUrl(illustration.src) : pageUrl(evidence.src);
  const candidates = (illustration?.candidates || []).map((c) => pageUrl(c));
  const fallbackSrc = pageUrl(evidence.src);
  const altText = illustration?.title || illustration?.caption || `Bản sao trang ${evidence.page || ''} của ${TEXTBOOK.title}`;

  return <figure className={`evidence-card evidence-card--${variant}`}>
    <div className="evidence-card__frame">
      <img
        src={initialSrc}
        alt={altText}
        title={illustration?.title || undefined}
        decoding="async"
        onError={(e) => {
          const img = e.currentTarget;
          const currentIndex = parseInt(img.dataset.candidateIndex || '0', 10);
          const nextIndex = currentIndex + 1;

          if (candidates.length && nextIndex < candidates.length) {
            img.dataset.candidateIndex = String(nextIndex);
            img.src = candidates[nextIndex];
          } else if (fallbackSrc && img.dataset.fallbackTried !== 'true') {
            img.dataset.fallbackTried = 'true';
            img.src = fallbackSrc;
          }
        }}
      />
    </div>
  </figure>;
}
