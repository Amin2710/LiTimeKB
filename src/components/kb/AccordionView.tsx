'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { KB, TS } from '@/data/kb';
import { EMAIL } from '@/data/email';
import CategoryPanel from './CategoryPanel';
import BatteryDimensions from './BatteryDimensions';
import ErrorCodesView from './ErrorCodesView';

type DataSource = 'kb' | 'email' | 'troubleshoot';

interface AccordionViewProps {
  dataSource: DataSource;
}

const TITLES: Record<DataSource, string> = {
  kb: 'Knowledge Base',
  email: 'Email Templates',
  troubleshoot: 'Troubleshooting',
};

function getData(source: DataSource) {
  switch (source) {
    case 'kb': return KB;
    case 'email': return EMAIL;
    case 'troubleshoot': return TS;
  }
}

export default function AccordionView({ dataSource }: AccordionViewProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const data = getData(dataSource);
  const categories = Object.keys(data);
  const BD_CATEGORY = 'Battery Dimensions';
  const EC_CATEGORY = 'Error Codes';
  const isKb = dataSource === 'kb';

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const allCategories = useMemo(
    () => (isKb ? [...categories, BD_CATEGORY, EC_CATEGORY] : categories),
    [categories, isKb]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    // Show all (including extras) when no search or filter
    if (!q && !activeCategory) {
      if (isKb) return { ...data, [BD_CATEGORY]: [], [EC_CATEGORY]: [] };
      return { ...data };
    }

    const result: Record<string, any[]> = {};
    for (const cat of categories) {
      if (activeCategory && cat !== activeCategory) continue;
      const entries = data[cat].filter((e: any) => {
        if (!q) return true;
        return (
          e.issue?.toLowerCase().includes(q) ||
          e.summary?.toLowerCase().includes(q) ||
          e.template?.toLowerCase().includes(q) ||
          e.sub?.toLowerCase().includes(q)
        );
      });
      if (entries.length) result[cat] = entries;
    }
    // Include extra panels only in KB tab when no search term
    if (isKb && !q && (!activeCategory || activeCategory === BD_CATEGORY)) {
      result[BD_CATEGORY] = [];
    }
    if (isKb && !q && (!activeCategory || activeCategory === EC_CATEGORY)) {
      result[EC_CATEGORY] = [];
    }
    return result;
  }, [search, activeCategory, data, categories, isKb]);

  const filteredCategories = Object.keys(filtered);
  const totalCount = useMemo(
    () => filteredCategories.reduce((sum, c) => sum + filtered[c].length, 0),
    [filtered, filteredCategories]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground font-heading">
        {TITLES[dataSource]}
      </h2>

      {/* Search */}
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
          placeholder="Search... (press / to focus)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 pl-10 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm"
        />
      </div>

      {/* Category chips */}
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
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Result count */}
      <p className="text-xs text-muted-foreground tabular-nums">{totalCount} result{totalCount !== 1 ? 's' : ''}</p>

      {/* Content */}
      <div className="space-y-2">
        {filteredCategories.map((cat) =>
          cat === BD_CATEGORY ? (
            <BatteryDimensionsPanel key={BD_CATEGORY} />
          ) : cat === EC_CATEGORY ? (
            <ErrorCodesPanel key={EC_CATEGORY} />
          ) : (
            <CategoryPanel
              key={cat}
              category={cat}
              entries={filtered[cat]}
              highlight={search.trim()}
              defaultOpen={dataSource === 'troubleshoot'}
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

function BatteryDimensionsPanel() {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && contentRef.current) {
      const timer = setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const icon = 'M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3';

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-orange shrink-0">
          <path d={icon} />
        </svg>
        <span className="text-sm font-semibold text-foreground">Battery Dimensions</span>
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">3</span>
        <svg className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden min-h-0">
          <div ref={contentRef} className="border-t border-border p-3 space-y-2" role="region">
            <BatteryDimensions />
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorCodesPanel() {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && contentRef.current) {
      const timer = setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const icon = 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z';

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive shrink-0">
          <path d={icon} />
        </svg>
        <span className="text-sm font-semibold text-foreground">Error Codes</span>
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">13</span>
        <svg className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden min-h-0">
          <div ref={contentRef} className="border-t border-border p-3 space-y-2" role="region">
            <ErrorCodesView />
          </div>
        </div>
      </div>
    </div>
  );
}
