// Placeholder detection and substitution for reply templates.
//
// Templates in src/data are written with fill-in markers left for the agent:
//   [NAME], [Customer Name], [PRODUCT], [refund or replacement], $XXXXXXXX
// Agents used to hand-edit each one after pasting. These helpers let the UI
// collect the values once and hand back ready-to-send text.

export type PlaceholderKind = 'text' | 'choice' | 'amount';

export interface Placeholder {
  /** Stable key the entered value is stored under. Shared across templates. */
  key: string;
  /** Human label for the input. */
  label: string;
  kind: PlaceholderKind;
  /** For `choice` placeholders: the alternatives offered by the template. */
  options?: string[];
}

/**
 * Bracketed markers (no newline, kept short so prose in brackets isn't caught)
 * plus the run-of-X money marker used in the returns templates.
 */
const TOKEN_RE = /\[[^[\]\n]{1,60}\]|\$X{3,}/g;

/** Splits "refund or replacement" / "refund / replacement" into alternatives. */
const CHOICE_SPLIT_RE = /\s+or\s+|\s*\/\s*/i;

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCase(text: string): string {
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/** Maps one raw token (with its delimiters) to a placeholder descriptor. */
function describe(token: string): Placeholder {
  if (token.startsWith('$')) {
    return { key: 'amount', label: 'Amount', kind: 'amount' };
  }

  const inner = token.slice(1, -1).trim();
  const options = inner
    .split(CHOICE_SPLIT_RE)
    .map((o) => o.trim())
    .filter(Boolean);

  if (options.length > 1) {
    // "refund or replacement" and "refund / replacement" must land on the same
    // key so a choice made on one template carries to the next.
    const canonical = [...options].map((o) => o.toLowerCase()).sort();
    return {
      key: `choice-${slug(canonical.join('-or-'))}`,
      label: options.map(titleCase).join(' / '),
      kind: 'choice',
      options,
    };
  }

  const lower = inner.toLowerCase();
  if (lower.includes('name')) return { key: 'name', label: 'Customer name', kind: 'text' };
  if (lower.includes('product')) return { key: 'product', label: 'Product', kind: 'text' };
  if (lower.includes('order')) return { key: 'order', label: 'Order number', kind: 'text' };
  if (lower.includes('tracking')) return { key: 'tracking', label: 'Tracking number', kind: 'text' };

  return { key: slug(inner) || 'value', label: titleCase(inner), kind: 'text' };
}

/**
 * Every distinct placeholder in `template`, in first-appearance order.
 * Repeats of the same marker collapse into one entry.
 */
export function findPlaceholders(template: string): Placeholder[] {
  if (!template) return [];

  const seen = new Map<string, Placeholder>();
  for (const match of template.matchAll(TOKEN_RE)) {
    const placeholder = describe(match[0]);
    if (!seen.has(placeholder.key)) seen.set(placeholder.key, placeholder);
  }
  return [...seen.values()];
}

function formatAmount(raw: string): string {
  const cleaned = raw.replace(/^\$+/, '').trim();
  return cleaned ? `$${cleaned}` : '';
}

/**
 * Substitutes filled values into `template`. Placeholders with no value are
 * left as-is so the agent can still see what is outstanding.
 */
export function applyPlaceholders(
  template: string,
  values: Record<string, string>
): string {
  if (!template) return template;

  return template.replace(TOKEN_RE, (token) => {
    const placeholder = describe(token);
    const value = values[placeholder.key]?.trim();
    if (!value) return token;
    return placeholder.kind === 'amount' ? formatAmount(value) : value;
  });
}

/** Placeholders still waiting on a value — used to warn before copying. */
export function unfilledPlaceholders(
  template: string,
  values: Record<string, string>
): Placeholder[] {
  return findPlaceholders(template).filter((p) => !values[p.key]?.trim());
}
