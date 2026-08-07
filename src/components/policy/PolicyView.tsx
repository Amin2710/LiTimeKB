'use client';

import CollapsibleSection from './CollapsibleSection';
import PolicyGrid from './PolicyGrid';
import OrderRefundCalc from './OrderRefundCalc';
import DepreciationCalc from './DepreciationCalc';
import PriceMatchCalc from './PriceMatchCalc';
import ShippingFees from './ShippingFees';

export default function PolicyView() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground font-heading">
        Policies &amp; Tools
      </h2>

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
