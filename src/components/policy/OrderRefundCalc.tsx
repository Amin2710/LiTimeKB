'use client';

import { useState, useRef } from 'react';

interface ProductRow {
  id: number;
  name: string;
  price: string;
  qty: string;
  include: boolean;
}

const REASONS = [
  'Defective',
  'Not as described',
  'Changed mind',
  'Wrong item',
  'Price match',
  'Other',
];

export default function OrderRefundCalc() {
  const [rows, setRows] = useState<ProductRow[]>([
    { id: 1, name: '', price: '', qty: '1', include: true },
  ]);
  const [payment, setPayment] = useState('');
  const [tax, setTax] = useState('');
  const [discount, setDiscount] = useState('');
  const [reason, setReason] = useState('');
  const [isAmazon, setIsAmazon] = useState(false);
  const [returnShipping, setReturnShipping] = useState('0');

  const nextId = useRef(2);

  function addRow() {
    setRows([...rows, { id: nextId.current++, name: '', price: '', qty: '1', include: true }]);
  }

  function removeRow(id: number) {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.id !== id));
  }

  function updateRow(id: number, field: keyof ProductRow, value: string | boolean) {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  const paymentNum = parseFloat(payment || '0');
  const discountNum = parseFloat(discount || '0');
  const taxNum = parseFloat(tax || '0');
  const shippingNum = parseFloat(returnShipping || '0');

  // payment = pre-tax, post-discount subtotal (items - discount)
  // totalBase = pre-discount items total = payment + discount
  const totalBase = paymentNum + discountNum;

  // Only items checked for refund
  const included = rows.filter((r) => r.include && r.price && r.qty);

  const lineRefunds = included.map((r) => {
    const lineTotal = parseFloat(r.price) * parseInt(r.qty);
    const share = totalBase > 0 ? lineTotal / totalBase : 0;
    const discountShare = discountNum * share;
    const taxShare = isAmazon ? 0 : taxNum * share;
    return {
      name: r.name || 'Unnamed',
      lineTotal,
      share,
      discountShare,
      taxShare,
      refund: lineTotal - discountShare + taxShare,
    };
  });

  const totalRefund = lineRefunds.reduce((s, r) => s + r.refund, 0) - shippingNum;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Refund Calculator (DataX Mirror)</h3>

      {/* Products */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Products</span>
          <button
            onClick={addRow}
            className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:brightness-110"
          >
            + Add Row
          </button>
        </div>
        {rows.map((row, idx) => (
          <div key={row.id} className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-5">{idx + 1}.</span>
            <input
              type="text"
              placeholder="Product name"
              value={row.name}
              onChange={(e) => updateRow(row.id, 'name', e.target.value)}
              className="flex-1 p-2 rounded bg-background border border-border text-foreground placeholder-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              type="number"
              placeholder="Price"
              value={row.price}
              onChange={(e) => updateRow(row.id, 'price', e.target.value)}
              className="w-20 p-2 rounded bg-background border border-border text-foreground placeholder-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              type="number"
              placeholder="Qty"
              value={row.qty}
              min="1"
              onChange={(e) => updateRow(row.id, 'qty', e.target.value)}
              className="w-16 p-2 rounded bg-background border border-border text-foreground placeholder-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <label className="flex items-center gap-1 text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={row.include}
                onChange={(e) => updateRow(row.id, 'include', e.target.checked)}
                className="accent-primary"
              />
              Include
            </label>
            <button
              onClick={() => removeRow(row.id)}
              className="text-destructive hover:underline disabled:opacity-30"
              disabled={rows.length <= 1}
            >
              Del
            </button>
          </div>
        ))}
      </div>

      {/* Order details */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-2">
          <label className="block text-muted-foreground">Subtotal (pre-tax, post-discount)</label>
          <input
            type="number"
            placeholder="e.g. 539.99"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="w-full p-2 rounded bg-background border border-border text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-muted-foreground">Tax Amount (order total)</label>
          <input
            type="number"
            placeholder="e.g. 40.00"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            className="w-full p-2 rounded bg-background border border-border text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-muted-foreground">Discount (order total)</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-full p-2 rounded bg-background border border-border text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-muted-foreground">Return Shipping</label>
          <input
            type="number"
            value={returnShipping}
            onChange={(e) => setReturnShipping(e.target.value)}
            className="w-full p-2 rounded bg-background border border-border text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Reason + Amazon toggle */}
      <div className="flex items-center gap-4 text-xs">
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="p-2 rounded bg-background border border-border text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Reason...</option>
          {REASONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-warning cursor-pointer">
          <input
            type="checkbox"
            checked={isAmazon}
            onChange={(e) => setIsAmazon(e.target.checked)}
            className="accent-warning"
          />
          Amazon (exclude tax)
        </label>
      </div>

      {/* Results */}
      {lineRefunds.length > 0 && totalBase > 0 && paymentNum > 0 && (
        <div className="space-y-2 text-xs border-t border-border pt-3 tabular-nums">
          <p className="text-muted-foreground font-medium">Refund Breakdown</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-1">Item</th>
                <th className="text-right py-1">Base</th>
                <th className="text-right py-1">Discount</th>
                <th className="text-right py-1">Tax</th>
                <th className="text-right py-1">Refund</th>
              </tr>
            </thead>
            <tbody>
              {lineRefunds.map((lr, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-1 text-foreground">{lr.name}</td>
                  <td className="text-right py-1 text-muted-foreground">${lr.lineTotal.toFixed(2)}</td>
                  <td className="text-right py-1 text-destructive">-${lr.discountShare.toFixed(2)}</td>
                  <td className="text-right py-1 text-success">+${lr.taxShare.toFixed(2)}</td>
                  <td className="text-right py-1 text-foreground font-medium">${lr.refund.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right text-sm font-bold text-foreground pt-1">
            Total Refund: ${totalRefund.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}
