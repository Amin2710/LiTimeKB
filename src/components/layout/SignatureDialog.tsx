'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAgentSignature } from './SignatureProvider';
import { signTemplate, suggestSignature } from '@/lib/signature';

/** Stands in for a real template so the agent sees exactly what gets pasted. */
const PREVIEW = 'Best regards,';

interface SignatureDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * "Your signature" editor, opened from the nav menu.
 *
 * A dialog rather than an inline field: it needs a live preview and a
 * deliberate Save, since the value goes out on every reply an agent copies
 * from this point on.
 */
export default function SignatureDialog({ open, onClose }: SignatureDialogProps) {
  const { data: session } = useSession();
  const { saved, setSignature } = useAgentSignature();

  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(saved || suggestSignature(session?.user?.name));

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // Re-run only on open: the draft should reset each time the dialog opens,
    // not on every keystroke into `saved` while it's closed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [open]);

  if (!open) return null;

  function save() {
    setSignature(draft);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[18vh] px-4"
      onClick={onClose}
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
            onClick={onClose}
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
  );
}
