'use client';

import { useEffect, useRef, useState } from 'react';
import Card from './Card';
import { ICONS } from '@/data/icons';
import type { IndexEntry } from '@/lib/entries';

interface CategoryPanelProps {
  category: string;
  entries: IndexEntry[];
  query?: string;
  defaultOpen?: boolean;
  /** Ids of expanded cards, owned by the parent view. */
  openIds: Set<string>;
  onToggleEntry: (id: string) => void;
  /** Card currently under the keyboard cursor, if any. */
  focusedId?: string | null;
}

export default function CategoryPanel({
  category,
  entries,
  query,
  defaultOpen,
  openIds,
  onToggleEntry,
  focusedId,
}: CategoryPanelProps) {
  // A card can be targeted from outside the panel (deep link, keyboard cursor,
  // pinned row), so the panel has to open to reveal it. holdsTarget is read
  // into the initial `open` state directly — not just handled by the effect
  // below — because a page loaded straight from a search deep link already
  // has the target present on this component's very first render. In that
  // case lastHeldTarget's own lazy init would equal holdsTarget immediately
  // (both true from the start), so the `!==` check below would never fire
  // and the panel would silently stay collapsed around an "open" card.
  const holdsTarget = entries.some((e) => e.id === focusedId || openIds.has(e.id));
  const [open, setOpen] = useState(defaultOpen || holdsTarget || false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Adjusting during render on the transition keeps the panel collapsible
  // once the target moves away, for a target that arrives after this panel
  // has already mounted (e.g. clicking a pinned chip while already on the
  // page) — the case the initial-state read above doesn't cover.
  const [lastHeldTarget, setLastHeldTarget] = useState(holdsTarget);
  if (holdsTarget !== lastHeldTarget) {
    setLastHeldTarget(holdsTarget);
    if (holdsTarget) setOpen(true);
  }

  useEffect(() => {
    if (open && contentRef.current) {
      const timer = setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const icon = ICONS[category] || '';
  const subs = [...new Set(entries.map((e) => e.sub).filter(Boolean))] as string[];
  const hasMultipleSubs = subs.length > 1;

  function renderCard(entry: IndexEntry) {
    return (
      <Card
        key={entry.id}
        entry={entry}
        query={query}
        open={openIds.has(entry.id)}
        onToggle={() => onToggleEntry(entry.id)}
        focused={focusedId === entry.id}
      />
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
        aria-expanded={open}
        aria-controls={`panel-content-${category.replace(/\s+/g, '-')}`}
      >
        {icon && (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent-orange shrink-0"
          >
            <path d={icon} />
          </svg>
        )}
        <span className="text-sm font-semibold text-foreground">{category}</span>
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">{entries.length}</span>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div
            ref={contentRef}
            id={`panel-content-${category.replace(/\s+/g, '-')}`}
            className="border-t border-border p-3 space-y-2"
            role="region"
          >
            {hasMultipleSubs ? (
              subs.map((sub) => (
                <div key={sub}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    {sub}
                  </h4>
                  <div className="space-y-2">
                    {entries.filter((e) => e.sub === sub).map(renderCard)}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-2">{entries.map(renderCard)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
