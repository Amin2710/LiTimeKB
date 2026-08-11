'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getIndex, searchIndex, tabLabel, type IndexEntry } from '@/lib/entries';
import { logSearchMiss } from '@/lib/actions';
import { useFavorites } from '@/components/layout/FavoritesProvider';
import { useStoredValue } from '@/lib/useStoredValue';

/** Routes where there is nothing to search yet. */
const HIDDEN_ON = ['/', '/change-password'];

const MAX_RECENT_SEARCHES = 6;

export function entryHref(entry: Pick<IndexEntry, 'tab' | 'id'>): string {
  return `/dashboard?tab=${entry.tab}&e=${encodeURIComponent(entry.id)}`;
}

const PaletteContext = createContext<{ openPalette: () => void }>({ openPalette: () => {} });

/** Lets the navbar offer a clickable way in alongside the shortcut. */
export function useCommandPalette() {
  return useContext(PaletteContext);
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openPalette = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ openPalette }), [openPalette]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      <CommandPalette open={open} setOpen={setOpen} />
    </PaletteContext.Provider>
  );
}

interface CommandPaletteProps {
  open: boolean;
  setOpen: (updater: (prev: boolean) => boolean) => void;
}

/**
 * Cross-tab search, opened with Cmd/Ctrl+K.
 *
 * Searching used to be scoped to whichever tab the agent happened to be on, so
 * finding out whether "swollen battery" was a KB entry, a troubleshooting step
 * or an email template meant checking all three by hand.
 */
function CommandPalette({ open, setOpen }: CommandPaletteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { favorites, noteRecent } = useFavorites();
  const userKey = session?.user?.id ?? 'anon';
  const [recentSearches, setRecentSearches] = useStoredValue<string[]>(
    'local',
    `litime-recent-searches:${userKey}`,
    []
  );

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const hidden = HIDDEN_ON.includes(pathname);

  // When nothing is typed, offer the agent's pinned entries as a starting point.
  const results = useMemo(() => {
    if (query.trim()) return searchIndex(query).map((h) => h.entry);
    if (!favorites.length) return [];
    const index = getIndex();
    return favorites
      .map((id) => index.find((e) => e.id === id))
      .filter((e): e is IndexEntry => Boolean(e))
      .slice(0, 8);
  }, [query, favorites]);

  const close = useCallback(() => {
    setOpen(() => false);
    setQuery('');
    setActive(0);
  }, [setOpen]);

  const noteSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      setRecentSearches(
        [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(
          0,
          MAX_RECENT_SEARCHES
        )
      );
    },
    [recentSearches, setRecentSearches]
  );

  const go = useCallback(
    (entry: IndexEntry) => {
      noteRecent(entry.id);
      if (query.trim()) noteSearch(query);
      router.push(entryHref(entry));
      close();
    },
    [router, noteRecent, noteSearch, query, close]
  );

  // Global open shortcut. Deliberately also fires while an input has focus.
  useEffect(() => {
    if (hidden) return;
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hidden, setOpen]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Reset the highlight when the query changes, adjusting during render rather
  // than in an effect so there is no intermediate frame on the stale row.
  const [lastQuery, setLastQuery] = useState(query);
  if (query !== lastQuery) {
    setLastQuery(query);
    setActive(0);
  }

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    const node = listRef.current?.children[active] as HTMLElement | undefined;
    node?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  // Record searches that found nothing, so gaps in the KB become visible.
  useEffect(() => {
    if (!open || !query.trim() || results.length > 0) return;
    const timer = setTimeout(() => {
      void logSearchMiss(query, 'palette');
    }, 1200);
    return () => clearTimeout(timer);
  }, [open, query, results.length]);

  if (hidden || !open) return null;

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((prev) => (results.length ? (prev + 1) % results.length : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((prev) => (results.length ? (prev - 1 + results.length) % results.length : 0));
      return;
    }
    if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the knowledge base"
        className="w-full max-w-xl bg-card border border-border rounded-xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 border-b border-border">
          <svg
            className="w-4 h-4 text-muted-foreground shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search everything — templates, policies, error codes, SKUs…"
            aria-label="Search query"
            aria-controls="palette-results"
            aria-activedescendant={results[active] ? `palette-opt-${results[active].id}` : undefined}
            className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
            Esc
          </kbd>
        </div>

        {!query.trim() && recentSearches.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap px-3 py-2 border-b border-border">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
              Recent
            </span>
            {recentSearches.map((term) => (
              <span
                key={term}
                className="inline-flex items-center max-w-[200px] rounded-full border border-border bg-card hover:border-primary transition-colors"
              >
                <button
                  onClick={() => setQuery(term)}
                  title={term}
                  className="text-xs pl-2.5 py-1 text-foreground truncate"
                >
                  {term}
                </button>
                <button
                  onClick={() => setRecentSearches(recentSearches.filter((s) => s !== term))}
                  aria-label={`Remove "${term}" from recent searches`}
                  title="Remove"
                  className="shrink-0 px-1.5 py-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <ul
          ref={listRef}
          id="palette-results"
          role="listbox"
          aria-label="Search results"
          className="max-h-[52vh] overflow-y-auto"
        >
          {results.map((entry, i) => (
            <li
              key={entry.id}
              id={`palette-opt-${entry.id}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(entry)}
              className={`px-3 py-2.5 cursor-pointer border-l-2 ${
                i === active ? 'bg-accent border-primary' : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wide text-accent-orange shrink-0">
                  {tabLabel(entry.tab)}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {entry.sub ? `${entry.category} · ${entry.sub}` : entry.category}
                </span>
              </div>
              <p className="text-sm text-foreground mt-0.5 truncate">{entry.title}</p>
            </li>
          ))}

          {!results.length && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              {query.trim()
                ? `Nothing found for “${query}”.`
                : 'Start typing, or pin entries to see them here.'}
            </li>
          )}
        </ul>

        <div className="flex items-center gap-3 px-3 py-2 border-t border-border text-[10px] text-muted-foreground">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span className="ml-auto">⌘K / Ctrl+K</span>
        </div>
      </div>
    </div>
  );
}
