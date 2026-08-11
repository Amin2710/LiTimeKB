'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAgentSignature } from './SignatureProvider';
import { signTemplate, suggestSignature } from '@/lib/signature';

/** Stands in for a real template so the agent sees exactly what gets pasted. */
const PREVIEW = 'Best regards,';

export default function SignatureButton() {
  const { data: session } = useSession();
  const { signature, saved, setSignature } = useAgentSignature();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function openDialog() {
    setDraft(saved || suggestSignature(session?.user?.name));
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    inputRef.current?.select();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  function save() {
    setSignature(draft);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={openDialog}
        title={signature ? `Replies are signed "${signature}"` : 'Choose how replies are signed'}
        className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors min-h-[44px]"
      >
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="hidden sm:inline text-xs max-w-[90px] truncate">
          {signature || 'Set signature'}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[18vh] px-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Your signature"
            className="w-full max-w-sm bg-card border border-border rounded-xl shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pt-4 pb-3 space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Your signature</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Added under the sign-off of every reply you copy. Saved to your
                  account, so you only set it once.
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signature-name" className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                  Sign replies as
                </label>
                <input
                  id="signature-name"
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') save();
                  }}
                  placeholder="e.g. Max"
                  className="w-full bg-background border border-border text-foreground px-2.5 py-2 rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                  Preview
                </span>
                <pre className="text-xs text-foreground whitespace-pre-wrap bg-background border border-border rounded-md p-2.5 leading-relaxed font-sans">
                  {signTemplate(PREVIEW, draft) === PREVIEW
                    ? `${PREVIEW}\n(no name yet)`
                    : signTemplate(PREVIEW, draft)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
              <button
                onClick={() => setOpen(false)}
                className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:brightness-110 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
