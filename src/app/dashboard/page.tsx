'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Suspense, useEffect, useRef, useState } from 'react';
import AccordionView from '@/components/kb/AccordionView';
import OrientationView from '@/components/orient/OrientationView';
import PolicyView from '@/components/policy/PolicyView';
import CaseTracker from '@/components/tracker/CaseTracker';
import BackToTop from '@/components/layout/BackToTop';
import { AccordionSkeleton } from '@/components/layout/TabSkeleton';
import { useLastTab } from '@/components/layout/useLastTab';

function DashboardHome() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const explicitTab = searchParams.get('tab');
  const [lastTab, setLastTab] = useLastTab();

  // No ?tab in the URL: send them back to wherever they left off instead of
  // always landing on Knowledge Base. Holds the skeleton until that redirect
  // (or the decision not to bother, because they were already there) lands,
  // so there's no flash of the wrong tab's content first. The decision is
  // made exactly once (decidedRef) and only once the session has resolved:
  // "last tab" is stored per signed-in agent, so reading it while the
  // anon-scoped key is still the active one would risk redirecting again a
  // moment later once the real key loads — yanking someone off content
  // they've already started reading.
  const [redirecting, setRedirecting] = useState(!explicitTab);
  const decidedRef = useRef(false);

  useEffect(() => {
    // A ?tab param is authoritative whenever it's present — including right
    // after our own replace() below lands — so this always wins regardless
    // of whether the lastTab decision further down has already run once.
    if (explicitTab) {
      setRedirecting(false);
      return;
    }
    if (decidedRef.current || status === 'loading') return;
    decidedRef.current = true;
    if (lastTab && lastTab !== 'kb') {
      router.replace(`/dashboard?tab=${lastTab}`);
    } else {
      setRedirecting(false);
    }
  }, [explicitTab, lastTab, status, router]);

  const tab = explicitTab || 'kb';

  // Record whichever tab actually ended up rendered, regardless of how the
  // agent got here — navbar click, a shared deep link, or browser back/forward.
  useEffect(() => {
    if (!redirecting) setLastTab(tab);
  }, [redirecting, tab, setLastTab]);

  if (redirecting) return <AccordionSkeleton />;

  return (
    <>
      {tab === 'kb' && (
        <>
          <AccordionView dataSource="kb" />
        </>
      )}
      {tab === 'email' && <AccordionView dataSource="email" />}
      {tab === 'troubleshoot' && <AccordionView dataSource="troubleshoot" />}
      {tab === 'orient' && <OrientationView />}
      {tab === 'policy' && <PolicyView />}
      {tab === 'tracker' && <CaseTracker />}
    </>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={<AccordionSkeleton />}>
        <DashboardHome />
      </Suspense>
      <BackToTop />
    </>
  );
}
