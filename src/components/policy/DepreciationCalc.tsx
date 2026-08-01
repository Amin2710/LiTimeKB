'use client';

import { useState } from 'react';

interface DepRow {
  id: number;
  price: string;
  monthsUsed: string;
  warrantyMonths: string;
}

export default function DepreciationCalc() {
  const [rows, setRows] = useState<DepRow[]>([
    { id: 1, price: '', monthsUsed: '', warrantyMonths: '' },
  ]);

  let nextId = 2;

  function addRow() {
    setRows([...rows, { id: nextId++, price: '', monthsUsed: '', warrantyMonths: '' }]);
  }

  function removeRow(id: number) {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.id !== id));
  }

  function updateRow(id: number, field: keyof DepRow, value: string) {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  const items = rows.map((r) => {
    const price = parseFloat(r.price || '0');
    const monthsUsed = parseInt(r.monthsUsed || '0');
    const warrantyMonths = parseInt(r.warrantyMonths || '0');
    let depreciation = 0;
    if (price > 0 && monthsUsed > 12 && warrantyMonths > 0) {
      depreciation = price * (monthsUsed / warrantyMonths);
    }
    const refund = price - depreciation;
    return { price, monthsUsed, warrantyMonths, depreciation, refund };
  });

  const totalDepreciation = items.reduce((s, i) => s + i.depreciation, 0);
  const totalRefund = items.reduce((s, i) => s + Math.max(0, i.refund), 0);

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Depreciation Calculator</h3>

      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div key={row.id} className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 text-xs items-end">
            <span className="text-muted-foreground pb-2">{idx + 1}.</span>
            <div className="space-y-1">
              <label className="block text-muted-foreground">Price ($)</label>
              <input
                type="number"
                placeholder="e.g. 299.99"
                value={row.price}
                onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                className="w-full p-2 rounded bg-background border border-border text-foreground placeholder-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-muted-foreground">Months used</label>
              <input
                type="number"
                placeholder="e.g. 18"
                value={row.monthsUsed}
                onChange={(e) => updateRow(row.id, 'monthsUsed', e.target.value)}
                className="w-full p-2 rounded bg-background border border-border text-foreground placeholder-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-muted-foreground">Warranty months</label>
              <input
                type="number"
                placeholder="e.g. 60"
                value={row.warrantyMonths}
                onChange={(e) => updateRow(row.id, 'warrantyMonths', e.target.value)}
                className="w-full p-2 rounded bg-background border border-border text-foreground placeholder-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <button
              onClick={() => removeRow(row.id)}
              className="text-destructive hover:underline disabled:opacity-30 pb-2"
              disabled={rows.length <= 1}
            >
              Del
            </button>
          </div>
        ))}
        <button
          onClick={addRow}
          className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:brightness-110"
        >
          + Add Row
        </button>
      </div>

      <div className="border-t border-border pt-3 space-y-1.5 text-xs tabular-nums">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] gap-3 text-muted-foreground items-baseline">
            <span className="truncate">Item {i + 1}: ${item.price.toFixed(2)} x {item.monthsUsed}m / {item.warrantyMonths}m</span>
            <span className={`shrink-0 ${item.depreciation > 0 ? 'text-destructive' : 'text-success'}`}>
              {item.depreciation > 0 ? `-$${item.depreciation.toFixed(2)}` : '$0.00'}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-sm border-t border-border pt-2">
        <span className="text-muted-foreground">Total depreciation</span>
        <span className="text-destructive font-medium">-${totalDepreciation.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-foreground font-semibold">Estimated refund (exc. tax)</span>
        <span className="text-foreground font-bold">${totalRefund.toFixed(2)}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Note: Depreciation only applies if months used &gt; 12. Tax is never refunded.
      </p>
    </div>
  );
}
