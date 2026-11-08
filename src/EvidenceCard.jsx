import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getImageAspect, getImageDimensions } from './imageMetadata.js';

function pageUrl(src) {
  return `${import.meta.env.BASE_URL}${src}`;
}

export default function EvidenceCard({ evidence, eventId, narrationState = 'idle', audioRef, featurePlaying = false, variant = 'dock' }) {
  const photos = evidence?.illustration?.photos?.length
    ? evidence.illustration.photos
    : evidence?.illustration?.src
      ? [{ src: evidence.illustration.src, caption: evidence.illustration.caption, sourceTitle: evidence.illustration.title }]
      : evidence?.src ? [{ src: evidence.src, caption: evidence.title }] : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState('next');
  const [manualPaused, setManualPaused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const lightboxRef = useRef(null);
  const closeButtonRef = useRef(null);
  const imageButtonRef = useRef(null);
  const currentPhoto = photos[currentIndex] || photos[0];

  useEffect(() => {
    setCurrentIndex(0);
    setDirection('next');
    setManualPaused(false);
    setLightboxOpen(false);
    setImageFailed(false);
  }, [eventId]);

  useEffect(() => {
    setImageFailed(false);
  }, [currentPhoto?.src]);

  useEffect(() => {
    if (photos.length < 2 || manualPaused || lightboxOpen) return undefined;

    if (narrationState === 'playing') {
      const syncToNarration = () => {
        const audio = audioRef?.current;
        if (document.hidden || !audio || audio.paused || audio.ended || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
        const nextIndex = Math.min(photos.length - 1, Math.floor((audio.currentTime / (audio.duration * .9)) * photos.length));
        setCurrentIndex((index) => {
          if (nextIndex <= index) return index;
          setDirection('next');
          return nextIndex;
        });
      };
      syncToNarration();
      const timer = window.setInterval(syncToNarration, 120);
      return () => window.clearInterval(timer);
    }

    if (narrationState !== 'idle') return undefined;
    const timer = window.setInterval(() => {
      setDirection('next');
      setCurrentIndex((index) => (index + 1) % photos.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [audioRef, eventId, lightboxOpen, manualPaused, narrationState, photos.length]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    closeButtonRef.current?.focus();
    const onKeyDown = (event) => {
      const dialog = lightboxRef.current;
      if (!dialog) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setLightboxOpen(false);
        requestAnimationFrame(() => imageButtonRef.current?.focus());
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        event.stopPropagation();
        setManualPaused(true);
        const delta = event.key === 'ArrowRight' ? 1 : -1;
        setDirection(delta > 0 ? 'next' : 'prev');
        setCurrentIndex((index) => (index + delta + photos.length) % photos.length);
      } else if (event.key === 'Tab') {
        const focusable = [...dialog.querySelectorAll('button:not(:disabled), a[href]')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [lightboxOpen, photos.length]);

  if (!currentPhoto) return null;

  const movePhoto = (delta) => {
    setManualPaused(true);
    setDirection(delta > 0 ? 'next' : 'prev');
    setCurrentIndex((index) => (index + delta + photos.length) % photos.length);
  };
  const openLightbox = (event) => {
    setManualPaused(true);
    imageButtonRef.current = event.currentTarget;
    setLightboxOpen(true);
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
    requestAnimationFrame(() => imageButtonRef.current?.focus());
  };
  const photoCaption = currentPhoto.caption?.trim() || `Ảnh tư liệu ${currentIndex + 1}`;
  const imageAlt = photoCaption;
  const photoDimensions = getImageDimensions(currentPhoto?.src);
  const photoAspect = photoDimensions?.aspect || getImageAspect(currentPhoto?.src, 1.33);

  return <figure className={`evidence-card evidence-card--${variant}${featurePlaying && variant === 'presentation' ? ' evidence-card--milestone-hold' : ''}`} style={{ '--photo-aspect': photoAspect }}>
    <div className="evidence-card__frame">
      {imageFailed
        ? <div className="evidence-card__missing" role="img" aria-label={imageAlt}>Không tải được ảnh này</div>
        : <button
          ref={imageButtonRef}
          className="evidence-card__image-button"
          type="button"
          aria-label={`Mở ảnh lớn: ${imageAlt}`}
          title="Mở ảnh lớn"
          onClick={openLightbox}
        >
          <img
            key={`${eventId || ''}:${currentIndex}`}
            className={`evidence-card__image evidence-card__image--${direction}`}
            src={pageUrl(currentPhoto.src)}
            alt={imageAlt}
            width={photoDimensions?.width}
            height={photoDimensions?.height}
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        </button>}
    </div>
    <figcaption className="evidence-card__caption" lang="vi">
      <span>{photoCaption}</span>
      <span aria-live="polite">{currentIndex + 1} / {photos.length}</span>
    </figcaption>
    <div className="evidence-card__controls" aria-label="Điều khiển ảnh">
      <button type="button" aria-label="Ảnh trước" title="Ảnh trước" onClick={() => movePhoto(-1)}>‹</button>
      {manualPaused && <button
        className="evidence-card__resume"
        type="button"
        aria-label="Tiếp tục trình chiếu ảnh"
        onClick={() => setManualPaused(false)}
      ><span aria-hidden="true">▶</span></button>}
      <button type="button" aria-label="Ảnh tiếp theo" title="Ảnh tiếp theo" onClick={() => movePhoto(1)}>›</button>
    </div>

    {lightboxOpen && createPortal(<div
      ref={lightboxRef}
      className="evidence-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Ảnh tư liệu ${currentIndex + 1} trên ${photos.length}`}
      onMouseDown={(event) => { if (event.target === event.currentTarget) closeLightbox(); }}
    >
      <button ref={closeButtonRef} className="evidence-lightbox__close" type="button" aria-label="Đóng ảnh lớn" onClick={closeLightbox}>×</button>
      {photos.length > 1 && <>
        <button className="evidence-lightbox__arrow evidence-lightbox__arrow--prev" type="button" aria-label="Ảnh trước" onClick={() => movePhoto(-1)}>‹</button>
        <button className="evidence-lightbox__arrow evidence-lightbox__arrow--next" type="button" aria-label="Ảnh tiếp theo" onClick={() => movePhoto(1)}>›</button>
      </>}
      <div className="evidence-lightbox__content">
        {imageFailed
          ? <div className="evidence-card__missing" role="img" aria-label={imageAlt}>Không tải được ảnh này</div>
          : <img
            key={`lightbox:${eventId || ''}:${currentIndex}`}
            className={`evidence-lightbox__image evidence-card__image--${direction}`}
            src={pageUrl(currentPhoto.src)}
            alt={imageAlt}
            width={photoDimensions?.width}
            height={photoDimensions?.height}
            decoding="async"
            onError={() => setImageFailed(true)}
          />}
        <p className="evidence-lightbox__caption" lang="vi">{photoCaption}</p>
        <p className="evidence-lightbox__count">{currentIndex + 1} / {photos.length}</p>
        {currentPhoto.sourcePage && <a className="evidence-lightbox__source" href={currentPhoto.sourcePage} target="_blank" rel="noreferrer" aria-label="Mở trang nguồn cho ảnh này">
          Xem trang nguồn
        </a>}
      </div>
    </div>, document.body)}
  </figure>;
}
