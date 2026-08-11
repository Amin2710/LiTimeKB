'use client';

import { useMemo } from 'react';
import { getIndex, type EntryTab, type IndexEntry } from '@/lib/entries';
import { useFavorites } from '@/components/layout/FavoritesProvider';

interface PinnedRowProps {
  tab: EntryTab;
  /** Expands the entry in the list below. */
  onOpen: (id: string) => void;
}

/**
 * Pinned and recently opened entries for this tab.
 *
 * Agents reach for the same handful of templates all day; without this they had
 * to re-search or re-scroll for them on every ticket.
 */
export default function PinnedRow({ tab, onOpen }: PinnedRowProps) {
  const { favorites, recents, toggleFavorite } = useFavorites();

  const { pinned, recent } = useMemo(() => {
    const index = getIndex();
    const byId = new Map(index.map((e) => [e.id, e]));

    const resolve = (ids: string[]) =>
      ids
        .map((id) => byId.get(id))
        .filter((e): e is IndexEntry => Boolean(e) && e!.tab === tab && e!.kind === 'entry');

    const pinnedEntries = resolve(favorites);
    const pinnedIds = new Set(pinnedEntries.map((e) => e.id));

    return {
      pinned: pinnedEntries,
      // Don't repeat something that is already pinned above.
      recent: resolve(recents).filter((e) => !pinnedIds.has(e.id)).slice(0, 5),
    };
  }, [favorites, recents, tab]);

  if (!pinned.length && !recent.length) return null;

  return (
    <div className="space-y-2">
      {pinned.length > 0 && (
        // Its own bordered/shaded block, distinct from the plain Recent row
        // below, so the templates an agent pinned on purpose don't read as
        // just another line of chips.
        <div className="rounded-lg border border-accent-orange/30 bg-accent-orange/[0.06] p-2.5">
          <Row label="Pinned" icon>
            {pinned.map((entry) => (
              <span
                key={entry.id}
                className="inline-flex items-center max-w-[280px] rounded-full border border-accent-orange/40 bg-card hover:border-accent-orange transition-colors"
              >
                <button
                  onClick={() => onOpen(entry.id)}
                  title={entry.title}
                  className="text-xs pl-2.5 py-1 text-foreground truncate"
                >
                  {entry.title}
                </button>
                <button
                  onClick={() => toggleFavorite(entry.id)}
                  aria-label={`Unpin ${entry.title}`}
                  title="Unpin"
                  className="shrink-0 px-1.5 py-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </Row>
        </div>
      )}

      {recent.length > 0 && (
        <Row label="Recent">
          {recent.map((entry) => (
            <button
              key={entry.id}
              onClick={() => onOpen(entry.id)}
              title={entry.title}
              className="inline-flex items-center max-w-[260px] text-xs px-2.5 py-1 rounded-full border border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
            >
              <span className="truncate">{entry.title}</span>
            </button>
          ))}
        </Row>
      )}
    </div>
  );
}

function Row({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wide shrink-0 ${
          icon ? 'text-accent-orange' : 'text-muted-foreground'
        }`}
      >
        {icon && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M12 2a1 1 0 0 1 1 1v6.5l4.316 2.507a1 1 0 0 1 .5 1.115l-.5 2.121A1 1 0 0 1 16.35 16H13v5a1 1 0 1 1-2 0v-5H7.65a1 1 0 0 1-.966-1.257l.5-2.121a1 1 0 0 1 .5-1.115L12 9.5V3a1 1 0 0 1 1-1z" />
          </svg>
        )}
        {label}
      </span>
      {children}
    </div>
  );
}
