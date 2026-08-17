'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CategoryPanel from './CategoryPanel';
import BatteryDimensions from './BatteryDimensions';
import ErrorCodesView from './ErrorCodesView';
import PinnedRow from './PinnedRow';
import { getEntryById, getGroupedEntries, type EntryTab, type IndexEntry } from '@/lib/entries';
import { logSearchMiss } from '@/lib/actions';
import { useFavorites } from '@/components/layout/FavoritesProvider';
import { usePlaceholderValues } from './PlaceholderProvider';
import { applyPlaceholders, unfilledPlaceholders } from '@/lib/placeholders';
import { useAgentSignature } from '@/components/layout/SignatureProvider';
import { signTemplate } from '@/lib/signature';
import { useToast } from '@/components/ui/Toast';

type DataSource = Extract<EntryTab, 'kb' | 'email' | 'troubleshoot'>;

interface AccordionViewProps {
  dataSource: DataSource;
}

const TITLES: Record<DataSource, string> = {
  kb: 'Knowledge Base',
  email: 'Email Templates',
  troubleshoot: 'Troubleshooting',
};

const BD_CATEGORY = 'Battery Dimensions';
const EC_CATEGORY = 'Error Codes';

/** True when a keystroke should be left to whatever field has focus. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

function matches(entry: IndexEntry, query: string): boolean {
  if (!query) return true;
  // `note` carries the policy text ("POLICY: …offer a 10% partial refund…"),
  // which used to be unsearchable even though it is what agents look for.
  return [entry.title, entry.summary, entry.template, entry.note, entry.sub].some(
    (field) => field?.toLowerCase().includes(query)
  );
}

export default function AccordionView({ dataSource }: AccordionViewProps) {
  const searchParams = useSearchParams();
  const deepLinkId = searchParams.get('e');

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [focusIndex, setFocusIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const { noteRecent } = useFavorites();
  const { values } = usePlaceholderValues();
  const { signature } = useAgentSignature();
  const { toast } = useToast();

  const data = useMemo(() => getGroupedEntries(dataSource), [dataSource]);
  const categories = useMemo(() => Object.keys(data), [data]);
  const isKb = dataSource === 'kb';

  const allCategories = useMemo(
    () => (isKb ? [...categories, BD_CATEGORY, EC_CATEGORY] : categories),
    [categories, isKb]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q && !activeCategory) {
      const all: Record<string, IndexEntry[]> = { ...data };
      if (isKb) {
        all[BD_CATEGORY] = [];
        all[EC_CATEGORY] = [];
      }
      return all;
    }

    const result: Record<string, IndexEntry[]> = {};
    for (const category of categories) {
      if (activeCategory && category !== activeCategory) continue;
      const entries = data[category].filter((entry) => matches(entry, q));
      if (entries.length) result[category] = entries;
    }

    // The dimension and error-code panels have no searchable cards of their own,
    // so they only appear when the agent is browsing rather than searching.
    if (isKb && !q) {
      if (!activeCategory || activeCategory === BD_CATEGORY) result[BD_CATEGORY] = [];
      if (!activeCategory || activeCategory === EC_CATEGORY) result[EC_CATEGORY] = [];
    }
    return result;
  }, [search, activeCategory, data, categories, isKb]);

  const filteredCategories = useMemo(() => Object.keys(filtered), [filtered]);

  /** Cards currently on screen, in visual order — the keyboard cursor's track. */
  const visibleEntries = useMemo(
    () => filteredCategories.flatMap((category) => filtered[category]),
    [filtered, filteredCategories]
  );

  const totalCount = visibleEntries.length;

  const deepLinkIndex = useMemo(
    () => (deepLinkId ? visibleEntries.findIndex((e) => e.id === deepLinkId) : -1),
    [deepLinkId, visibleEntries]
  );

  // Error codes live outside the normal card list (kind !== 'entry'), so a
  // search result pointing at one needs to be routed to the Error Codes
  // panel by hand instead of via the openIds mechanism below.
  const errorCodeTargetId = useMemo(() => {
    if (!deepLinkId) return undefined;
    const entry = getEntryById(deepLinkId);
    return entry?.kind === 'errorcode' ? deepLinkId : undefined;
  }, [deepLinkId]);

  // The deep-linked card starts focused so a shared link visibly lands
  // somewhere; arrowing takes over from there. Falling back also keeps the
  // cursor in range when filtering shrinks the list.
  const effectiveIndex = focusIndex >= 0 && focusIndex < totalCount ? focusIndex : deepLinkIndex;
  const focusedEntry = effectiveIndex >= 0 ? visibleEntries[effectiveIndex] : undefined;

  const toggleEntry = useCallback(
    (id: string) => {
      setOpenIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
          noteRecent(id);
        }
        return next;
      });
    },
    [noteRecent]
  );

  const openEntry = useCallback(
    (id: string) => {
      setOpenIds((prev) => new Set(prev).add(id));
      noteRecent(id);
    },
    [noteRecent]
  );

  // A shared link lands here: expand the card it points at, once per link.
  // Adjusted during render rather than in an effect so the card is already open
  // on the first paint instead of flashing shut.
  const [appliedDeepLink, setAppliedDeepLink] = useState<string | null>(null);
  if (deepLinkId && deepLinkId !== appliedDeepLink) {
    setAppliedDeepLink(deepLinkId);
    setActiveCategory(null);
    setOpenIds((prev) => new Set(prev).add(deepLinkId));
  }

  const copyFocused = useCallback(
    async (entry: IndexEntry) => {
      if (!entry.template) {
        toast.info('This entry has no template to copy.');
        return;
      }
      const resolved = signTemplate(applyPlaceholders(entry.template, values), signature);
      const missing = unfilledPlaceholders(entry.template, values);
      try {
        await navigator.clipboard.writeText(resolved);
        if (missing.length) {
          toast.info(
            `Copied with ${missing.length} placeholder${missing.length > 1 ? 's' : ''} unfilled: ${missing
              .map((p) => p.label)
              .join(', ')}`
          );
        } else {
          toast.success('Template copied');
        }
      } catch {
        toast.error('Could not access the clipboard.');
      }
    },
    [values, signature, toast]
  );

  // Keyboard flow: the whole view is drivable without reaching for the mouse.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const typing = isTypingTarget(e.target);
      const inSearchBox = e.target === inputRef.current;

      if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }

      if (e.key === 'Escape') {
        if (search) {
          setSearch('');
        } else {
          setFocusIndex(-1);
          if (inSearchBox) inputRef.current?.blur();
        }
        return;
      }

      // Arrows work from the search box too, so typing a query and stepping
      // into the results is one uninterrupted motion.
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && (!typing || inSearchBox)) {
        if (!totalCount) return;
        e.preventDefault();
        const from = effectiveIndex;
        setFocusIndex(
          e.key === 'ArrowDown'
            ? (from + 1 >= totalCount ? 0 : from + 1)
            : (from <= 0 ? totalCount - 1 : from - 1)
        );
        return;
      }

      if (e.key === 'Enter' && focusedEntry && (!typing || inSearchBox)) {
        e.preventDefault();
        toggleEntry(focusedEntry.id);
        return;
      }

      if (e.key.toLowerCase() === 'c' && !typing && focusedEntry && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        void copyFocused(focusedEntry);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [search, totalCount, effectiveIndex, focusedEntry, toggleEntry, copyFocused]);

  // Surface gaps in the KB: log searches that came back empty.
  useEffect(() => {
    const q = search.trim();
    if (!q || totalCount > 0) return;
    const timer = setTimeout(() => {
      void logSearchMiss(q, dataSource);
    }, 1200);
    return () => clearTimeout(timer);
  }, [search, totalCount, dataSource]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground font-heading">{TITLES[dataSource]}</h2>

      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
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
          type="text"
          placeholder="Search... (press / to focus, ↑↓ to step, c to copy)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 pl-10 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm"
        />
      </div>

      <PinnedRow tab={dataSource} onOpen={openEntry} />

      {allCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="text-xs px-2.5 py-1 rounded-full border border-primary text-primary hover:bg-primary/10"
            >
              Clear
            </button>
          )}
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(activeCategory === category ? null : category)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                activeCategory === category
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground tabular-nums">
        {totalCount} result{totalCount !== 1 ? 's' : ''}
      </p>

      <div className="space-y-2">
        {filteredCategories.map((category) =>
          category === BD_CATEGORY ? (
            <ExtraPanel key={BD_CATEGORY} title="Battery Dimensions" count={3} tone="orange">
              <BatteryDimensions />
            </ExtraPanel>
          ) : category === EC_CATEGORY ? (
            <ExtraPanel
              key={EC_CATEGORY}
              title="Error Codes"
              count={13}
              tone="destructive"
              holdsTarget={Boolean(errorCodeTargetId)}
            >
              <ErrorCodesView targetId={errorCodeTargetId} />
            </ExtraPanel>
          ) : (
            <CategoryPanel
              key={category}
              category={category}
              entries={filtered[category]}
              query={search.trim()}
              defaultOpen={dataSource === 'troubleshoot'}
              openIds={openIds}
              onToggleEntry={toggleEntry}
              focusedId={focusedEntry?.id ?? null}
            />
          )
        )}
        {filteredCategories.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No results found &quot;{search}&quot;
          </p>
        )}
      </div>
    </div>
  );
}

const TONE_ICONS = {
  orange: {
    className: 'text-accent-orange',
    path: 'M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3',
  },
  destructive: {
    className: 'text-destructive',
    path: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
  },
} as const;

/** Collapsible wrapper for the two panels that aren't card lists. */
function ExtraPanel({
  title,
  count,
  tone,
  holdsTarget,
  children,
}: {
  title: string;
  count: number;
  tone: keyof typeof TONE_ICONS;
  /** True when a search deep link points at something inside this panel. */
  holdsTarget?: boolean;
  children: React.ReactNode;
}) {
  // Read into the initial `open` state directly, not just handled by the
  // effect below — a page loaded straight from a search deep link already
  // has holdsTarget true on this component's very first render, which would
  // make lastHeldTarget's own lazy init equal holdsTarget immediately (both
  // true from the start) and the `!==` check below would never fire.
  const [open, setOpen] = useState(Boolean(holdsTarget));
  const contentRef = useRef<HTMLDivElement>(null);
  const icon = TONE_ICONS[tone];

  // Covers a target that arrives after this panel has already mounted
  // (e.g. clicking a pinned chip while already on the page) — the case the
  // initial-state read above doesn't cover.
  const [lastHeldTarget, setLastHeldTarget] = useState(Boolean(holdsTarget));
  if (Boolean(holdsTarget) !== lastHeldTarget) {
    setLastHeldTarget(Boolean(holdsTarget));
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

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
        aria-expanded={open}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${icon.className} shrink-0`}
        >
          <path d={icon.path} />
        </svg>
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">{count}</span>
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
          <div ref={contentRef} className="border-t border-border p-3 space-y-2" role="region">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
