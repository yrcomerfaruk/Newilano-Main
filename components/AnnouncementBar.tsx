 'use client';
import { useEffect, useState } from 'react';
import styles from './AnnouncementBar.module.css';

type Announcement = { id: string; message: string };

export function AnnouncementBar() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/announcements', { cache: 'no-store' })
      .then((r) => r.json())
      .then((payload) => {
        if (cancelled) return;
        const list = Array.isArray(payload.announcements) ? payload.announcements : [];
        setItems(list);
        setIndex(0);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 5000);
    return () => window.clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className={styles.bar} role="status" aria-live="polite">
      <span>{items[index]?.message}</span>
    </div>
  );
}
