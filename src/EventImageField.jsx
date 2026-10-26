import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { prefersReducedMotion } from './motion.js';

const MAX_DESKTOP_ITEMS = 24;
const MAX_MOBILE_ITEMS = 10;
const PROMOTION_DURATION = 820;
const IMAGE_ASPECTS = [0.78, 1.12, 0.92, 1.36, 0.86, 1.18, 0.72, 1.24];
function photoUrl(photo) {
  return photo?.src ? `${import.meta.env.BASE_URL}${photo.src}` : '';
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function buildPool(list) {
  const seen = new Set();
  const items = [];
  list.forEach((event) => {
    (event.photos || []).forEach((photo, photoIndex) => {
      const eventImageKey = `${event.id}::${photo?.src}`;
      if (!photo?.src || seen.has(eventImageKey)) return;
      seen.add(eventImageKey);
      items.push({
        id: `${event.id}::${photo.src}`,
        eventId: event.id,
        src: photoUrl(photo),
        title: photo.title || event.short,
        label: event.short,
        aspect: IMAGE_ASPECTS[(items.length + photoIndex) % IMAGE_ASPECTS.length],
      });
    });
  });
  return items;
}

function selectedItemFor(pool, selected) {
  return selected ? pool.find((item) => item.eventId === selected.id) || null : null;
}

function cardStyle(index, item) {
  const wave = Math.sin(index * 1.21);
  const alternate = index % 2 ? 1 : -1;
  return {
    '--image-y': `${wave * 7.5 + alternate * 2.5}vh`,
    '--image-z': `${32 + Math.cos(index * 0.83) * 44}px`,
    '--image-rotate-y': `${clamp(wave * -14, -18, 18)}deg`,
    '--image-rotate-z': `${clamp(wave * -4.5 + alternate * 1.5, -7, 7)}deg`,
    '--image-scale': clamp(0.9 + Math.cos(index * 0.83) * 0.08, 0.82, 0.99),
    '--image-opacity': clamp(0.62 + Math.cos(index * 0.83) * 0.17, 0.48, 0.82),
    aspectRatio: item.aspect,
  };
}

function targetCenter(aspect = 1) {
  const mobile = window.innerWidth <= 760;
  const panelWidth = mobile ? 0 : Math.min(420, window.innerWidth * 0.92);
  const globeDiameter = Math.min(window.innerHeight * 0.92, window.innerWidth * (mobile ? 0.92 : 0.72));
  const focusHeight = globeDiameter * 0.7;
  const availableWidth = mobile ? window.innerWidth - 36 : window.innerWidth - panelWidth - 72;
  const panelClearWidth = window.innerWidth - (panelWidth + 18) * 2;
  const limits = [focusHeight * aspect, availableWidth, mobile ? window.innerWidth * 0.78 : 620];
  if (panelClearWidth >= 300) limits.push(panelClearWidth);
  const width = Math.min(...limits);
  const height = width / aspect;
  const preferredX = window.innerWidth * 0.5;
  const captionTop = window.innerHeight - (mobile ? 235 : 245);
  const preferredY = captionTop - height / 2 - (mobile ? 16 : 24);
  return {
    x: clamp(preferredX, width / 2 + 18, window.innerWidth - width / 2 - 18),
    y: clamp(preferredY, height / 2 + 16, window.innerHeight - height / 2 - 160),
    width,
  };
}

function sourceCard(ribbon, itemId) {
  if (!ribbon || !itemId) return null;
  const nodes = [...ribbon.querySelectorAll('[data-image-id]')].filter((node) => node.dataset.imageId === itemId);
  const visible = nodes.filter((node) => {
    const rect = node.getBoundingClientRect();
    return rect.right > 0 && rect.left < window.innerWidth && rect.bottom > 0 && rect.top < window.innerHeight;
  });
  const candidates = visible.length ? visible : nodes;
  return candidates.sort((a, b) => {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    return Math.abs(aRect.left + aRect.width / 2 - window.innerWidth / 2)
      - Math.abs(bRect.left + bRect.width / 2 - window.innerWidth / 2);
  })[0] || null;
}

export default function EventImageField({ list, selected, focusRevision, focusReadyRevision, promotionCancelled, onPromotionComplete }) {
  const pool = useMemo(() => buildPool(list), [list]);
  const activeItem = selectedItemFor(pool, selected);
  const activeItemId = activeItem?.id || null;
  const ribbonRef = useRef(null);
  const focusRef = useRef(null);
  const animationRef = useRef(null);
  const sequenceRef = useRef(0);
  const [focusImage, setFocusImage] = useState(null);
  const [phase, setPhase] = useState(selected ? 'focused' : 'idle');

  const maxItems = typeof window !== 'undefined' && window.innerWidth <= 760 ? MAX_MOBILE_ITEMS : MAX_DESKTOP_ITEMS;
  const renderItems = pool.slice(0, maxItems);

  useLayoutEffect(() => {
    animationRef.current?.cancel?.();
    sequenceRef.current += 1;
    setFocusImage(null);
    setPhase(activeItem ? 'waiting' : 'idle');
  }, [activeItemId, focusRevision]);

  // A skipped transition must not start or finish its flight over the open panel.
  useEffect(() => {
    if (!promotionCancelled) return;
    sequenceRef.current += 1;
    animationRef.current?.cancel?.();
    animationRef.current = null;
    setFocusImage(null);
    setPhase('idle');
  }, [promotionCancelled]);

  useLayoutEffect(() => {
    if (!activeItem || promotionCancelled || focusReadyRevision !== focusRevision || focusRevision <= 0) return;
    const source = sourceCard(ribbonRef.current, activeItem.id);
    const sourceRect = source?.getBoundingClientRect();
    const target = targetCenter(activeItem.aspect);
    const safeRect = sourceRect?.width > 0 ? {
      x: sourceRect.x,
      y: sourceRect.y,
      width: sourceRect.width,
      height: sourceRect.height,
    } : {
      x: -target.width * 0.4,
      y: target.y - target.width * 0.3,
      width: target.width * 0.44,
      height: target.width * 0.44 / activeItem.aspect,
    };
    setFocusImage({ item: activeItem, sourceRect: safeRect, target, sequence: sequenceRef.current });
    setPhase('promoting');
  }, [activeItem, focusReadyRevision, focusRevision, promotionCancelled]);

  useLayoutEffect(() => {
    if (!focusImage || !focusRef.current || phase !== 'promoting') return undefined;
    const sequence = focusImage.sequence;
    const reducedMotion = prefersReducedMotion();
    const { sourceRect, target } = focusImage;
    const targetScale = target.width / sourceRect.width;
    const deltaX = target.x - (sourceRect.x + sourceRect.width / 2);
    const deltaY = target.y - (sourceRect.y + sourceRect.height / 2);
    const finalTransform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotate(0deg) scale(${targetScale})`;
    const finish = () => {
      if (sequenceRef.current !== sequence) return;
      if (focusRef.current) {
        focusRef.current.style.transform = finalTransform;
        focusRef.current.style.opacity = '1';
        focusRef.current.style.filter = 'grayscale(0) contrast(1.04) brightness(1)';
        focusRef.current.style.clipPath = 'inset(0 0 0 0)';
      }
      animationRef.current = null;
      setPhase('focused');
      onPromotionComplete?.(focusRevision);
    };

    if (reducedMotion) {
      focusRef.current.style.transform = finalTransform;
      focusRef.current.style.opacity = '1';
      finish();
      return undefined;
    }

    const animation = focusRef.current.animate([
      { transform: 'translate3d(0,0,0) rotate(-3deg) scale(1)', opacity: 0.18, filter: 'grayscale(.7) contrast(.92) brightness(.7)', clipPath: 'inset(5% 7% 5% 7%)' },
      { transform: `translate3d(${deltaX * 0.54}px, ${deltaY * 0.3 - 54}px, 0) rotate(-1deg) scale(${targetScale * 0.76})`, opacity: 0.9, filter: 'grayscale(.18) contrast(1) brightness(.88)', clipPath: 'inset(1% 2% 1% 2%)', offset: 0.56 },
      { transform: finalTransform, opacity: 1, filter: 'grayscale(0) contrast(1.04) brightness(1)', clipPath: 'inset(0 0 0 0)' },
    ], { duration: PROMOTION_DURATION, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
    animationRef.current = animation;
    animation.onfinish = finish;
    animation.oncancel = () => {};
    return () => animation.cancel();
  }, [focusImage, focusRevision, onPromotionComplete, phase]);

  const focusStyle = focusImage ? {
    left: `${focusImage.sourceRect.x}px`,
    top: `${focusImage.sourceRect.y}px`,
    width: `${focusImage.sourceRect.width}px`,
    height: `${focusImage.sourceRect.height}px`,
    aspectRatio: focusImage.item.aspect,
  } : undefined;

  const sequence = (copy) => <div className="image-field__sequence" aria-hidden="true" key={copy}>
    {renderItems.map((item, index) => <figure
      className={`image-field__card${item.id === activeItemId ? ' image-field__card--selected' : ''}`}
      data-image-id={item.id}
      key={`${copy}-${item.id}`}
      style={cardStyle(index, item)}
    >
      <img src={item.src} alt="" draggable="false" loading={copy === 'a' && index < 4 ? 'eager' : 'lazy'} decoding="async" />
    </figure>)}
  </div>;

  return <>

    <div className="image-field__ribbon image-field__ribbon--arc" ref={ribbonRef} aria-hidden="true">
      <div className="image-field__belt">{sequence('a')}{sequence('b')}</div>
    </div>

    {focusImage && <div className={`image-field__veil image-field__veil--${phase}`} aria-hidden="true" />}
    {focusImage && <div className={`image-field__focus image-field__focus--${phase}`} aria-hidden="true">
      <figure className="image-field__focus-card" ref={focusRef} style={focusStyle}>
        <img src={focusImage.item.src} alt="" draggable="false" decoding="async" />
        <figcaption>{focusImage.item.label}</figcaption>
      </figure>
    </div>}
  </>;
}
