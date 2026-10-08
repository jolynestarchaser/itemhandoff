'use client';

import { useSyncExternalStore } from 'react';
import Icon from '@/components/Icon';

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

const getTheme = () => document.documentElement.dataset.theme || 'light';

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light');
  const next = theme === 'dark' ? 'light' : 'dark';

  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // โหมด private: จำธีมไม่ได้ แต่ยังสลับได้
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={next === 'dark' ? 'เปลี่ยนเป็นธีมมืด' : 'เปลี่ยนเป็นธีมสว่าง'}
      className="w-11 h-11 rounded-xl inline-flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
    >
      <Icon name={next === 'dark' ? 'moon' : 'sun'} size={18} />
    </button>
  );
}
