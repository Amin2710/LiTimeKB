'use client';

import { useEffect, useRef } from 'react';
import Highlight from './Highlight';
import TemplateBlock from './TemplateBlock';
import { useFavorites } from '@/components/layout/FavoritesProvider';
import { useToast } from '@/components/ui/Toast';
import { entryHref } from '@/components/search/CommandPalette';
import type { IndexEntry } from '@/lib/entries';

interface CardProps {
  entry: IndexEntry;
  query?: string;
  /** Expansion is owned by the parent so keyboard navigation can drive it. */
  open: boolean;
  onToggle: () => void;
  /** True when this card is the keyboard cursor's current row. */
  focused?: boolean;
}

function isPolicyNote(note: string) {
  const lower = note.toLowerCase();
  return lower.includes('needs confirmation') || lower.includes('amber') || lower.includes('policy');
}

export default function Card({ entry, query, open, onToggle, focused }: CardProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();

  const entryId = entry.id;
  const favorite = isFavorite(entryId);

  useEffect(() => {
    if (open && contentRef.current) {
      const timer = setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Follow the keyboard cursor without stealing focus from the search box.
  useEffect(() => {
    if (focused) rootRef.current?.scrollIntoView({ block: 'nearest' });
  }, [focused]);

  async function copyLink() {
    const url = `${window.location.origin}${entryHref(entry)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied — share it with a teammate');
    } catch {
      toast.error('Could not access the clipboard.');
    }
  }

  return (
    <div
      ref={rootRef}
      id={`entry-${entryId}`}
      className={`rounded-lg border bg-background overflow-hidden scroll-mt-20 ${
        focused ? 'border-primary ring-1 ring-primary/40' : 'border-border'
      }`}
    >
      <div className="flex items-stretch">
        <button
          onClick={onToggle}
          className="flex-1 text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-accent transition-colors min-w-0"
          aria-expanded={open}
          aria-controls={`card-content-${entryId}`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {entry.sub && (
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {entry.sub}
                </span>
              )}
              {entry.note && isPolicyNote(entry.note) && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/20 text-warning font-medium">
                  Policy
                </span>
              )}
            </div>
            <p className="text-sm text-foreground font-medium mt-0.5">
              <Highlight text={entry.title} query={query} />
            </p>
          </div>
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

        <div className="flex items-center gap-0.5 pr-2">
            <button
              onClick={copyLink}
              title="Copy link to this entry"
              aria-label="Copy link to this entry"
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
                <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
              </svg>
            </button>
            <button
              onClick={() => toggleFavorite(entryId)}
              title={favorite ? 'Unpin this entry' : 'Pin this entry'}
              aria-label={favorite ? 'Unpin this entry' : 'Pin this entry'}
              aria-pressed={favorite}
              className={`p-1.5 rounded transition-colors hover:bg-accent ${
                favorite ? 'text-accent-orange' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill={favorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              >
                <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9z" />
              </svg>
            </button>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div
            ref={contentRef}
            id={`card-content-${entryId}`}
            className="px-4 pb-4 space-y-3 border-t border-border pt-3"
            role="region"
          >
            {entry.summary && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                <Highlight text={entry.summary} query={query} />
              </p>
            )}

            {entry.template && <TemplateBlock template={entry.template} query={query} />}

            {entry.note && (
              <div
                className={`text-sm rounded-lg p-3 border leading-relaxed ${
                  isPolicyNote(entry.note)
                    ? 'bg-warning/10 border-warning/30 text-warning'
                    : 'bg-success/10 border-success/30 text-success'
                }`}
              >
                <Highlight text={entry.note} query={query} />
              </div>
            )}

            {entry.link && (
              <a
                href={entry.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-accent-orange hover:underline"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Reference link
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
