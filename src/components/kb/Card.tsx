'use client';

import { useState, useRef, useEffect } from 'react';

interface CardEntry {
  issue: string;
  template: string;
  note?: string;
  summary?: string;
  link?: string;
  sub?: string;
}

interface CardProps {
  entry: CardEntry;
  highlight?: string;
}

export default function Card({ entry, highlight }: CardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && contentRef.current) {
      const timer = setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  function highlightText(text: string) {
    if (!highlight) return text;
    const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-500/30 text-inherit rounded px-0.5">
          {text.slice(idx, idx + highlight.length)}
        </mark>
        {text.slice(idx + highlight.length)}
      </>
    );
  }

  function isAmber(note: string) {
    const lower = note.toLowerCase();
    return lower.includes('needs confirmation') || lower.includes('amber') || lower.includes('policy');
  }

  async function copyTemplate() {
    try {
      await navigator.clipboard.writeText(entry.template);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-accent transition-colors"
        aria-expanded={expanded}
        aria-controls={`card-content-${entry.issue.slice(0, 20)}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {entry.sub && (
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {entry.sub}
              </span>
            )}
            {entry.note && isAmber(entry.note) && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/20 text-warning font-medium">
                Policy
              </span>
            )}
          </div>
          <p className="text-sm text-foreground font-medium mt-0.5">
            {highlight ? highlightText(entry.issue) : entry.issue}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${
            expanded ? 'rotate-180' : ''
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
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div
            ref={contentRef}
            id={`card-content-${entry.issue.slice(0, 20)}`}
            className="px-4 pb-4 space-y-3 border-t border-border pt-3"
            role="region"
          >
            {entry.summary && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {highlight ? highlightText(entry.summary) : entry.summary}
              </p>
            )}

            {entry.template && (
              <div className="relative">
                <div className="text-sm text-foreground whitespace-pre-wrap bg-card rounded-lg p-3 border border-border leading-relaxed">
                  {entry.template}
                </div>
                <button
                  onClick={copyTemplate}
                  className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:brightness-110 transition-all"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}

            {entry.note && (
              <div
                className={`text-sm rounded-lg p-3 border leading-relaxed ${
                  isAmber(entry.note)
                    ? 'bg-warning/10 border-warning/30 text-warning'
                    : 'bg-success/10 border-success/30 text-success'
                }`}
              >
                {entry.note}
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
