'use client';

import { Fragment, useMemo } from 'react';

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface HighlightProps {
  text: string;
  /** Raw search query; split on whitespace so every word gets marked. */
  query?: string;
}

/**
 * Marks every occurrence of every query word — not just the first match, which
 * used to leave agents hunting for why a card had turned up in the results.
 */
export default function Highlight({ text, query }: HighlightProps) {
  const parts = useMemo(() => {
    const tokens = (query ?? '').trim().split(/\s+/).filter(Boolean);
    if (!text || !tokens.length) return null;

    const pattern = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi');
    return text.split(pattern);
  }, [text, query]);

  if (!parts) return <>{text}</>;

  const tokens = new Set(
    (query ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => t.toLowerCase())
  );

  return (
    <>
      {parts.map((part, i) =>
        tokens.has(part.toLowerCase()) ? (
          <mark key={i} className="bg-yellow-500/30 text-inherit rounded px-0.5">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}
