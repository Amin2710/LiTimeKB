'use client';

import { useState } from 'react';
import { ERROR_CODES } from '@/data/devices';

interface DeviceGroup {
  key: string;
  label: string;
  category: 'solar-charge-controller' | 'inverter' | 'inverter-charger';
  brand: string;
}

const DEVICE_GROUPS: DeviceGroup[] = [
  // Solar Charge Controllers
  { key: '30A_MPPT', label: '30A MPPT Smart', category: 'solar-charge-controller', brand: 'LiTime' },
  { key: '60A_MPPT', label: '60A MPPT Bluetooth', category: 'solar-charge-controller', brand: 'LiTime' },
  { key: '100A_MPPT', label: '100A MPPT Bluetooth', category: 'solar-charge-controller', brand: 'LiTime' },
  { key: '20A_PWM', label: '20A PWM', category: 'solar-charge-controller', brand: 'LiTime' },
  { key: '20A_PWM_WATERPROOF', label: '20A PWM Waterproof', category: 'solar-charge-controller', brand: 'LiTime' },
  // Inverters
  { key: '1000W_INVERTER', label: '1000W Inverter', category: 'inverter', brand: 'LiTime' },
  { key: '2000W_INVERTER', label: '2000W Inverter', category: 'inverter', brand: 'LiTime' },
  { key: '2000W_ATS_INVERTER', label: '2000W Inverter w/ ATS', category: 'inverter', brand: 'LiTime' },
  { key: '3000W_INVERTER', label: '3000W Inverter', category: 'inverter', brand: 'LiTime' },
  // Inverter Chargers
  { key: '3000W_INVERTER_CHARGER', label: '3000W Inverter Charger', category: 'inverter-charger', brand: 'LiTime' },
  { key: '24V_3000W_INVERTER_CHARGER', label: '24V 3000W Solar IC', category: 'inverter-charger', brand: 'LiTime' },
  { key: '48V_3500W_INVERTER_CHARGER', label: '48V 3500W All-in-One', category: 'inverter-charger', brand: 'LiTime' },
  { key: '48V_5KW_INVERTER_CHARGER', label: '48V 5kW Split Phase', category: 'inverter-charger', brand: 'LiTime' },
];

const CATEGORIES = [
  { key: 'solar-charge-controller', label: 'MPPT / PWM' },
  { key: 'inverter', label: 'Inverters' },
  { key: 'inverter-charger', label: 'Inverter Chargers' },
];

export default function ErrorCodesView() {
  const [selectedCategory, setSelectedCategory] = useState<string>('solar-charge-controller');

  const devicesInCategory = DEVICE_GROUPS.filter((g) => g.category === selectedCategory);
  const [selectedDevice, setSelectedDevice] = useState<string>(devicesInCategory[0]?.key ?? '');

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const devices = DEVICE_GROUPS.filter((g) => g.category === cat);
    if (devices.length > 0 && !devices.some((d) => d.key === selectedDevice)) {
      setSelectedDevice(devices[0].key);
    }
  };

  const codes = ERROR_CODES[selectedDevice] ?? [];
  const deviceInfo = DEVICE_GROUPS.find((g) => g.key === selectedDevice);

  return (
    <div className="space-y-3">
      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={`px-3 py-1.5 min-h-[44px] text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedCategory === cat.key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Device selector chips */}
      <div className="flex flex-wrap gap-2">
        {devicesInCategory.map((device) => (
          <button
            key={device.key}
            onClick={() => setSelectedDevice(device.key)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              selectedDevice === device.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'
            }`}
          >
            {device.brand} {device.label}
            <span className="ml-1 opacity-60">({ERROR_CODES[device.key]?.length ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Device header */}
      {deviceInfo && (
        <p className="text-xs text-muted-foreground">
          {deviceInfo.brand} {deviceInfo.label} — {codes.length} error code
          {codes.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Error codes table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-3 py-2 font-semibold text-foreground w-[120px]">Code</th>
              <th className="text-left px-3 py-2 font-semibold text-foreground">Reason</th>
              <th className="text-left px-3 py-2 font-semibold text-foreground">Solution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {codes.map((code, i) => (
              <tr key={i} className="hover:bg-accent/30">
                <td className="px-3 py-2.5 align-top">
                  <code className="text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    {code.code}
                  </code>
                  {code.note && (
                    <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{code.note}</p>
                  )}
                </td>
                <td className="px-3 py-2.5 align-top text-foreground">{code.reason}</td>
                <td className="px-3 py-2.5 align-top text-muted-foreground">{code.solution}</td>
              </tr>
            ))}
            {codes.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                  No error codes available for this device.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
