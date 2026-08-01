'use client';

import CollapsibleSection from './CollapsibleSection';
import PolicyGrid from './PolicyGrid';
import OrderRefundCalc from './OrderRefundCalc';
import DepreciationCalc from './DepreciationCalc';
import PriceMatchCalc from './PriceMatchCalc';
import ShippingFees from './ShippingFees';

const RETENTION_URL = 'https://docs.google.com/spreadsheets/d/1wBv1IaIiC3QPxid1ZSQX0fYBX-G4_xe9ZGHO9lyj3gc/edit?gid=0#gid=0';

export default function PolicyView() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground font-heading">
        Policies &amp; Tools
      </h2>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <a
          href={RETENTION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-card border border-border text-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Retention Tracker
        </a>
      </div>

      <CollapsibleSection title="Policy Summary" defaultOpen={true}>
        <PolicyGrid />
      </CollapsibleSection>

      <CollapsibleSection title="Refund Calculator (DataX Mirror)">
        <OrderRefundCalc />
      </CollapsibleSection>

      <CollapsibleSection title="Depreciation Calculator">
        <DepreciationCalc />
      </CollapsibleSection>

      <CollapsibleSection title="Price Match Calculator">
        <PriceMatchCalc />
      </CollapsibleSection>

      <CollapsibleSection title="Return Shipping Fees">
        <ShippingFees />
      </CollapsibleSection>
    </div>
  );
}
