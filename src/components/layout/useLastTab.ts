'use client';

import { useSession } from 'next-auth/react';
import { useStoredValue } from '@/lib/useStoredValue';

/**
 * The tab an agent last had open, kept per signed-in agent like favorites and
 * recents, so reopening the dashboard doesn't always dump them back on
 * Knowledge Base if that's not where their work actually is.
 */
export function useLastTab() {
  const { data: session } = useSession();
  const userKey = session?.user?.id ?? 'anon';
  return useStoredValue<string>('local', `litime-last-tab:${userKey}`, 'kb');
}
