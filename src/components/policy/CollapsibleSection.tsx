'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';

export default function CollapsibleSection({
  title,
  icon,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon?: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

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
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5 min-w-0">
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
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground tabular-nums ml-auto">{count}</span>
        )}
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
          <div ref={contentRef} className="border-t border-border p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
