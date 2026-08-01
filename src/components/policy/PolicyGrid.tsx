'use client';

import { useState } from 'react';

interface PolicyCard {
  title: string;
  border: string;
  items: string[];
}

interface BrandPolicies {
  label: string;
  cards: PolicyCard[];
}

const BRANDS: Record<string, BrandPolicies> = {
  litime: {
    label: 'LiTime',
    cards: [
      {
        title: 'Shipping Policy',
        border: 'border-primary/30',
        items: [
          'Free shipping on all orders to Continental US',
          '1 business day processing; orders before 6PM PST ship same day',
          '2-5 business days delivery via FedEx, UPS, Amazon Logistics',
          'Warehouses in Los Angeles, CA and Dallas, TX',
          'Does NOT ship to Alaska, Hawaii, or Puerto Rico',
          'No PO boxes — valid street address required',
        ],
      },
      {
        title: 'Warranty Periods',
        border: 'border-success/30',
        items: [
          'Batteries (≥20Ah 12V, ≥30Ah 16V/51.2V, ≥25Ah 24V, ≥50Ah 36V, all 48V): 5 years',
          'Charge Controllers: 3 years',
          'Chargers (AC-DC, DC-DC) & Inverters (1000W+): 2 years',
          'Inverter 12V 300W: 1 year',
          'Accessories (sockets, boxes, monitors, busbars, switches, breakers): 1 year',
          'Like-new batteries: 2-3 years; accessories: 1 year',
          'Non-transferable — original consumer purchaser only',
        ],
      },
      {
        title: 'Return & Refund',
        border: 'border-warning/30',
        items: [
          '30-day return window from delivery date',
          'RMA required — write on shipping label, not the box',
          'Full refund within 12 months; pro-rated after (price ÷ warranty months)',
          'Restocking fee if not returned in original condition',
          'LiTime covers return shipping for defects/delays/damage',
          'Otherwise return shipping deducted from refund',
          'Refund processed within 10 business days of receiving item',
        ],
      },
      {
        title: 'Contact & Exclusions',
        border: 'border-muted-foreground/30',
        items: [
          'US/Canada/Australia: service@litime.com',
          'Europe: service.de@litime.com',
          'Japan: service.jp@litime.com',
          'Phone: +1 844-5484-638 | Mon-Sun 6AM-3PM PDT',
          'Non-returnable: custom/branded products, 3rd party purchases',
          'Battery must be charged within 7 days of purchase, then every 3 months',
        ],
      },
    ],
  },
  redodo: {
    label: 'Red Odoo',
    cards: [
      {
        title: 'Shipping Policy',
        border: 'border-primary/30',
        items: [
          'Free shipping on all orders to Continental US',
          '1 business day processing; orders before 6PM (GMT+8) ship same day',
          '2-5 business days delivery via FedEx, UPS',
          'Does NOT ship to Alaska, Hawaii, or Puerto Rico',
          'No PO boxes — valid street address required',
          'Taxes calculated at checkout (varies by region)',
        ],
      },
      {
        title: 'Warranty Periods',
        border: 'border-success/30',
        items: [
          'Batteries (≥20Ah 12V/24V/36V, all 48V, ≥30Ah 51.2V): 5 years',
          '12V 6Ah/10Ah/12Ah: 3 years',
          'Charge Controllers / MPPT: 3 years',
          'Chargers (AC-DC, DC-DC): 2 years',
          'Inverters (1000W+): 2 years; 12V 300W: 1 year',
          'Accessories (socket, box, monitor, breaker, fuse): 1 year',
          'Like-new batteries: 2-3 years; accessories: 1 year',
          'Non-transferable — original purchaser only',
        ],
      },
      {
        title: 'Return & Refund',
        border: 'border-warning/30',
        items: [
          '30-day return window from delivery',
          'Full refund within 12 months; pro-rated after (price ÷ warranty months)',
          'Red Odoo covers return shipping for defects/delays/damage',
          'Otherwise return shipping deducted from refund',
          'Order cancellation: before processing, or refuse package, or return per policy',
          '30-day repair/replacement warranty from receipt of replacement',
        ],
      },
      {
        title: 'Contact & Exclusions',
        border: 'border-muted-foreground/30',
        items: [
          'Email: service@redodopower.com',
          'Phone: +1 (855) 509-2404',
          'Not for life support or medical equipment use',
          'Does not cover misuse, abuse, unauthorized modification, or force majeure',
          'Normal wear and tear, consumable items excluded',
        ],
      },
    ],
  },
  powerqueen: {
    label: 'Power Queen',
    cards: [
      {
        title: 'Shipping Policy',
        border: 'border-primary/30',
        items: [
          'Free shipping on all orders via UPS, FedEx',
          '1-2 business days processing; 2-5 working days delivery',
          '4 warehouses: Los Angeles, CA; Dallas, TX; Duluth, GA; Philadelphia, PA',
          'Nearest warehouse used based on delivery address',
          'No PO boxes — valid street address required',
          'Tracking confirmation email sent with each shipment',
        ],
      },
      {
        title: 'Warranty Periods',
        border: 'border-success/30',
        items: [
          'Batteries (≥20Ah 12V, ≥25Ah 24V, ≥50Ah 36V, all 48V, ≥30Ah 51.2V): 5 years',
          '12V 6Ah/10Ah/12Ah: 3 years',
          'Charge Controllers: 3 years',
          'Chargers (AC-DC, DC-DC): 2 years',
          'Inverters (1000W+): 2 years; 12V 300W: 1 year',
          'Accessories (fuse holder, ANL fuse, strip, box, monitor, etc.): 1 year',
          'Like-new batteries: 2-3 years; accessories: 1 year',
          'Warranty non-transferable; continues under original period after replacement',
        ],
      },
      {
        title: 'Return & Refund',
        border: 'border-warning/30',
        items: [
          '30-day return window from receipt',
          '24-hour response time on return requests',
          'Refund within 3 business days of receiving item',
          'Pre-paid return label provided for defects (photo/video proof required)',
          'Customer pays return shipping for buyer\'s remorse',
          'Refund within 12 hours if cancelled before shipping',
          'Return warehouse: Houston, TX (address provided after contacting support)',
        ],
      },
      {
        title: 'Contact & Exclusions',
        border: 'border-muted-foreground/30',
        items: [
          'US/Canada: service@ipowerqueen.com',
          'Europe: service.de@ipowerqueen.com',
          'Phone: +1 (855) 816-7898 | Mon-Fri 9AM-6PM EST',
          'Outside lower 48 states: warranty applies, but no free return shipping',
          'Does not cover misuse, improper installation, environmental damage, or collision',
          'Must provide photo/video proof for damage claims',
        ],
      },
    ],
  },
};

const ALWAYS_VISIBLE = [
  {
    title: 'Template Naming',
    border: 'border-primary/30',
    items: [
      'Use descriptive subject lines',
      'Include order number in subject',
      'Tag platform source [Amazon/eBay/Shopify]',
      'Reference previous case ID if applicable',
    ],
  },
  {
    title: 'Sanitization Rules',
    border: 'border-muted-foreground/30',
    items: [
      'Remove personal info before forwarding',
      'Scrub email addresses from templates',
      'Do not share internal SOPs externally',
      'Use the return reason codes from the SOP',
    ],
  },
];

export default function PolicyGrid() {
  const [selectedBrand, setSelectedBrand] = useState<string>('litime');

  return (
    <div className="space-y-4">
      {/* Brand selector */}
      <div className="flex items-center gap-1.5">
        {Object.entries(BRANDS).map(([key, brand]) => (
          <button
            key={key}
            onClick={() => setSelectedBrand(key)}
            className={`px-3 py-1.5 min-h-[44px] text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedBrand === key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {brand.label}
          </button>
        ))}
      </div>

      {/* Brand-specific policy cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BRANDS[selectedBrand].cards.map((card) => (
          <section
            key={card.title}
            className={`rounded-lg border bg-card p-4 ${card.border}`}
          >
            <h3 className="text-sm font-semibold text-foreground mb-2">{card.title}</h3>
            <ul className="space-y-1 list-disc list-inside marker:text-primary">
              {card.items.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Always-visible SOP cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ALWAYS_VISIBLE.map((card) => (
          <section
            key={card.title}
            className={`rounded-lg border bg-card p-4 ${card.border}`}
          >
            <h3 className="text-sm font-semibold text-foreground mb-2">{card.title}</h3>
            <ul className="space-y-1 list-disc list-inside marker:text-primary">
              {card.items.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
