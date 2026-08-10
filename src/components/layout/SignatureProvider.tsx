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
import { useStoredValue } from '@/lib/useStoredValue';
import { getSignature, saveSignature } from '@/lib/actions';
import { suggestSignature } from '@/lib/signature';

interface SignatureContextValue {
  /** Name to sign with: the agent's own choice, else their account first name. */
  signature: string;
  /** What is actually stored — empty until the agent picks a name. */
  saved: string;
  setSignature: (name: string) => void;
}

const SignatureContext = createContext<SignatureContextValue>({
  signature: '',
  saved: '',
  setSignature: () => {},
});

export function useAgentSignature() {
  return useContext(SignatureContext);
}

/**
 * The name appended under every reply's sign-off.
 *
 * Stored per agent in Supabase so it is chosen once and follows them to any
 * browser, and mirrored into localStorage so replies render signed on the
 * first paint rather than flashing unsigned while the server answers. The
 * cache is keyed by user id: support machines get shared, and one agent must
 * never inherit another's name.
 */
export default function SignatureProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [saved, setSaved] = useStoredValue<string>(
    'local',
    `litime-signature:${userId ?? 'anon'}`,
    ''
  );
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || loadedFor === userId) return;
    setLoadedFor(userId);
    // Only a stored name overwrites the cache: an agent who has never chosen
    // one gets an empty result, which should not clear what this browser holds.
    getSignature()
      .then((remote) => {
        if (remote) setSaved(remote);
      })
      .catch(() => {});
  }, [userId, loadedFor, setSaved]);

  const setSignature = useCallback(
    (name: string) => {
      const next = name.trim();
      setSaved(next);
      saveSignature(next).catch(() => {});
    },
    [setSaved]
  );

  const value = useMemo<SignatureContextValue>(
    () => ({
      signature: saved || suggestSignature(session?.user?.name),
      saved,
      setSignature,
    }),
    [saved, session?.user?.name, setSignature]
  );

  return <SignatureContext.Provider value={value}>{children}</SignatureContext.Provider>;
}
