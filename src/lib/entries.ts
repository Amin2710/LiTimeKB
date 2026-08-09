// Flat, cross-tab index of every lookup-able thing in the KB.
//
// Backs the command palette, deep links and the favourites row. Each entry
// carries a stable id so a URL like `?tab=kb&e=<id>` survives a rebuild of the
// generated data files.

import { KB, TS } from '@/data/kb';
import { EMAIL } from '@/data/email';
import { ORIENT } from '@/data/orient';
import { ERROR_CODES } from '@/data/devices';
import { DEVICE_GROUPS } from '@/data/deviceGroups';

export type EntryTab = 'kb' | 'troubleshoot' | 'email' | 'orient';

export type EntryKind = 'entry' | 'orient' | 'errorcode';

export interface IndexEntry {
  id: string;
  tab: EntryTab;
  /** Accordion category, or a synthetic one for orientation / error codes. */
  category: string;
  sub?: string;
  title: string;
  /** Everything else worth matching against, pre-joined. */
  body: string;
  note?: string;
  template?: string;
  summary?: string;
  link?: string;
  /** Accordion cards are `entry`; the other kinds have their own views. */
  kind: EntryKind;
}

const TAB_LABELS: Record<EntryTab, string> = {
  kb: 'Knowledge Base',
  troubleshoot: 'Troubleshooting',
  email: 'Email Templates',
  orient: 'Battery Orientation',
};

export function tabLabel(tab: EntryTab): string {
  return TAB_LABELS[tab];
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Builds an id that stays stable as long as the title and category do. */
function makeId(tab: string, category: string, title: string, taken: Set<string>): string {
  const base = `${tab}.${slug(category)}.${slug(title)}`;
  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  const id = `${base}-${n}`;
  taken.add(id);
  return id;
}

function buildIndex(): IndexEntry[] {
  const entries: IndexEntry[] = [];
  const taken = new Set<string>();

  const accordions: Array<[EntryTab, Record<string, Array<Record<string, string>>>]> = [
    ['kb', KB as unknown as Record<string, Array<Record<string, string>>>],
    ['troubleshoot', TS as unknown as Record<string, Array<Record<string, string>>>],
    ['email', EMAIL as unknown as Record<string, Array<Record<string, string>>>],
  ];

  for (const [tab, data] of accordions) {
    for (const category of Object.keys(data)) {
      for (const entry of data[category]) {
        entries.push({
          id: makeId(tab, category, entry.issue ?? '', taken),
          tab,
          category,
          sub: entry.sub || undefined,
          title: entry.issue ?? '',
          body: [entry.summary, entry.template].filter(Boolean).join('\n'),
          note: entry.note || undefined,
          template: entry.template || undefined,
          summary: entry.summary || undefined,
          link: entry.link || undefined,
          kind: 'entry',
        });
      }
    }
  }

  // Orientation rules are looked up by SKU.
  for (const record of ORIENT) {
    entries.push({
      id: makeId('orient', 'sku', record.sku, taken),
      tab: 'orient',
      category: 'Battery Orientation',
      title: record.sku,
      body: [record.rule, record.detail, record.screw].filter(Boolean).join('\n'),
      kind: 'orient',
    });
  }

  // Error codes: agents search these by the raw code the customer reads out.
  for (const group of DEVICE_GROUPS) {
    for (const code of ERROR_CODES[group.key] ?? []) {
      entries.push({
        id: makeId('kb', `error-${group.key}`, code.code, taken),
        tab: 'kb',
        category: 'Error Codes',
        sub: `${group.brand} ${group.label}`,
        title: code.code,
        body: [code.reason, code.solution, code.note].filter(Boolean).join('\n'),
        kind: 'errorcode',
      });
    }
  }

  return entries;
}

let cached: IndexEntry[] | null = null;

/** The index is derived from static imports, so it is built once and reused. */
export function getIndex(): IndexEntry[] {
  if (!cached) cached = buildIndex();
  return cached;
}

export function getEntryById(id: string): IndexEntry | undefined {
  return getIndex().find((e) => e.id === id);
}

const groupCache = new Map<EntryTab, Record<string, IndexEntry[]>>();

/**
 * Accordion cards for one tab, grouped by category and in source order.
 *
 * The accordion renders from the same index the palette searches, so an id in a
 * shared link always resolves to the card it came from.
 */
export function getGroupedEntries(tab: EntryTab): Record<string, IndexEntry[]> {
  const cached = groupCache.get(tab);
  if (cached) return cached;

  const grouped: Record<string, IndexEntry[]> = {};
  for (const entry of getIndex()) {
    if (entry.tab !== tab || entry.kind !== 'entry') continue;
    (grouped[entry.category] ??= []).push(entry);
  }

  groupCache.set(tab, grouped);
  return grouped;
}

/**
 * Scores a haystack against one query token. Exact substring beats a
 * word-prefix hit, which is what makes "batt" find "battery" without pulling
 * in every entry that merely mentions it in passing.
 */
function tokenScore(haystack: string, token: string): number {
  if (!haystack) return 0;
  const lower = haystack.toLowerCase();
  if (lower.includes(token)) return 2;
  // Word-prefix fallback for partially typed words.
  for (const word of lower.split(/[^a-z0-9]+/)) {
    if (word.length > token.length && word.startsWith(token)) return 1;
  }
  return 0;
}

const FIELD_WEIGHTS: Array<[keyof IndexEntry, number]> = [
  ['title', 50],
  ['sub', 16],
  ['category', 14],
  ['note', 12],
  ['body', 8],
];

export interface SearchHit {
  entry: IndexEntry;
  score: number;
}

/**
 * Cross-tab search. Every query token has to hit *something* on an entry, so
 * multi-word queries narrow rather than widen.
 */
export function searchIndex(query: string, limit = 30): SearchHit[] {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];

  const hits: SearchHit[] = [];

  for (const entry of getIndex()) {
    let total = 0;
    let matchedAll = true;

    for (const token of tokens) {
      let best = 0;
      for (const [field, weight] of FIELD_WEIGHTS) {
        const value = entry[field];
        if (typeof value !== 'string') continue;
        best = Math.max(best, tokenScore(value, token) * weight);
      }
      if (best === 0) {
        matchedAll = false;
        break;
      }
      total += best;
    }

    if (matchedAll) hits.push({ entry, score: total });
  }

  hits.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
  return hits.slice(0, limit);
}
