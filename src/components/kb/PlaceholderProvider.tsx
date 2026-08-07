'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useStoredValue } from '@/lib/useStoredValue';

const STORAGE_KEY = 'litime-placeholder-values';

/** Module-level so the stored-value hook keeps a stable snapshot identity. */
const EMPTY: Record<string, string> = {};

interface PlaceholderContextValue {
  values: Record<string, string>;
  setValue: (key: string, value: string) => void;
  clearAll: () => void;
  hasAny: boolean;
}

const PlaceholderContext = createContext<PlaceholderContextValue>({
  values: EMPTY,
  setValue: () => {},
  clearAll: () => {},
  hasAny: false,
});

export function usePlaceholderValues() {
  return useContext(PlaceholderContext);
}

/**
 * Fill-in values for reply templates, shared across every template on the page.
 *
 * An agent is working one ticket at a time, so the customer name typed into a
 * returns template should already be filled in on the refund template they
 * reach for next. Held in sessionStorage rather than localStorage: it contains
 * customer details and should not outlive the browser session.
 */
export default function PlaceholderProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useStoredValue<Record<string, string>>(
    'session',
    STORAGE_KEY,
    EMPTY
  );

  const setValue = useCallback(
    (key: string, value: string) => {
      setValues({ ...values, [key]: value });
    },
    [values, setValues]
  );

  const clearAll = useCallback(() => setValues({}), [setValues]);

  const value = useMemo<PlaceholderContextValue>(
    () => ({
      values,
      setValue,
      clearAll,
      hasAny: Object.values(values).some((v) => v.trim()),
    }),
    [values, setValue, clearAll]
  );

  return <PlaceholderContext.Provider value={value}>{children}</PlaceholderContext.Provider>;
}
