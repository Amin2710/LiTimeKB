// The agent's own name, appended beneath a template's sign-off.
//
// Templates ship ending at "Best regards," and agents typed their name in by
// hand after pasting. Rather than adding a marker to all 224 of them — and to
// every template written later — the name is appended at render time to any
// template that closes the way a letter does.

/**
 * True when `body` ends the way a letter does: "Best regards,", "Sincerely,".
 * Reference entries in the knowledge base stop mid-sentence instead, and must
 * not pick up a signature.
 */
function endsWithSignOff(body: string): boolean {
  return /,$/.test(body);
}

/** `template` with `signature` on its own line under the sign-off. */
export function signTemplate(template: string, signature: string): string {
  const name = signature.trim();
  if (!template || !name) return template;

  const body = template.replace(/\s+$/, '');
  if (!endsWithSignOff(body)) return template;

  return `${body}\n${name}`;
}

/**
 * The name an agent starts out signing with — the first word of their account
 * name, since replies are signed personally rather than in full. Agents who go
 * by something else (Mahmoud signing as "Max") override it once and it sticks.
 */
export function suggestSignature(accountName?: string | null): string {
  return (accountName ?? '').trim().split(/\s+/)[0] ?? '';
}
