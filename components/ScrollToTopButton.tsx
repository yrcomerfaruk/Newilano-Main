'use client';

import { useEffect, useState } from 'react';
import styles from './ScrollToTopButton.module.css';
import { UpArrowIcon } from './icons';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${isVisible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label="Yukarı çık"
      title="Yukarı çık"
    >
      <UpArrowIcon width={20} height={20} />
    </button>
  );
}
