'use client';

import { useRouter } from 'next/navigation';

export function GoBackButton() {
  const router = useRouter();

  const handleClick = () => {
    router.back();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Geri dön"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.3rem 0.75rem',
        borderRadius: '999px',
        background: '#fff',
        border: '1px solid rgba(17,17,17,0.18)',
        color: '#111',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 600
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Geri
    </button>
  );
}
