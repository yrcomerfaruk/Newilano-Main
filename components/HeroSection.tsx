'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './HeroSection.module.css';
import type { HeroSlide } from '@/lib/data';

type Props = {
  slides: HeroSlide[];
};

export function HeroSection({ slides }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const deltaXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasSlides = slides.length > 0;
  const activeSlide = hasSlides ? slides[activeIndex % slides.length] : null;
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSlides || isDragging) {
      return undefined;
    }

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [hasSlides, slides.length, isDragging]);

  // Handle viewport width changes
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResize);
      setViewportWidth(window.innerWidth);
      return () => window.removeEventListener('resize', onResize);
    }
  }, []);

  // Pick image variant by viewport
  useEffect(() => {
    if (!activeSlide) {
      setCurrentSrc(null);
      return;
    }
    const isMobile = viewportWidth <= 768;
    const isTablet = viewportWidth > 768 && viewportWidth <= 1024;

    let src: string | undefined;
    if (isMobile) src = activeSlide.mobileImage || activeSlide.image;
    else if (isTablet) src = activeSlide.tabletImage || activeSlide.mobileImage || activeSlide.image;
    else src = activeSlide.desktopImage || activeSlide.tabletImage || activeSlide.image;
    setCurrentSrc(src ?? activeSlide.image);
  }, [activeSlide, viewportWidth]);

  const goNext = () => setActiveIndex((prev) => (prev + 1) % slides.length);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const onStart = (clientX: number) => {
    setIsDragging(true);
    startXRef.current = clientX;
    deltaXRef.current = 0;
  };

  const onMove = (clientX: number) => {
    if (!isDragging) return;
    deltaXRef.current = clientX - startXRef.current;
  };

  const onEnd = () => {
    if (!isDragging) return;
    const threshold = 50; // px
    const dx = deltaXRef.current;
    setIsDragging(false);
    startXRef.current = 0;
    deltaXRef.current = 0;
    if (Math.abs(dx) > threshold) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  if (!activeSlide) {
    return null;
  }

  return (
    <section className={styles.hero}>
      <div
        className={styles.slideContainer}
        ref={containerRef}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={(e) => onStart(e.touches[0]?.clientX ?? 0)}
        onTouchMove={(e) => onMove(e.touches[0]?.clientX ?? 0)}
        onTouchEnd={onEnd}
      >
        <div className={styles.media}>
          <Image
            src={currentSrc ?? activeSlide.image}
            alt={activeSlide.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
            unoptimized={(currentSrc ?? activeSlide.image).startsWith('data:image/')}
            draggable={false}
          />
        </div>
        <div className={styles.dots}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={index === activeIndex ? styles.dotActive : styles.dot}
              aria-label={`${slide.title} görseline geç`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <div className="container">
          <div className={styles.textBox}>
            <div>
              <h1>{activeSlide.title}</h1>
              <p>{activeSlide.subtitle}</p>
            </div>
            <Link href={activeSlide.ctaHref} className={styles.cta}>
              {activeSlide.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
