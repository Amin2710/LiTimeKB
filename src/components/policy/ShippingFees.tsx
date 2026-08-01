'use client';

import { useState } from 'react';
import { SHIP, SHIPTIMES } from '@/data/ship';

const REGION_NAMES: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  UK: 'United Kingdom',
  AU: 'Australia',
  EU: 'European Union',
};

export default function ShippingFees() {
  const [openRegion, setOpenRegion] = useState<string | null>(null);

  const regions = Object.keys(SHIP).filter((k) => k !== 'EU_zones');

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Return Shipping Fees</h3>
      <p className="text-xs text-muted-foreground">{SHIPTIMES}</p>

      <div className="space-y-2">
        {regions.map((region) => {
          const entries = SHIP[region] as Array<[string, number | number[]]>;
          const isEU = region === 'EU';
          return (
            <div
              key={region}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenRegion(openRegion === region ? null : region)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors"
              >
                <span className="text-sm font-semibold text-foreground">
                  {REGION_NAMES[region] || region}
                </span>
                <svg
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    openRegion === region ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {openRegion === region && (
                <div className="border-t border-border p-3">
                  {isEU ? (
                    <div className="space-y-3">
                      {/* Zone reference header */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 pb-2 border-b border-border">
                        {(SHIP as any).EU_zones.map((zone: string, idx: number) => (
                          <div key={idx} className="text-[11px] leading-snug bg-muted/30 rounded px-2 py-1">
                            <span className="font-semibold text-foreground">Zone {idx + 1}</span>
                            <span className="text-muted-foreground"> — {zone}</span>
                          </div>
                        ))}
                      </div>

                      {(entries as Array<[string, number[]]>).map(([model, fees]) => (
                        <details key={model} className="group">
                          <summary className="text-xs text-foreground cursor-pointer hover:text-primary">
                            {model} — ${fees[0]}–${fees[fees.length - 1]}
                          </summary>
                          <div className="mt-2 space-y-1 ml-3">
                            {fees.map((fee, idx) => (
                              <p key={idx} className="text-xs text-muted-foreground">
                                Zone {idx + 1}: ${fee}
                              </p>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-muted-foreground border-b border-border">
                          <th className="text-left py-1 pr-2">Model</th>
                          <th className="text-right py-1">Fee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(entries as Array<[string, number]>).map(([model, fee]) => (
                          <tr key={model} className="border-b border-border/50">
                            <td className="py-1.5 pr-2 text-foreground">{model}</td>
                            <td className="text-right py-1.5 text-muted-foreground">
                              ${fee}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
