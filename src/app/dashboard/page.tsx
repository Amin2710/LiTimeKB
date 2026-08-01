'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AccordionView from '@/components/kb/AccordionView';
import OrientationView from '@/components/orient/OrientationView';
import PolicyView from '@/components/policy/PolicyView';
import CaseTracker from '@/components/tracker/CaseTracker';
import BackToTop from '@/components/layout/BackToTop';
import { AccordionSkeleton } from '@/components/layout/TabSkeleton';

function DashboardHome() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'kb';

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
