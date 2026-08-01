'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (newPw !== confirmPw) {
      setError('Passwords do not match');
      return;
    }
    if (newPw.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
      });

      if (res.ok) {
        router.push('/?changed=1');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to change password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 p-8"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground font-heading">
            Change Password
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            You must change your password before continuing
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center" role="alert">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <label htmlFor="cp-old-pw" className="sr-only">Current password</label>
          <div className="relative">
            <input
              id="cp-old-pw"
              type={showPw.old ? 'text' : 'password'}
              placeholder="Current password"
              value={oldPw}
              onChange={(e) => setOldPw(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full p-3 pr-10 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPw({ ...showPw, old: !showPw.old })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              tabIndex={-1}
              aria-label={showPw.old ? 'Hide password' : 'Show password'}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {showPw.old ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>
          <label htmlFor="cp-new-pw" className="sr-only">New password (min. 8 characters)</label>
          <div className="relative">
            <input
              id="cp-new-pw"
              type={showPw.new ? 'text' : 'password'}
              placeholder="New password (min. 8 characters)"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full p-3 pr-10 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPw({ ...showPw, new: !showPw.new })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              tabIndex={-1}
              aria-label={showPw.new ? 'Hide password' : 'Show password'}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {showPw.new ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>
          <label htmlFor="cp-confirm-pw" className="sr-only">Confirm new password</label>
          <div className="relative">
            <input
              id="cp-confirm-pw"
              type={showPw.confirm ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full p-3 pr-10 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              tabIndex={-1}
              aria-label={showPw.confirm ? 'Hide password' : 'Show password'}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {showPw.confirm ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
