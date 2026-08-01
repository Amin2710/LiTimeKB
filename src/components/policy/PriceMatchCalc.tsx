'use client';

import { useState } from 'react';

export default function PriceMatchCalc() {
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxAmount, setTaxAmount] = useState('');

  const purchase = parseFloat(purchasePrice || '0');
  const current = parseFloat(currentPrice || '0');
  const tax = taxEnabled ? parseFloat(taxAmount || '0') : 0;
  const difference = purchase > current ? purchase - current : 0;
  const totalRefund = difference + tax;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Price Match Calculator</h3>
      <p className="text-xs text-muted-foreground">
        30-day price-match window from purchase date. Enter the total amounts paid (including tax).
      </p>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-2">
          <label className="block text-muted-foreground">Amount Paid (total)</label>
          <input
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="e.g. 299.99"
            className="w-full p-2 rounded bg-background border border-border text-foreground placeholder-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-muted-foreground">Current Price (total)</label>
          <input
            type="number"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            placeholder="e.g. 249.99"
            className="w-full p-2 rounded bg-background border border-border text-foreground placeholder-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <label className="flex items-center gap-2 cursor-pointer text-muted-foreground w-fit">
          <input
            type="checkbox"
            checked={taxEnabled}
            onChange={(e) => {
              setTaxEnabled(e.target.checked);
              if (!e.target.checked) setTaxAmount('');
            }}
            className="accent-primary"
          />
          Add tax adjustment
        </label>
        {taxEnabled && (
          <div className="space-y-1">
            <label className="block text-muted-foreground">Tax Amount ($)</label>
            <input
              type="number"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              placeholder="e.g. 4.13"
              step="0.01"
              className="w-48 p-2 rounded bg-background border border-border text-foreground placeholder-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        )}
      </div>

      {purchase > 0 && current > 0 && (
        <div className="border-t border-border pt-3 space-y-1 text-xs tabular-nums">
          <div className="flex justify-between text-muted-foreground">
            <span>Price difference</span>
            <span>${difference.toFixed(2)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Tax adjustment</span>
              <span className="text-success">+${tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
            <span className="text-foreground">Total Refund</span>
            <span className={difference > 0 ? 'text-success' : 'text-muted-foreground'}>
              {difference > 0 ? `$${totalRefund.toFixed(2)}` : '$0.00'}
            </span>
          </div>
          {difference === 0 && (
            <p className="text-xs text-muted-foreground">
              Current price is not lower than the amount paid.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
