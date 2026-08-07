'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Browser storage as a React external store.
 *
 * `useSyncExternalStore` rather than read-into-state-on-mount: it is SSR-safe
 * (the server snapshot is the empty value, so there is no hydration mismatch),
 * and every hook reading the same key re-renders together — including when a
 * second tab writes it.
 */

type Area = 'local' | 'session';

const EVENT = 'litime-storage';

/** Cache so getSnapshot returns a stable reference for unchanged raw strings. */
const snapshots = new Map<string, { raw: string | null; parsed: unknown }>();

function area(kind: Area): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function readParsed<T>(kind: Area, key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = area(kind)?.getItem(key) ?? null;
  } catch {
    raw = null;
  }

  const cached = snapshots.get(key);
  if (cached && cached.raw === raw) return cached.parsed as T;

  let parsed: T = fallback;
  if (raw) {
    try {
      parsed = JSON.parse(raw) as T;
    } catch {
      parsed = fallback;
    }
  }

  snapshots.set(key, { raw, parsed });
  return parsed;
}

export function useStoredValue<T>(
  kind: Area,
  key: string,
  fallback: T
): [T, (next: T) => void] {
  const getSnapshot = useCallback(() => readParsed(kind, key, fallback), [kind, key, fallback]);
  const getServerSnapshot = useCallback(() => fallback, [fallback]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T) => {
      try {
        area(kind)?.setItem(key, JSON.stringify(next));
      } catch {
        // Storage full or blocked — the in-memory update below still applies.
      }
      // Seed the cache so the very next snapshot reflects the write even if the
      // storage read fails, then wake every subscriber in this tab.
      snapshots.set(key, { raw: JSON.stringify(next), parsed: next });
      window.dispatchEvent(new Event(EVENT));
    },
    [kind, key]
  );

  return [value, setValue];
}
