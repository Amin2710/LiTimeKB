'use client';

import { useMemo, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { usePlaceholderValues } from './PlaceholderProvider';
import { applyPlaceholders, findPlaceholders, unfilledPlaceholders } from '@/lib/placeholders';
import { useAgentSignature } from '@/components/layout/SignatureProvider';
import { signTemplate } from '@/lib/signature';
import Highlight from './Highlight';

interface TemplateBlockProps {
  template: string;
  /** Search query, for highlighting matches inside the body. */
  query?: string;
}

/**
 * A reply template with its fill-in fields.
 *
 * Templates ship with markers like `[NAME]` and `[PRODUCT]`. Rather than making
 * the agent edit them after pasting, the fields are collected here, substituted
 * live, and the Copy button hands back finished text — refusing to do so
 * silently while markers are still outstanding.
 */
export default function TemplateBlock({ template, query }: TemplateBlockProps) {
  const { values, setValue } = usePlaceholderValues();
  const { signature } = useAgentSignature();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const placeholders = useMemo(() => findPlaceholders(template), [template]);
  // Signed after substitution so the body on screen is exactly what is copied.
  const resolved = useMemo(
    () => signTemplate(applyPlaceholders(template, values), signature),
    [template, values, signature]
  );
  const unfilled = useMemo(() => unfilledPlaceholders(template, values), [template, values]);

  async function write(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      return true;
    } catch {
      toast.error('Could not access the clipboard. Select the text and copy manually.');
      return false;
    }
  }

  async function handleCopy() {
    if (unfilled.length > 0) {
      const names = unfilled.map((p) => p.label).join(', ');
      toast.info(
        `${unfilled.length} placeholder${unfilled.length > 1 ? 's' : ''} still unfilled: ${names}`,
        { label: 'Copy anyway', onClick: () => void write(resolved) }
      );
      return;
    }
    await write(resolved);
  }

  return (
    <div className="space-y-2">
      {placeholders.length > 0 && (
        <div className="flex flex-wrap gap-2 items-end bg-background/60 border border-border rounded-lg p-2">
          {placeholders.map((placeholder) => {
            const id = `ph-${placeholder.key}`;
            const filled = Boolean(values[placeholder.key]?.trim());
            return (
              <div key={placeholder.key} className="flex flex-col gap-1 min-w-[130px] flex-1">
                <label
                  htmlFor={id}
                  className={`text-[10px] uppercase tracking-wide ${
                    filled ? 'text-muted-foreground' : 'text-accent-orange'
                  }`}
                >
                  {placeholder.label}
                </label>
                {placeholder.kind === 'choice' ? (
                  <select
                    id={id}
                    value={values[placeholder.key] ?? ''}
                    onChange={(e) => setValue(placeholder.key, e.target.value)}
                    className="bg-card border border-border text-foreground px-2 py-1.5 rounded-md text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring w-full"
                  >
                    <option value="">Choose…</option>
                    {placeholder.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={id}
                    value={values[placeholder.key] ?? ''}
                    onChange={(e) => setValue(placeholder.key, e.target.value)}
                    placeholder={placeholder.kind === 'amount' ? '0.00' : placeholder.label}
                    inputMode={placeholder.kind === 'amount' ? 'decimal' : undefined}
                    className="bg-card border border-border text-foreground px-2 py-1.5 rounded-md text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring w-full"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="relative">
        <div className="text-sm text-foreground whitespace-pre-wrap bg-card rounded-lg p-3 pr-20 border border-border leading-relaxed">
          <Highlight text={resolved} query={query} />
        </div>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:brightness-110 transition-all"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {unfilled.length > 0 && (
        <p className="text-[11px] text-accent-orange">
          {unfilled.length} placeholder{unfilled.length > 1 ? 's' : ''} left to fill in before sending.
        </p>
      )}
    </div>
  );
}
