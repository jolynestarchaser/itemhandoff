'use client';

import { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

export function useUrlState<T extends string>(key: string, defaultValue: T): [T, (value: T) => void] {
  const searchParams = useSearchParams();
  const value = (searchParams.get(key) as T | null) ?? defaultValue;

  const setValue = useCallback((next: T) => {
    const params = new URLSearchParams(window.location.search);
    if (next === defaultValue || next === '') {
      params.delete(key);
    } else {
      params.set(key, next);
    }
    const query = params.toString();
    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
  }, [key, defaultValue]);

  return [value, setValue];
}
