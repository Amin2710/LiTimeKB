'use client';

import { useState, useMemo } from 'react';
import { ORIENT } from '@/data/orient';
import TemplateBlock from '@/components/kb/TemplateBlock';

const REPLY_TEMPLATE = `Dear [Customer Name],

Thank you for your message.

Please refer to the attached image for proper placement of the battery:

"√" indicates the side that may be placed face down.

"x" indicates the side that should not be placed face down.

The image provides a clear visual reference to ensure safe and correct installation. Should you have any further questions, please do not hesitate to contact us.

Best regards,`;

const KIND_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  flex: { label: 'Flexible', color: 'text-success bg-success/10 border-success/30', icon: 'M20 6L9 17l-5-5' },
  partial: { label: 'Partial', color: 'text-warning bg-warning/10 border-warning/30', icon: 'M5 12h14' },
  upright: { label: 'Upright Only', color: 'text-destructive bg-destructive/10 border-destructive/30', icon: 'M18 6L6 18M6 6l12 12' },
};

export default function OrientationView() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ORIENT;
    return ORIENT.filter((o) => o.sku.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground font-heading">
        Battery Orientation
      </h2>

      {/* Warning banner */}
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive leading-relaxed">
        <strong>Important:</strong> Never install ANY battery with the terminals facing down. This applies to all models regardless of orientation flexibility.
      </div>

      {/* Reply template */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Quick Reply Template</p>
        <TemplateBlock template={REPLY_TEMPLATE} />
        <p className="text-xs text-muted-foreground">Remember to attach the orientation reference image showing the √/x sides.</p>
      </div>

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
          type="text"
          placeholder="Search by SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 pl-10 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(KIND_LABELS).map(([key, val]) => (
          <span
            key={key}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${val.color}`}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={val.icon} />
            </svg>
            {val.label}
          </span>
        ))}
      </div>

      {/* Results */}
      <p className="text-xs text-muted-foreground tabular-nums">{filtered.length} SKU{filtered.length !== 1 ? 's' : ''}</p>

      <div className="space-y-2">
        {filtered.map((item) => {
          const kindInfo = KIND_LABELS[item.kind] || KIND_LABELS.upright;
          return (
            <div
              key={item.sku}
              className="rounded-lg border border-border bg-card p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-mono font-semibold text-foreground">
                  {item.sku}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${kindInfo.color}`}>
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={kindInfo.icon} />
                  </svg>
                  {kindInfo.label}
                </span>
              </div>
              <p className="text-sm text-foreground">{item.rule}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
              {item.screw && (
                <p className="text-xs text-muted-foreground">
                  Screw size: {item.screw}
                </p>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No SKU found for &quot;{search}&quot;
          </p>
        )}
      </div>
    </div>
  );
}
