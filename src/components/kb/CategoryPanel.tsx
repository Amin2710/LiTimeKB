'use client';

import { useState, useRef, useEffect } from 'react';
import Card from './Card';
import { ICONS } from '@/data/icons';

interface CategoryPanelProps {
  category: string;
  entries: Array<{ issue: string; template: string; note?: string; summary?: string; link?: string; sub?: string }>;
  highlight?: string;
  defaultOpen?: boolean;
}

export default function CategoryPanel({ category, entries, highlight, defaultOpen }: CategoryPanelProps) {
  const [open, setOpen] = useState(defaultOpen || false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && contentRef.current) {
      const timer = setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const icon = ICONS[category] || '';
  const subs = [...new Set(entries.map((e) => e.sub).filter(Boolean))];
  const hasMultipleSubs = subs.length > 1;

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
            className="text-primary shrink-0"
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
            subs.map((sub) => {
              const subEntries = entries.filter((e) => e.sub === sub);
              return (
                <div key={sub}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    {sub}
                  </h4>
                  <div className="space-y-2">
                    {subEntries.map((entry, i) => (
                      <Card key={i} entry={entry} highlight={highlight} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="space-y-2">
              {entries.map((entry, i) => (
                <Card key={i} entry={entry} highlight={highlight} />
              ))}
            </div>
          )}
            </div>
          </div>
        </div>

    </div>
  );
}
