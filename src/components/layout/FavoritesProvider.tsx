'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useStoredValue } from '@/lib/useStoredValue';

const MAX_RECENTS = 8;

/** Module-level so the stored-value hook keeps a stable snapshot identity. */
const EMPTY: string[] = [];

interface FavoritesContextValue {
  favorites: string[];
  recents: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  noteRecent: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: EMPTY,
  recents: EMPTY,
  isFavorite: () => false,
  toggleFavorite: () => {},
  noteRecent: () => {},
});

export function useFavorites() {
  return useContext(FavoritesContext);
}

/**
 * Pinned entries and recently opened ones, kept per signed-in agent so a shared
 * workstation doesn't mix them up.
 */
export default function FavoritesProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userKey = session?.user?.id ?? 'anon';

  const [favorites, setFavorites] = useStoredValue<string[]>(
    'local',
    `litime-favorites:${userKey}`,
    EMPTY
  );
  const [recents, setRecents] = useStoredValue<string[]>(
    'local',
    `litime-recents:${userKey}`,
    EMPTY
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites(
        favorites.includes(id) ? favorites.filter((f) => f !== id) : [id, ...favorites]
      );
    },
    [favorites, setFavorites]
  );

  const noteRecent = useCallback(
    (id: string) => {
      if (recents[0] === id) return;
      setRecents([id, ...recents.filter((r) => r !== id)].slice(0, MAX_RECENTS));
    },
    [recents, setRecents]
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      recents,
      isFavorite: (id: string) => favorites.includes(id),
      toggleFavorite,
      noteRecent,
    }),
    [favorites, recents, toggleFavorite, noteRecent]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
