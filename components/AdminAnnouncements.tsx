'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './AdminAnnouncements.module.css';

type Item = { id: string; message: string; active: boolean; order: number };

export function AdminAnnouncements() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const sorted = useMemo(() => items.slice().sort((a, b) => a.order - b.order || a.message.localeCompare(b.message)), [items]);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/announcements', { cache: 'no-store' })
      .then((r) => r.json())
      .then((payload) => {
        const list: Item[] = Array.isArray(payload.announcements) ? payload.announcements : [];
        setItems(list);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { message: message.trim(), active };
    if (!body.message) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setMessage('');
        setActive(true);
        load();
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/admin/announcements/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !current })
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Duyuru silinsin mi?')) return;
    await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    load();
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = sorted.findIndex((x) => x.id === id);
    if (idx < 0) return;
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[targetIdx];
    // swap order numbers
    await Promise.all([
      fetch(`/api/admin/announcements/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: b.order }) }),
      fetch(`/api/admin/announcements/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: a.order }) })
    ]);
    load();
  };

  return (
    <section className={styles.section}>
      <h2>Duyurular</h2>
      <form onSubmit={create} className={styles.form}>
        <label className={styles.label}>
          <span>Mesaj</span>
          <input className={styles.input} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Duyuru metni"/>
        </label>
        <label className={styles.row}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          <span>Aktif</span>
        </label>
        <button className={styles.button} type="submit" disabled={saving || !message.trim()}>Ekle</button>
      </form>

      <div>
        {loading ? (
          <p>Yükleniyor…</p>
        ) : sorted.length === 0 ? (
          <p>Henüz duyuru yok.</p>
        ) : (
          <ul className={styles.list}>
            {sorted.map((it, i) => (
              <li key={it.id} className={styles.item}>
                <div>
                  <div className={styles.itemHead}>
                    <span className={styles.order}>#{it.order}</span>
                    <span style={{ color: it.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{it.message}</span>
                  </div>
                  <div className={styles.actions}>
                    <button className={styles.secondaryBtn} type="button" onClick={() => toggleActive(it.id, it.active)}>{it.active ? 'Pasifleştir' : 'Aktifleştir'}</button>
                    <button className={styles.secondaryBtn} type="button" onClick={() => remove(it.id)}>Sil</button>
                  </div>
                </div>
                <div className={styles.dragBtns}>
                  <button className={styles.secondaryBtn} type="button" onClick={() => move(it.id, -1)} disabled={i === 0}>Yukarı</button>
                  <button className={styles.secondaryBtn} type="button" onClick={() => move(it.id, 1)} disabled={i === sorted.length - 1}>Aşağı</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
