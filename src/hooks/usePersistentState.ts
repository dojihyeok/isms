import { useEffect, useState } from 'react';

function readStoredValue<T>(key: string, fallback: T, sanitize?: (value: T) => T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return sanitize ? sanitize(fallback) : fallback;
    const parsed = JSON.parse(stored) as T;
    return sanitize ? sanitize(parsed) : parsed;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

export function usePersistentState<T>(key: string, fallback: T, sanitize?: (value: T) => T) {
  const [value, setValue] = useState<T>(() => readStoredValue(key, fallback, sanitize));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 저장 공간 부족 또는 브라우저 정책 제한 시 현재 세션 상태는 유지한다.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
