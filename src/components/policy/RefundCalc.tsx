'use client';

import { useState } from 'react';

type Profile = 'shopify' | 'amazon' | 'pricematch';

const PROFILES: { key: Profile; label: string }[] = [
  { key: 'shopify', label: 'Shopify' },
  { key: 'amazon', label: 'Amazon' },
  { key: 'pricematch', label: 'Price Match' },
];

const inputClass =
  'w-full p-2 rounded bg-background border border-border text-foreground placeholder-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring text-xs';
const labelClass = 'block text-xs text-muted-foreground';

/**
 * Refund math differs by platform, so this is three separate calculators
 * behind one switcher rather than one calculator with a checkbox:
 * Shopify refunds 6% of the order total, Amazon refunds 6% of the item
 * subtotal (a different base number, not just a different label), and a
 * price match has to re-derive the order's own tax rate before it can
 * apply it to the new price.
 */
export default function RefundCalc() {
  const [profile, setProfile] = useState<Profile>('shopify');

  const [shopifyTotal, setShopifyTotal] = useState('');
  const [amazonSubtotal, setAmazonSubtotal] = useState('');

  const [pmTotal, setPmTotal] = useState('');
  const [pmOriginal, setPmOriginal] = useState('');
  const [pmTax, setPmTax] = useState('');
  const [pmNew, setPmNew] = useState('');

  const shopifyTotalNum = parseFloat(shopifyTotal || '0');
  const shopifyRefund = shopifyTotalNum * 0.06;

  const amazonSubtotalNum = parseFloat(amazonSubtotal || '0');
  const amazonRefund = amazonSubtotalNum * 0.06;

  const pmTotalNum = parseFloat(pmTotal || '0');
  const pmOriginalNum = parseFloat(pmOriginal || '0');
  const pmTaxNum = parseFloat(pmTax || '0');
  const pmNewNum = parseFloat(pmNew || '0');
  const pmReady = pmTotalNum > 0 && pmOriginalNum > 0 && pmTaxNum > 0 && pmNewNum > 0;
  const pmTaxRate = pmOriginalNum > 0 ? pmTaxNum / pmOriginalNum : 0;
  const pmAdjustedTax = pmNewNum * pmTaxRate;
  const pmRefund = pmTotalNum - pmNewNum - pmAdjustedTax;

  const hasInput =
    profile === 'shopify' ? shopifyTotalNum > 0 : profile === 'amazon' ? amazonSubtotalNum > 0 : pmReady;
  const refund = profile === 'shopify' ? shopifyRefund : profile === 'amazon' ? amazonRefund : pmRefund;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Refund Calculator</h3>

      <div className="flex flex-wrap gap-2">
        {PROFILES.map((p) => (
          <button
            key={p.key}
            onClick={() => setProfile(p.key)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              profile === p.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {profile === 'shopify' && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Refund = order total &times; 6%</p>
          <div className="space-y-1">
            <label className={labelClass}>Order Total ($)</label>
            <input
              type="number"
              placeholder="e.g. 191.33"
              value={shopifyTotal}
              onChange={(e) => setShopifyTotal(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {profile === 'amazon' && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Refund = item subtotal &times; 6%</p>
          <div className="space-y-1">
            <label className={labelClass}>Item Subtotal ($)</label>
            <input
              type="number"
              placeholder="e.g. 219.88"
              value={amazonSubtotal}
              onChange={(e) => setAmazonSubtotal(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {profile === 'pricematch' && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Refund = order total &minus; new item price &minus; adjusted tax
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass}>Order Total ($)</label>
              <input
                type="number"
                placeholder="e.g. 191.33"
                value={pmTotal}
                onChange={(e) => setPmTotal(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Original Item Price ($)</label>
              <input
                type="number"
                placeholder="e.g. 179.99"
                value={pmOriginal}
                onChange={(e) => setPmOriginal(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Tax Amount ($)</label>
              <input
                type="number"
                placeholder="e.g. 11.34"
                value={pmTax}
                onChange={(e) => setPmTax(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>New Item Price ($)</label>
              <input
                type="number"
                placeholder="e.g. 169.99"
                value={pmNew}
                onChange={(e) => setPmNew(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          {pmReady && (
            <div className="text-xs text-muted-foreground space-y-1 pt-1 tabular-nums">
              <div className="flex justify-between">
                <span>Tax rate</span>
                <span>{(pmTaxRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Adjusted tax</span>
                <span>${pmAdjustedTax.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground font-medium">Refund Amount</span>
        <span className="text-lg font-bold text-foreground tabular-nums">
          {hasInput ? `$${refund.toFixed(2)}` : '$0.00'}
        </span>
      </div>
    </div>
  );
}
