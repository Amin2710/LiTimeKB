'use client';

import { useState } from 'react';

interface BatteryEntry {
  brand: 'LiTime' | 'Redodo' | 'Power Queen';
  model: string;
  dimensions: string;
  weight?: string;
}

interface GroupData {
  group: string;
  bciStandard: string;
  batteries: BatteryEntry[];
}

const BATTERY_DATA: Record<string, GroupData> = {
  'Group 24': {
    group: 'Group 24',
    bciStandard: '10.25" × 6.81" × 8.88"',
    batteries: [
      {
        brand: 'LiTime',
        model: '12V 100Ah Group 24 Smart Bluetooth',
        dimensions: '10.24 × 6.61 × 8.30 in',
        weight: '22.16 lbs',
      },
      {
        brand: 'LiTime',
        model: '12V 100Ah Group 24 Smart Self-Heating',
        dimensions: '10.24 × 6.61 × 8.30 in',
      },
      {
        brand: 'LiTime',
        model: '12V 100Ah Group 24 Basic',
        dimensions: 'BCI Group 24',
      },
      {
        brand: 'LiTime',
        model: '12V 100Ah Group 24 Dual Purpose Marine',
        dimensions: 'BCI Group 24',
      },
      {
        brand: 'Redodo',
        model: '12V 120Ah Group 24 Trolling Motor Bluetooth',
        dimensions: '10.24 × 6.61 × 8.27 in',
        weight: '23.81 lbs',
      },
      {
        brand: 'Redodo',
        model: '12V 100Ah Group 24 Bluetooth',
        dimensions: 'BCI Group 24',
      },
      {
        brand: 'Redodo',
        model: '12V 100Ah Group 24 Basic',
        dimensions: 'BCI Group 24',
      },
      {
        brand: 'Power Queen',
        model: '12V 100Ah Group 24 Smart',
        dimensions: '10.24 × 6.61 × 8.27 in',
        weight: '22.16 lbs',
      },
      {
        brand: 'Power Queen',
        model: '12V 100Ah Group 24 Classic',
        dimensions: 'BCI Group 24',
      },
    ],
  },
  'Group 27': {
    group: 'Group 27',
    bciStandard: '12.06" × 6.81" × 8.88"',
    batteries: [
      {
        brand: 'LiTime',
        model: '12V 100Ah Group 27 Smart Bluetooth',
        dimensions: 'BCI Group 27',
      },
      {
        brand: 'Redodo',
        model: '12V 100Ah Group 27 Dual Purpose',
        dimensions: 'BCI Group 27',
      },
      {
        brand: 'Power Queen',
        model: '12V 125Ah Group 27 Smart',
        dimensions: '12.13 × 6.69 × 8.31 in',
      },
    ],
  },
  'Group 31': {
    group: 'Group 31',
    bciStandard: '13.00" × 6.81" × 9.44"',
    batteries: [
      {
        brand: 'LiTime',
        model: '12V 100Ah ComFlex Smart',
        dimensions: 'L13 × W6.77 × H8.5 in',
      },
      {
        brand: 'LiTime',
        model: '12V 165Ah Bluetooth (Group 31)',
        dimensions: 'L13 × W6.77 × H8.5 in',
      },
      {
        brand: 'LiTime',
        model: '12V 165Ah Dual Purpose Marine (Group 31)',
        dimensions: 'L13 × W6.77 × H8.5 in',
      },
      {
        brand: 'LiTime',
        model: '12V 165Ah Smart Self-Heating (Group 31)',
        dimensions: 'L13 × W6.77 × H8.5 in',
      },
      {
        brand: 'LiTime',
        model: '24V 100Ah Group 31 Marine Bluetooth',
        dimensions: '13.11 × 6.93 × 9.45 in',
      },
      {
        brand: 'LiTime',
        model: '24V 100Ah Group 31 RV Bluetooth',
        dimensions: '13.11 × 6.93 × 9.45 in',
      },
      {
        brand: 'Redodo',
        model: '12V 165Ah Group 31 Bluetooth',
        dimensions: 'L13 × W6.77 × H8.5 in',
      },
      {
        brand: 'Redodo',
        model: '12V 100Ah Group 31 Bluetooth',
        dimensions: 'BCI Group 31',
      },
      {
        brand: 'Redodo',
        model: '12V 100Ah Group 31 Basic',
        dimensions: 'BCI Group 31',
      },
      {
        brand: 'Power Queen',
        model: '12V 100Ah Group 31',
        dimensions: 'L13 × W6.77 × H8.43 in',
        weight: '24.25 lbs',
      },
    ],
  },
};

const GROUPS = Object.keys(BATTERY_DATA);

const BRAND_COLORS: Record<string, string> = {
  LiTime: 'bg-primary/15 text-primary',
  Redodo: 'bg-warning/15 text-warning',
  'Power Queen': 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
};

export default function BatteryDimensions() {
  const [selectedGroup, setSelectedGroup] = useState<string>('Group 24');

  const data = BATTERY_DATA[selectedGroup];

  return (
    <div className="space-y-3">
      {/* Group filter chips */}
      <div className="flex flex-wrap gap-2">
        {GROUPS.map((group) => (
          <button
            key={group}
            onClick={() => setSelectedGroup(group)}
            className={`px-3 py-1.5 min-h-[44px] text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedGroup === group
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* BCI Standard reference */}
      <p className="text-xs text-muted-foreground">
        BCI Standard:{' '}
        <span className="tabular-nums font-medium text-foreground">{data.bciStandard}</span>
      </p>

      {/* Battery cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.batteries.map((battery, i) => (
          <section
            key={i}
            className="rounded-lg border bg-card p-4 border-primary/30"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${BRAND_COLORS[battery.brand]}`}
              >
                {battery.brand}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">{battery.model}</h4>
            <p className="text-xs text-muted-foreground">
              Dimensions:{' '}
              <span className="tabular-nums text-foreground font-medium">{battery.dimensions}</span>
            </p>
            {battery.weight && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Weight:{' '}
                <span className="tabular-nums text-foreground font-medium">{battery.weight}</span>
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
