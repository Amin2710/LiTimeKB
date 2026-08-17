'use client';

import { useMemo, useState } from 'react';
import {
  computeLineRefunds,
  computePriceMatchRefund,
  orderItemTotal,
  sumRefunds,
  type RefundLineItem,
} from '@/lib/refundMath';

type Platform = 'shopify' | 'amazon' | 'ebay' | 'pricematch';
type ShopifyMarket = 'US' | 'CA' | 'DE' | 'FR' | 'RO-DE' | 'OTHER';
type EbayMode = 'additive' | 'taxbaked';

const PLATFORMS: { key: Platform; label: string }[] = [
  { key: 'shopify', label: 'Shopify' },
  { key: 'amazon', label: 'Amazon' },
  { key: 'ebay', label: 'eBay' },
  { key: 'pricematch', label: 'Price Match' },
];

const SHOPIFY_MARKETS: { key: ShopifyMarket; label: string; additive: boolean }[] = [
  { key: 'US', label: 'US', additive: true },
  { key: 'CA', label: 'CA', additive: true },
  { key: 'DE', label: 'DE', additive: false },
  { key: 'FR', label: 'FR', additive: false },
  { key: 'RO-DE', label: 'RO-DE', additive: false },
  { key: 'OTHER', label: 'Other / not listed', additive: true },
];

const inputClass =
  'w-full p-2 rounded bg-background border border-border text-foreground placeholder-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring text-xs';
const labelClass = 'block text-xs text-muted-foreground';

function num(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

let nextRowId = 1;
function emptyRow(): RefundLineItem {
  return { id: nextRowId++, name: '', unitPrice: 0, orderQty: 1, refundQty: 1 };
}

/**
 * Multi-platform refund calculator. Replaces the earlier flat-percentage
 * tool: refund math genuinely differs by platform and, for Shopify, by
 * market — whether tax is added on top of the refund or already baked into
 * the item price, and whether discount needs to be prorated separately or
 * is already netted out. Formulas are reverse-engineered and verified
 * against real ERP order data (see refundMath.ts) except price match,
 * which is an unverified default pending business confirmation.
 */
export default function RefundCalc() {
  const [platform, setPlatform] = useState<Platform>('shopify');

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Refund Calculator</h3>

      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPlatform(p.key)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              platform === p.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {platform === 'shopify' && <ShopifyPanel />}
      {platform === 'amazon' && <AmazonPanel />}
      {platform === 'ebay' && <EbayPanel />}
      {platform === 'pricematch' && <PriceMatchPanel />}
    </div>
  );
}

/** Add/remove/edit rows for a partial-quantity, multi-item refund. */
function LineItemsTable({
  rows,
  setRows,
}: {
  rows: RefundLineItem[];
  setRows: (rows: RefundLineItem[]) => void;
}) {
  function updateName(id: number, value: string) {
    setRows(rows.map((r) => (r.id === id ? { ...r, name: value } : r)));
  }

  function updateNumber(id: number, field: 'unitPrice' | 'orderQty' | 'refundQty', value: string) {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: Math.max(0, num(value)) } : r)));
  }

  function addRow() {
    setRows([...rows, emptyRow()]);
  }

  function removeRow(id: number) {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Line items</span>
        <button
          onClick={addRow}
          className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:brightness-110"
        >
          + Add item
        </button>
      </div>
      <div className="grid grid-cols-[1fr_90px_70px_90px_28px] gap-2 text-[10px] text-muted-foreground uppercase tracking-wide px-1">
        <span>Item</span>
        <span>Unit price</span>
        <span>Order qty</span>
        <span>Refund qty</span>
        <span />
      </div>
      {rows.map((row) => (
        <div key={row.id} className="grid grid-cols-[1fr_90px_70px_90px_28px] gap-2 items-center">
          <input
            type="text"
            placeholder="Product name"
            value={row.name}
            onChange={(e) => updateName(row.id, e.target.value)}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="0.00"
            value={row.unitPrice || ''}
            onChange={(e) => updateNumber(row.id, 'unitPrice', e.target.value)}
            className={inputClass}
          />
          <input
            type="number"
            min="1"
            value={row.orderQty}
            onChange={(e) => updateNumber(row.id, 'orderQty', e.target.value)}
            className={inputClass}
          />
          <input
            type="number"
            min="0"
            value={row.refundQty}
            onChange={(e) => updateNumber(row.id, 'refundQty', e.target.value)}
            className={inputClass}
          />
          <button
            onClick={() => removeRow(row.id)}
            disabled={rows.length <= 1}
            className="text-destructive hover:underline disabled:opacity-30 text-xs"
          >
            Del
          </button>
        </div>
      ))}
    </div>
  );
}

function RefundBreakdown({
  results,
  showTax,
  showDiscount,
  extraShipping = 0,
}: {
  results: ReturnType<typeof computeLineRefunds>;
  showTax: boolean;
  showDiscount: boolean;
  /** Shipping added on top when refunding the full order, not per-line. */
  extraShipping?: number;
}) {
  const total = sumRefunds(results) + extraShipping;
  return (
    <div className="space-y-2 text-xs border-t border-border pt-3 tabular-nums">
      <p className="text-muted-foreground font-medium">Refund breakdown</p>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground border-b border-border">
            <th className="text-left py-1">Item</th>
            <th className="text-right py-1">Line total</th>
            {showTax && <th className="text-right py-1">+ Tax</th>}
            {showDiscount && <th className="text-right py-1">− Discount</th>}
            <th className="text-right py-1">Refund</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.id} className="border-b border-border/50">
              <td className="py-1 text-foreground">{r.name}</td>
              <td className="text-right py-1 text-muted-foreground">${r.lineTotal.toFixed(2)}</td>
              {showTax && <td className="text-right py-1 text-success">+${r.tax.toFixed(2)}</td>}
              {showDiscount && (
                <td className="text-right py-1 text-destructive">-${r.discountShare.toFixed(2)}</td>
              )}
              <td className="text-right py-1 text-foreground font-medium">${r.refund.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {extraShipping > 0 && (
        <div className="flex items-center justify-between text-muted-foreground">
          <span>+ Shipping</span>
          <span>${extraShipping.toFixed(2)}</span>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-xs text-muted-foreground font-medium">Refund amount</span>
        <span className="text-lg font-bold text-foreground">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

function ShippingField({
  shipping,
  setShipping,
  includeShipping,
  setIncludeShipping,
}: {
  shipping: string;
  setShipping: (v: string) => void;
  includeShipping: boolean;
  setIncludeShipping: (v: boolean) => void;
}) {
  return (
    <div className="space-y-1">
      <label className={labelClass}>Shipping amount ($)</label>
      <input
        type="number"
        placeholder="0.00"
        value={shipping}
        onChange={(e) => setShipping(e.target.value)}
        className={inputClass}
      />
      <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer pt-0.5">
        <input
          type="checkbox"
          checked={includeShipping}
          onChange={(e) => setIncludeShipping(e.target.checked)}
          className="accent-primary"
        />
        Refunding shipping too (full cancellation)
      </label>
    </div>
  );
}

function ShopifyPanel() {
  const [market, setMarket] = useState<ShopifyMarket>('US');
  const [rows, setRows] = useState<RefundLineItem[]>([emptyRow()]);
  const [taxAmount, setTaxAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [shipping, setShipping] = useState('');
  const [includeShipping, setIncludeShipping] = useState(false);

  const marketInfo = SHOPIFY_MARKETS.find((m) => m.key === market)!;
  const isOther = market === 'OTHER';

  const results = useMemo(
    () =>
      computeLineRefunds(rows, {
        taxAmount: num(taxAmount),
        discount: num(discount),
        addTax: marketInfo.additive,
        subtractDiscount: true,
      }),
    [rows, taxAmount, discount, marketInfo.additive]
  );

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className={labelClass}>Market</label>
        <select
          value={market}
          onChange={(e) => setMarket(e.target.value as ShopifyMarket)}
          className={inputClass}
        >
          {SHOPIFY_MARKETS.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {isOther ? (
        <p className="text-xs text-warning bg-warning/10 border border-warning/30 rounded-lg p-2.5">
          This market isn&apos;t confirmed. Check a real order first: does Payment Amount =
          Price + Tax (use the US/CA formula), or Payment Amount = Price alone (use the DE/FR
          formula)? Don&apos;t guess — flag it for a human to verify.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {marketInfo.additive
            ? 'Tax-exclusive market: tax is charged on top and added back into the refund.'
            : 'Tax-inclusive market: tax is already baked into the item price, not added again.'}
        </p>
      )}

      <LineItemsTable rows={rows} setRows={setRows} />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Tax amount ($)</label>
          <input
            type="number"
            placeholder="0.00"
            value={taxAmount}
            onChange={(e) => setTaxAmount(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Discount ($)</label>
          <input
            type="number"
            placeholder="0.00"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className={inputClass}
          />
        </div>
        <ShippingField
          shipping={shipping}
          setShipping={setShipping}
          includeShipping={includeShipping}
          setIncludeShipping={setIncludeShipping}
        />
      </div>

      {orderItemTotal(rows) > 0 && !isOther && (
        <RefundBreakdown
          results={results}
          showTax={marketInfo.additive}
          showDiscount
          extraShipping={includeShipping ? num(shipping) : 0}
        />
      )}
    </div>
  );
}

function AmazonPanel() {
  const [rows, setRows] = useState<RefundLineItem[]>([emptyRow()]);
  const [taxAmount, setTaxAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [shipping, setShipping] = useState('');

  const results = useMemo(
    () =>
      computeLineRefunds(rows, {
        taxAmount: num(taxAmount),
        discount: num(discount),
        addTax: false,
        subtractDiscount: true,
      }),
    [rows, taxAmount, discount]
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Confirmed across JP, DE, IT storefronts: item price is already tax-inclusive, and
        shipping is never added to the refund.
      </p>

      <LineItemsTable rows={rows} setRows={setRows} />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Tax amount ($)</label>
          <input
            type="number"
            placeholder="0.00"
            value={taxAmount}
            onChange={(e) => setTaxAmount(e.target.value)}
            className={inputClass}
          />
          <p className="text-[10px] text-muted-foreground">Reference only — not used below.</p>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Discount ($)</label>
          <input
            type="number"
            placeholder="0.00"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Shipping amount ($)</label>
          <input
            type="number"
            placeholder="0.00"
            value={shipping}
            onChange={(e) => setShipping(e.target.value)}
            className={inputClass}
          />
          <p className="text-[10px] text-muted-foreground">Reference only — never refunded.</p>
        </div>
      </div>

      {orderItemTotal(rows) > 0 && <RefundBreakdown results={results} showTax={false} showDiscount />}
    </div>
  );
}

function EbayPanel() {
  const [mode, setMode] = useState<EbayMode>('additive');
  const [rows, setRows] = useState<RefundLineItem[]>([emptyRow()]);
  const [taxAmount, setTaxAmount] = useState('');
  const [shipping, setShipping] = useState('');
  const [includeShipping, setIncludeShipping] = useState(false);

  const results = useMemo(
    () =>
      computeLineRefunds(rows, {
        taxAmount: num(taxAmount),
        discount: 0,
        addTax: mode === 'additive',
        subtractDiscount: false,
      }),
    [rows, taxAmount, mode]
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-warning bg-warning/10 border border-warning/30 rounded-lg p-2.5">
        Unresolved: our ERP data shows eBay behaves additively (like Shopify US/CA), but
        Seller Hub&apos;s own refund UI may work differently. Confirm with the business which
        one CS should actually use — pick the formula that matches how this refund is being
        processed.
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => setMode('additive')}
          className={`flex-1 text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
            mode === 'additive'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'
          }`}
        >
          Additive (ERP data)
        </button>
        <button
          onClick={() => setMode('taxbaked')}
          className={`flex-1 text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
            mode === 'taxbaked'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'
          }`}
        >
          Tax-baked (Seller Hub-style)
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Discount isn&apos;t entered separately — eBay&apos;s Order Sale Price already comes net
        of any discount, so subtracting it again would double-count it.
      </p>

      <LineItemsTable rows={rows} setRows={setRows} />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Tax amount ($)</label>
          <input
            type="number"
            placeholder="0.00"
            value={taxAmount}
            onChange={(e) => setTaxAmount(e.target.value)}
            className={inputClass}
            disabled={mode === 'taxbaked'}
          />
          {mode === 'taxbaked' && (
            <p className="text-[10px] text-muted-foreground">Not used — tax already in item price.</p>
          )}
        </div>
        <ShippingField
          shipping={shipping}
          setShipping={setShipping}
          includeShipping={includeShipping}
          setIncludeShipping={setIncludeShipping}
        />
      </div>

      {orderItemTotal(rows) > 0 && (
        <RefundBreakdown
          results={results}
          showTax={mode === 'additive'}
          showDiscount={false}
          extraShipping={includeShipping ? num(shipping) : 0}
        />
      )}
    </div>
  );
}

function PriceMatchPanel() {
  const [orderSalePrice, setOrderSalePrice] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [matchedPrice, setMatchedPrice] = useState('');
  const [override, setOverride] = useState('');

  const ready = num(orderSalePrice) > 0 && num(originalPrice) > 0 && num(matchedPrice) > 0;
  const { taxRate, priceDifference, refund } = computePriceMatchRefund({
    orderSalePrice: num(orderSalePrice),
    taxAmount: num(taxAmount),
    originalItemPrice: num(originalPrice),
    matchedPrice: num(matchedPrice),
  });

  const overrideNum = num(override);
  const finalAmount = override.trim() ? overrideNum : refund;

  return (
    <div className="space-y-3">
      <p className="text-xs text-warning bg-warning/10 border border-warning/30 rounded-lg p-2.5">
        Estimated — no confirmed policy or verified order data exists for price match yet.
        This formula is a best-guess default pending business sign-off. Use the override
        below if you have a better number for this case.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Order sale price, tax excl. ($)</label>
          <input
            type="number"
            placeholder="e.g. 179.99"
            value={orderSalePrice}
            onChange={(e) => setOrderSalePrice(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Tax amount ($)</label>
          <input
            type="number"
            placeholder="e.g. 11.34"
            value={taxAmount}
            onChange={(e) => setTaxAmount(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Original item price ($)</label>
          <input
            type="number"
            placeholder="e.g. 179.99"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Matched price ($)</label>
          <input
            type="number"
            placeholder="e.g. 169.99"
            value={matchedPrice}
            onChange={(e) => setMatchedPrice(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {ready && (
        <div className="text-xs text-muted-foreground space-y-1 pt-1 tabular-nums border-t border-border pt-3">
          <div className="flex justify-between">
            <span>Tax rate</span>
            <span>{(taxRate * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Price difference</span>
            <span>${priceDifference.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className={labelClass}>Manual override ($) — optional</label>
        <input
          type="number"
          placeholder="Leave blank to use the estimate above"
          value={override}
          onChange={(e) => setOverride(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground font-medium">
          {override.trim() ? 'Refund amount (manual override)' : 'Refund amount (estimated)'}
        </span>
        <span className="text-lg font-bold text-foreground tabular-nums">
          {ready || override.trim() ? `$${finalAmount.toFixed(2)}` : '$0.00'}
        </span>
      </div>
    </div>
  );
}
