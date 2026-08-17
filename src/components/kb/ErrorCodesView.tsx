'use client';

import { useEffect, useRef, useState } from 'react';
import { ERROR_CODES } from '@/data/devices';
import { DEVICE_CATEGORIES as CATEGORIES, DEVICE_GROUPS } from '@/data/deviceGroups';
import { getEntryById } from '@/lib/entries';

interface ErrorCodesViewProps {
  /** Index id of a specific code to land on, e.g. from a search deep link. */
  targetId?: string;
}

export default function ErrorCodesView({ targetId }: ErrorCodesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('solar-charge-controller');

  const devicesInCategory = DEVICE_GROUPS.filter((g) => g.category === selectedCategory);
  const [selectedDevice, setSelectedDevice] = useState<string>(devicesInCategory[0]?.key ?? '');
  const [highlightCode, setHighlightCode] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  // A search result for a specific error code otherwise lands on this panel's
  // default device/category, with the code the agent searched for nowhere in
  // view — the same category of bug as the panel starting collapsed.
  useEffect(() => {
    if (!targetId) return;
    const entry = getEntryById(targetId);
    if (!entry || entry.kind !== 'errorcode') return;

    const group = DEVICE_GROUPS.find((g) => `${g.brand} ${g.label}` === entry.sub);
    if (!group) return;

    setSelectedCategory(group.category);
    setSelectedDevice(group.key);
    setHighlightCode(entry.title);
  }, [targetId]);

  useEffect(() => {
    if (!highlightCode) return;
    // Runs after the enclosing panel's own scroll-into-view (350ms), which
    // targets the whole panel rather than this row — firing first would just
    // get overridden by that coarser scroll a moment later.
    const timer = setTimeout(() => {
      rowRefs.current[highlightCode]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
    return () => clearTimeout(timer);
  }, [highlightCode, selectedDevice]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setHighlightCode(null);
    const devices = DEVICE_GROUPS.filter((g) => g.category === cat);
    if (devices.length > 0 && !devices.some((d) => d.key === selectedDevice)) {
      setSelectedDevice(devices[0].key);
    }
  };

  const handleDeviceChange = (deviceKey: string) => {
    setSelectedDevice(deviceKey);
    setHighlightCode(null);
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
            onClick={() => handleDeviceChange(device.key)}
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
              <tr
                key={i}
                ref={(el) => { rowRefs.current[code.code] = el; }}
                className={`hover:bg-accent/30 transition-colors ${
                  highlightCode === code.code ? 'bg-accent-orange/10' : ''
                }`}
              >
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
