// Refund math for the multi-platform calculator, kept separate from the UI
// so the formulas can be read and checked on their own.
//
// Formulas below were reverse-engineered and numerically verified against
// real ERP order data (Shopify tax-exclusive and tax-inclusive markets,
// Amazon, eBay). computePriceMatchRefund is the one exception: an
// unverified best-guess default pending business sign-off, surfaced as a
// caveat in the UI rather than presented with the same confidence as the
// others.

export interface RefundLineItem {
  id: number;
  name: string;
  unitPrice: number;
  /** Total quantity of this item in the original order (not just the refund). */
  orderQty: number;
  /** Quantity being refunded now — may be less than orderQty. */
  refundQty: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** "Order Sale Price (Tax Excl.)" — the base every tax rate and discount share is prorated against. */
export function orderItemTotal(rows: RefundLineItem[]): number {
  return rows.reduce((sum, r) => sum + r.unitPrice * r.orderQty, 0);
}

export interface LineRefundResult {
  id: number;
  name: string;
  lineTotal: number;
  tax: number;
  discountShare: number;
  refund: number;
}

export interface RefundFormulaOptions {
  taxAmount: number;
  discount: number;
  /** Case 1 / eBay-additive: tax is charged on top and must be added back for a refund. */
  addTax: boolean;
  /** Case 1 / Case 1b / Case 2: discount is subtracted separately. False for eBay, whose
   *  "Order Sale Price" already comes net of discount — subtracting again would double-count it. */
  subtractDiscount: boolean;
}

/**
 * Per-line refund breakdown. Tax and discount are prorated by each line's
 * share of the *full* order (unitPrice x orderQty / orderItemTotal), then
 * applied only to the quantity actually being refunded — so refunding 1 of
 * 3 units gets 1/3 of that line's fair share of tax/discount, not the
 * line's full share.
 */
export function computeLineRefunds(
  rows: RefundLineItem[],
  opts: RefundFormulaOptions
): LineRefundResult[] {
  const base = orderItemTotal(rows);
  const taxRate = base > 0 ? opts.taxAmount / base : 0;

  return rows.map((r) => {
    const lineTotal = r.unitPrice * r.refundQty;
    const tax = opts.addTax ? round2(lineTotal * taxRate) : 0;
    const discountShare =
      opts.subtractDiscount && base > 0
        ? round2(((r.unitPrice * opts.discount) / base) * r.refundQty)
        : 0;

    return {
      id: r.id,
      name: r.name || 'Unnamed',
      lineTotal: round2(lineTotal),
      tax,
      discountShare,
      refund: round2(lineTotal + tax - discountShare),
    };
  });
}

export function sumRefunds(results: LineRefundResult[]): number {
  return round2(results.reduce((sum, r) => sum + r.refund, 0));
}

export function computePriceMatchRefund(opts: {
  orderSalePrice: number;
  taxAmount: number;
  originalItemPrice: number;
  matchedPrice: number;
}): { taxRate: number; priceDifference: number; refund: number } {
  const taxRate = opts.orderSalePrice > 0 ? opts.taxAmount / opts.orderSalePrice : 0;
  const priceDifference = opts.originalItemPrice - opts.matchedPrice;
  const refund = round2(priceDifference * (1 + taxRate));
  return { taxRate, priceDifference, refund };
}
