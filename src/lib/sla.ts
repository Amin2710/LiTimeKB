// Case stages and the follow-up clock.
//
// Shared by the Case Tracker and the navbar badge so both agree on what
// "needs follow-up" means.

export const STAGES = [
  'Label requested',
  'Label ready — send to CX',
  'Sent to CX — awaiting return',
  'Product returned — confirmed',
  'Refund/replacement requested',
  'Replacement — awaiting tracking',
  'Tracking sent',
  'Awaiting cancellation',
  'Cancelled — issue manual refund',
  'Waiting on tech support',
  'Waiting on follower reply',
  'Done',
];

/** Hours a case may sit in a stage before it needs chasing. */
export const SLA: Record<string, number> = {
  'Label requested': 48,
  'Label ready — send to CX': 24,
  'Sent to CX — awaiting return': 168,
  'Product returned — confirmed': 24,
  'Refund/replacement requested': 48,
  'Replacement — awaiting tracking': 72,
  'Awaiting cancellation': 72,
  'Cancelled — issue manual refund': 24,
  'Waiting on tech support': 48,
  'Waiting on follower reply': 48,
};

export const TYPES = ['Return → Replacement', 'Return → Refund', 'Cancellation', 'Tech support', 'Other'];
export const PLATFORMS = ['Amazon', 'eBay', 'Shopify', 'Other'];

const HOUR_MS = 3.6e6;

export interface StagedCase {
  stage: string;
  stage_since: number;
}

export function isOverdue(c: StagedCase, now: number = Date.now()): boolean {
  if (c.stage === 'Done') return false;
  const limit = SLA[c.stage];
  if (!limit) return false;
  return now - c.stage_since > limit * HOUR_MS;
}

export function countStats(cases: StagedCase[], now: number = Date.now()) {
  let active = 0;
  let overdue = 0;
  for (const c of cases) {
    if (c.stage !== 'Done') active++;
    if (isOverdue(c, now)) overdue++;
  }
  return { active, overdue };
}

export function fmtAge(ms: number): string {
  const hours = ms / HOUR_MS;
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}
