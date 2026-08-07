'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { getCaseCounts } from '@/lib/actions';
import { countStats, type StagedCase } from '@/lib/sla';

interface CaseStats {
  active: number;
  overdue: number;
}

const ZERO: CaseStats = { active: 0, overdue: 0 };

interface CaseStatsContextValue extends CaseStats {
  /** Re-reads the counts from the server. */
  refresh: () => void;
  /** Lets the tracker publish counts it already has, avoiding a second fetch. */
  setFromCases: (cases: StagedCase[]) => void;
}

const CaseStatsContext = createContext<CaseStatsContextValue>({
  active: 0,
  overdue: 0,
  refresh: () => {},
  setFromCases: () => {},
});

export function useCaseStats() {
  return useContext(CaseStatsContext);
}

/**
 * Case counts for the navbar badge.
 *
 * The overdue count used to be visible only inside the Case Tracker, so an
 * agent reading the KB had no idea a follow-up had gone past its SLA.
 */
export default function CaseStatsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [loaded, setLoaded] = useState<CaseStats>(ZERO);

  // Signed out means zero without having to clear stored state.
  const stats = userId ? loaded : ZERO;

  const refresh = useCallback(() => {
    if (!userId) return;
    getCaseCounts()
      .then(setLoaded)
      .catch(() => {
        // Badge is advisory; leave the last known counts in place.
      });
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Stages age into "overdue" purely with the passage of time, so re-check
  // periodically rather than only on navigation.
  useEffect(() => {
    if (!userId) return;
    const timer = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [userId, refresh]);

  const setFromCases = useCallback((cases: StagedCase[]) => {
    setLoaded(countStats(cases));
  }, []);

  const value = useMemo<CaseStatsContextValue>(
    () => ({ ...stats, refresh, setFromCases }),
    [stats, refresh, setFromCases]
  );

  return <CaseStatsContext.Provider value={value}>{children}</CaseStatsContext.Provider>;
}
