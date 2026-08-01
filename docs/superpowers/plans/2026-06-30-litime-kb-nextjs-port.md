# LiTime CS Knowledge Base — Next.js Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the single-file Litime CS Knowledge Base HTML site into a Next.js 16 application with shared auth (reusing Agent Portal's Supabase DB), Supabase-backed Case Tracker, light/dark theme, and brand logo dropdown.

**Architecture:** Next.js 16 App Router with NextAuth v5 Credentials auth against existing `verify_agent_password` RPC. Static KB content in TypeScript modules. Case Tracker data in new Supabase tables accessed via Server Actions. Theme per-user in `user_preferences` table.

**Tech Stack:** Next.js 16, Turbopack, Tailwind CSS v4, shadcn/ui, NextAuth v5 beta, Supabase PostgreSQL, Vercel deployment

## Global Constraints

- Must reuse existing Agent Portal's Supabase project (no new database)
- Must reuse existing `verify_agent_password` RPC — no new auth tables
- `@callnovo.net` email restriction on login (enforced by RPC)
- Never expose service-role key to client — Server Actions only
- KB content is static data in TypeScript files, not in DB
- All 6 tabs in a single page with `?tab=` URL search param
- Theme default: dark (matches existing site)
- Brand URLs: LiTime → https://www.litime.com, Red Odoo → https://www.redodopower.com, Power Queen → https://ipowerqueen.com
- Retention tracker link: https://docs.google.com/spreadsheets/d/1BOa1aZDGDYAWRyfgQed6Rwoz_8zww__X1J7BPqgyTcY/edit?gid=0#gid=0

---

### Task 1: Initialize Next.js Project & Dependencies

**Files:**
- Create: `D:/litime-cs-knowledge-base/` (project root)
- Create: `D:/litime-cs-knowledge-base/.env.local`

- [ ] **Step 1: Create Next.js project**

```bash
cd D:/litime-cs-knowledge-base
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm --turbopack
```

- [ ] **Step 2: Install core dependencies**

```bash
npm install next-auth@5.0.0-beta.31 @auth/core @supabase/supabase-js
npm install -D @types/node
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init -d --force
npx shadcn@latest add button dropdown-menu sheet input select card
```

- [ ] **Step 4: Create folder structure**

```bash
mkdir -p src/components/layout src/components/kb src/components/orient src/components/policy src/components/tracker src/lib src/data src/app/login src/app/change-password
```

- [ ] **Step 5: Create `.env.local`**

```env
# Supabase (same project as Agent Portal)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
AUTH_SECRET=your-auth-secret
AUTH_URL=http://localhost:3000
```

- [ ] **Step 6: Verify project builds**

```bash
npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js 16 project with shadcn/ui and dependencies"
```

---

### Task 2: Extract & Migrate KB Data to TypeScript

**Files:** (all in `src/data/`)
- Create: `src/data/types.ts` — shared TypeScript interfaces
- Create: `src/data/kb.ts` — 10 categories, ~180 KB entries
- Create: `src/data/email.ts` — 9 categories, 46 email templates
- Create: `src/data/orient.ts` — 97 orientation records
- Create: `src/data/ship.ts` — return shipping fees by region
- Create: `src/data/icons.ts` — SVG path strings per category name

- [ ] **Step 1: Write data types**

```typescript
// src/data/types.ts
export interface KBEntry {
  sub: string;
  issue: string;
  summary: string;
  template: string;
  note: string;
  link: string;
}
export type KBData = Record<string, KBEntry[]>;

export interface EmailEntry {
  issue: string;
  template: string;
  note: string;
}
export type EmailData = Record<string, EmailEntry[]>;

export interface OrientRecord {
  model: string;
  verdict: 'flex' | 'partial' | 'upright';
  rule: string;
  allowed: string;
  screw: string;
}

export interface ShipFee {
  model: string;
  fee: number;
}
export type ShipData = Record<string, ShipFee[]>;

export interface CaseRecord {
  id: string;
  user_id: string;
  order_number: string;
  email: string;
  platform: string;
  type: string;
  note: string;
  stage: string;
  stage_since: number;
  created: number;
  history: string[];
}

export interface UserPreferences {
  user_id: string;
  theme: 'dark' | 'light';
}
```

- [ ] **Step 2: Extract KB data from HTML**

Read the `const KB=...` data line from `Litime_Knowledge_Base_public.html` (lines 338-339). Parse the JSON and write each category array into `src/data/kb.ts`:

```typescript
// src/data/kb.ts
import { KBData } from './types';

export const KB: KBData = {
  "Index & Routing": [
    {
      sub: "General",
      issue: "Litime Accessories Error Codes",
      summary: "General error codes and solutions",
      template: "See: 'Litime Accessories Error Code' reference doc.",
      note: "",
      link: ""
    },
    // ... remaining entries
  ],
  // ... all 10 categories
};
```

- [ ] **Step 3: Extract EMAIL data from HTML**

Parse the `const EMAIL=...` JSON and write `src/data/email.ts` with the same pattern.

- [ ] **Step 4: Extract ORIENT data from HTML**

Parse the `const ORIENT=...` array and write `src/data/orient.ts`.

- [ ] **Step 5: Extract SHIP data from HTML**

Parse the `const SHIP=...` object and write `src/data/ship.ts`.

- [ ] **Step 6: Extract icons map**

Parse `const ICONS=...` and write `src/data/icons.ts`:

```typescript
// src/data/icons.ts
export const ICONS: Record<string, string> = {
  "Index & Routing": "<svg ...>...</svg>",
  "Product Use & Maintenance": "<svg ...>...</svg>",
  // ...
};
```

- [ ] **Step 7: Troubleshooting data**

In the HTML, `TS` is split from `KB` at runtime. Replicate this in `src/data/kb.ts`:

```typescript
export const TS: KBData = { 'Troubleshooting': KB['Troubleshooting'] };
// Note: KB should NOT include 'Troubleshooting' — same as HTML behavior
```

- [ ] **Step 8: Verify TypeScript compiles**

```bash
npx tsc --noEmit src/data/*.ts
```
Expected: No type errors.

- [ ] **Step 9: Commit**

```bash
git add src/data/
git commit -m "feat: migrate KB data from HTML to TypeScript modules"
```

---

### Task 3: Set Up Auth (NextAuth + Supabase)

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/lib/auth.ts`
- Create: `src/lib/auth-helpers.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/app/change-password/page.tsx`
- Modify: `src/app/layout.tsx` (wrap with SessionProvider)

- [ ] **Step 1: Create Supabase client**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Public client — only use in Server Actions (never in client components)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Anon client — for limited client-side use
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: Create NextAuth config**

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { supabaseAdmin } from './supabase';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const { data, error } = await supabaseAdmin.rpc('verify_agent_password', {
          p_email: credentials.email as string,
          p_password: credentials.password as string,
        });
        if (error || !data?.length) return null;
        const agent = data[0];
        return {
          id: agent.agent_id,
          email: agent.agent_email,
          name: agent.agent_name,
          mustChangePassword: agent.must_change_password,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.mustChangePassword = (user as any).mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).mustChangePassword = token.mustChangePassword;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
});
```

- [ ] **Step 3: Create auth helpers**

```typescript
// src/lib/auth-helpers.ts
import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';

export async function getServerSession() {
  const cookieStore = await cookies();
  return getToken({
    req: { headers: { cookie: cookieStore.toString() } },
    secret: process.env.AUTH_SECRET,
    secureCookie: true,
  });
}
```

- [ ] **Step 4: Create NextAuth route handler**

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth';
export const { GET, POST } = handlers;
```

- [ ] **Step 5: Create login page**

```tsx
// src/app/login/page.tsx
'use client';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const changed = searchParams.get('changed');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) { setError('Invalid email or password'); return; }
    // Check mustChangePassword from session
    const session = await import('next-auth/react').then(m => m.getSession());
    if ((session?.user as any)?.mustChangePassword) {
      router.push('/change-password');
    } else {
      router.push('/?tab=kb');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c1524]">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-8">
        <h1 className="text-2xl font-bold text-white">LiTime CS Knowledge Base</h1>
        {changed === '1' && <p className="text-green-400 text-sm">Password changed successfully. Please sign in.</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input type="email" placeholder="Email (@callnovo.net)" value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-[#111d31] border border-[#23344f] text-white" />
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-[#111d31] border border-[#23344f] text-white" />
        <button type="submit" className="w-full p-3 rounded-lg bg-blue-500 text-white font-bold">
          Sign In
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
```

- [ ] **Step 6: Create change-password page**

```tsx
// src/app/change-password/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Server Action will be created in a dependent step
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
    });
    if (res.ok) router.push('/login?changed=1');
    else setError('Failed to change password');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c1524]">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-8">
        <h1 className="text-2xl font-bold text-white">Change Password</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input type="password" placeholder="Current password" value={oldPw}
          onChange={e => setOldPw(e.target.value)}
          className="w-full p-3 rounded-lg bg-[#111d31] border border-[#23344f] text-white" />
        <input type="password" placeholder="New password" value={newPw}
          onChange={e => setNewPw(e.target.value)}
          className="w-full p-3 rounded-lg bg-[#111d31] border border-[#23344f] text-white" />
        <button type="submit" className="w-full p-3 rounded-lg bg-blue-500 text-white font-bold">
          Change Password
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 7: Wrap layout with SessionProvider**

```tsx
// src/components/layout/SessionProvider.tsx
'use client';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
```

And update `src/app/layout.tsx` to import and wrap with SessionProvider.

- [ ] **Step 8: Verify build**

```bash
npm run build
```
Expected: No TypeScript errors.

- [ ] **Step 9: Commit**

```bash
git add src/lib/ src/app/api/ src/app/login/ src/app/change-password/ src/components/layout/SessionProvider.tsx src/app/layout.tsx
git commit -m "feat: add NextAuth v5 auth with Supabase, login and change-password pages"
```

---

### Task 4: Apply Supabase Database Migrations

**Files:**
- No code files — execute SQL against the shared Supabase project

- [ ] **Step 1: Create cases table**

Using the Supabase MCP tool `apply_migration`:

```sql
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES agents(agent_id),
  order_number TEXT NOT NULL,
  email TEXT NOT NULL,
  platform TEXT DEFAULT '',
  type TEXT DEFAULT '',
  note TEXT DEFAULT '',
  stage TEXT DEFAULT 'Label requested',
  stage_since BIGINT DEFAULT 0,
  created BIGINT DEFAULT 0,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
```

- [ ] **Step 2: Create user_preferences table**

```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES agents(agent_id),
  theme TEXT DEFAULT 'dark',
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

- [ ] **Step 3: Create color scheme column for products if needed**

Check existing schema first — the refund calculator may need product/tax data. If not already present in the DB, skip (calculators are client-side formulaic).

- [ ] **Step 4: Verify tables exist**

```bash
# Use Supabase MCP list_tables to confirm
```

- [ ] **Step 5: Commit**

```bash
git commit --allow-empty -m "feat: add cases and user_preferences tables to Supabase"
```

---

### Task 5: Build Layout Shell — Navbar, Theme, Logo Dropdown

**Files:**
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/ThemeProvider.tsx`
- Create: `src/components/layout/ThemeToggle.tsx`
- Create: `src/components/layout/TabNav.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update globals.css with shadcn theme and dark mode variables**

Configure Tailwind CSS v4 dark mode and add custom CSS variables for the Litime color palette (navy dark theme, electric blue `#3b82f6` accent, emerald `#34d399` accent, orange `#e8772e` brand).

- [ ] **Step 2: Create ThemeProvider**

`src/components/layout/ThemeProvider.tsx`:
- React context that provides `theme` ('dark' | 'light') and `setTheme`
- On mount: checks `localStorage` for saved theme, falls back to `'dark'`
- If user is logged in: fetches `user_preferences` from Server Action
- On theme change: updates `<html>` class, saves to `localStorage`
- If logged in: also saves to Supabase via Server Action

- [ ] **Step 3: Create ThemeToggle**

`src/components/layout/ThemeToggle.tsx`:
- shadcn `Button` with sun/moon icon
- Calls `setTheme()` from ThemeProvider context

- [ ] **Step 4: Create Navbar**

`src/components/layout/Navbar.tsx`:
- **Left section:** Brand logo + chevron dropdown
  - shadcn `DropdownMenu` with 3 items: LiTime, Red Odoo, Power Queen
  - Each opens in `target="_blank"`
  - Active brand shown as current label
- **Center section:** Tab bar (same 6 buttons as current HTML)
  - Highlights active tab based on `?tab=` search param
  - Clicking a tab updates the URL search param
  - Tabs: Knowledge Base, Email Templates, Troubleshooting, Battery Orientation, Policies & Tools, Case Tracker
- **Right section:** ThemeToggle + Sign Out button (when logged in)

- [ ] **Step 5: Update root layout**

`src/app/layout.tsx`:
```tsx
<html lang="en" className="dark" suppressHydrationWarning>
<body className="min-h-screen bg-[#0c1524] text-[#eaf1fb] font-sans">
  <SessionProvider>
    <ThemeProvider>
      <Navbar />
      <main className="wrap max-w-[1180px] mx-auto px-[22px]">
        {children}
      </main>
    </ThemeProvider>
  </SessionProvider>
</body>
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```
Expected: Layout compiles and renders without errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/ src/app/globals.css src/app/layout.tsx
git commit -m "feat: add navbar with brand dropdown, theme toggle, tab navigation"
```

---

### Task 6: Build Main Page & Tab Routing

**Files:**
- Create: `src/app/page.tsx`

- [ ] **Step 1: Create main page with tab routing**

`src/app/page.tsx`:
```tsx
'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AccordionView from '@/components/kb/AccordionView';
import OrientationView from '@/components/orient/OrientationView';
import PolicyView from '@/components/policy/PolicyView';
import CaseTracker from '@/components/tracker/CaseTracker';

function Home() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'kb';

  return (
    <>
      {tab === 'kb' && <AccordionView dataSource="kb" />}
      {tab === 'email' && <AccordionView dataSource="email" />}
      {tab === 'troubleshoot' && <AccordionView dataSource="troubleshoot" />}
      {tab === 'orient' && <OrientationView />}
      {tab === 'policy' && <PolicyView />}
      {tab === 'tracker' && <CaseTracker />}
    </>
  );
}

export default function Page() {
  return <Suspense><Home /></Suspense>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add main page with tab-based routing via search params"
```

---

### Task 7: Build KB Accordion Components

**Files:**
- Create: `src/components/kb/AccordionView.tsx`
- Create: `src/components/kb/CategoryPanel.tsx`
- Create: `src/components/kb/Card.tsx`
- Create: `src/components/kb/AccordionView.tsx` — search bar, category chips, result count

- [ ] **Step 1: Build Card component**

`src/components/kb/Card.tsx` — the individual accordion entry:
- Shows `issue` as title, `summary` as collapsed preview
- Click to expand: shows `template` (with copy button), `note` (if present, amber/policy styling), `link` (if present)
- States: collapsed, expanded, amber (needs confirmation), policy
- Copy button copies `template` text, shows "Copied" feedback for 1.6s

- [ ] **Step 2: Build CategoryPanel component**

`src/components/kb/CategoryPanel.tsx`:
- Collapsible panel with category name, icon, entry count
- Contains sub-group headers for categories with multiple subs
- Contains Card components for each entry
- Only one panel open at a time (accordion behavior)

- [ ] **Step 3: Build AccordionView**

`src/components/kb/AccordionView.tsx`:
- Props: `dataSource: 'kb' | 'email' | 'troubleshoot'`
- Routes to correct dataset (`KB`, `TS`, or `EMAIL`)
- Search bar at top with keyboard shortcut `/` to focus
- Category chip bar (filter by category)
- Result count display
- Renders CategoryPanels filtered by search/category
- Search highlights matches in issue, summary, and template text

- [ ] **Step 4: Verify build**

```bash
npm run build
```
Expected: No TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/kb/
git commit -m "feat: build KB accordion components with search, categories, copy-to-clipboard"
```

---

### Task 8: Build Orientation Tab

**Files:**
- Create: `src/components/orient/OrientationView.tsx`

- [ ] **Step 1: Build OrientationView**

`src/components/orient/OrientationView.tsx`:
- Search bar to filter 97 SKUs
- Color-coded verdict badges: flex (green), partial (amber), upright (red)
- Legend bar showing the 3 verdict types
- Each card shows: model SKU, verdict badge, plain-language rule, allowed/forbidden text, spare screw info
- Warning banner at top about never installing terminals-down

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/orient/
git commit -m "feat: build battery orientation tab with 97 SKU lookup"
```

---

### Task 9: Build Policy Tab (Calculators + Fees)

**Files:**
- Create: `src/components/policy/PolicyView.tsx`
- Create: `src/components/policy/PolicyGrid.tsx`
- Create: `src/components/policy/OrderRefundCalc.tsx`
- Create: `src/components/policy/DepreciationCalc.tsx`
- Create: `src/components/policy/PriceMatchCalc.tsx`
- Create: `src/components/policy/ShippingFees.tsx`

- [ ] **Step 1: Build PolicyGrid**

Patent summary grid showing warranty periods, refund policy rules, template naming rules, and sanitization rules. Green- and amber-bordered cards matching the current HTML's `.pcard` pattern.

- [ ] **Step 2: Build ShippingFees**

Banded fee tables by region: US, CA, UK, AU, EU. Each region is a collapsible band with price tiers. Click a price to see models in that tier. Matches the `feeTable()` HTML function.

- [ ] **Step 3: Build OrderRefundCalc (DataX mirror)**

Two-panel layout:
- Left panel: product rows (name, unit price excl. tax, qty, tick to include, delete button, add row)
- Right panel: Payment Amount, Tax Amount, Discount, Reason dropdown, Amazon toggle
- Math: `line total → discount share → tax share → line refund → sum → return shipping`
- Amazon toggle excludes tax (orange-highlighted label with explanation)

- [ ] **Step 4: Build DepreciationCalc**

Multi-line item depreciation:
- Each row: price, months used, warranty months
- Depreciation = price × (months used ÷ warranty months), only if months used > 12
- Sums across all items
- Tax never refunded

- [ ] **Step 5: Build PriceMatchCalc**

Single-input form:
- Price paid, current lower price, discount already applied
- Refund = max(0, price paid − current price − discount)

- [ ] **Step 6: Build PolicyView**

Tabs to switch between Order Refund / Depreciation / Price-match calculators. Includes retention link section with the new Google Sheets URL.

- [ ] **Step 7: Verify build**

```bash
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add src/components/policy/
git commit -m "feat: build policy tab with 3 refund calculators, shipping fees, retention link"
```

---

### Task 10: Build Case Tracker with Supabase Backend

**Files:**
- Create: `src/components/tracker/CaseTracker.tsx`
- Create: `src/app/actions/cases.ts` — Server Actions for CRUD

- [ ] **Step 1: Create Server Actions for cases**

```typescript
// src/app/actions/cases.ts
'use server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth-helpers';
import { CaseRecord } from '@/data/types';

export async function getCases(): Promise<CaseRecord[]> {
  const session = await getServerSession();
  if (!session?.id) return [];
  const { data } = await supabaseAdmin
    .from('cases')
    .select('*')
    .eq('user_id', session.id);
  return (data || []).map((c: any) => ({
    id: c.id,
    user_id: c.user_id,
    order_number: c.order_number,
    email: c.email,
    platform: c.platform || '',
    type: c.type || '',
    note: c.note || '',
    stage: c.stage || 'Label requested',
    stage_since: c.stage_since || Date.now(),
    created: c.created || Date.now(),
    history: c.history || [],
  }));
}

export async function saveCases(cases: CaseRecord[]) {
  const session = await getServerSession();
  if (!session?.id) throw new Error('Not authenticated');
  
  const records = cases.map(c => ({
    ...c,
    user_id: session.id,
  }));

  const { error } = await supabaseAdmin
    .from('cases')
    .upsert(records, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function deleteCase(id: string) {
  const session = await getServerSession();
  if (!session?.id) throw new Error('Not authenticated');
  
  const { error } = await supabaseAdmin
    .from('cases')
    .delete()
    .eq('id', id)
    .eq('user_id', session.id);
  if (error) throw new Error(error.message);
}

export async function saveThemePreference(theme: 'dark' | 'light') {
  const session = await getServerSession();
  if (!session?.id) return;
  await supabaseAdmin
    .from('user_preferences')
    .upsert({ user_id: session.id, theme, updated_at: new Date().toISOString() });
}

export async function getThemePreference(): Promise<'dark' | 'light' | null> {
  const session = await getServerSession();
  if (!session?.id) return null;
  const { data } = await supabaseAdmin
    .from('user_preferences')
    .select('theme')
    .eq('user_id', session.id)
    .single();
  return (data?.theme as 'dark' | 'light') || null;
}
```

- [ ] **Step 2: Build CaseTracker component**

`src/components/tracker/CaseTracker.tsx`:
- On mount: checks auth session, shows login prompt if not authenticated
- Loads cases from `getCases()` Server Action on mount
- **Header:** Title, subtitle, stats (active count, overdue count)
- **Add form:** Order number, email, platform dropdown (Amazon/eBay/Shopify/Other), type dropdown, note
- **Filter bar:** Active / Need follow-up / All / Done + search input
- **Export button:** Downloads JSON of current cases (same as before)
- **Import button:** File upload → merge into array → `saveCases()`
- **Case rows:** Each shows order, email, platform badge, type badge, age (with overdue flag), stage dropdown, note input, delete button
- Stage change appends to history array
- SLA overdue logic matches current HTML (48h for label requested, 24h for label ready, etc.)

- [ ] **Step 3: Wire auth gate in CaseTracker**

At the top of the component:
```tsx
import { useSession } from 'next-auth/react';

export default function CaseTracker() {
  const { data: session } = useSession();
  
  if (!session) {
    return <div className="p-8 text-center text-[#9fb2cd]">
      <p>Please sign in to use the Case Tracker.</p>
      <a href="/login" className="text-[#3b82f6] underline">Sign In</a>
    </div>;
  }
  // ... rest of component
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/tracker/ src/app/actions/
git commit -m "feat: build auth-gated case tracker with Supabase backend"
```

---

### Task 11: Final Integration & Polish

- [ ] **Step 1: Add loading/empty/error states**

- KB accordion: "No matches" empty state
- Orientation: "No SKU found" empty state  
- Case Tracker: "No cases yet. Add one above." empty state; "Please sign in" unauthenticated state
- Policy calculators: zero-state with instructions
- All pages: error boundary

- [ ] **Step 2: Tune dark mode colors**

Ensure all shadcn components, cards, and inputs look good in both dark and light mode. The current HTML uses specific navy/blues — these should carry over to dark mode fully. Light mode should be clean white/near-white with dark text.

- [ ] **Step 3: Add keyboard shortcuts**

- `/` to focus search bar (matches current HTML)
- `Escape` to clear search

- [ ] **Step 4: Test tab switching end-to-end**

Run the dev server and verify:
- Clicking each tab renders the correct content
- No content leaks between tabs
- URL updates correctly
- Back/forward browser navigation works
- Case Tracker only renders on its tab

- [ ] **Step 5: Test auth flow**

- Login with invalid credentials → error shown
- Login with valid `@callnovo.net` credentials → redirects to KB
- New agent → redirects to change-password
- After password change → redirects to login with success banner

- [ ] **Step 6: Test Case Tracker persistence**

- Add a case → verify it appears after page refresh
- Edit stage → verify it persists
- Delete case → verify it's removed
- Export → verify JSON downloads correctly
- Import → verify cases merge

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: final integration — loading states, polish, keyboard shortcuts"
```

---

### Task 12: GitHub & Vercel Deployment

- [ ] **Step 1: Create GitHub repo and push**

```bash
cd D:/litime-cs-knowledge-base
gh repo create Ahmed-Elsaeh/litime-cs-knowledge-base --public --push --source=.
```

- [ ] **Step 2: Deploy to Vercel**

```bash
cd D:/litime-cs-knowledge-base
npx vercel --prod
```

Or connect via Vercel dashboard: Add New → Project → Import `Ahmed-Elsaeh/litime-cs-knowledge-base`.

- [ ] **Step 3: Set environment variables in Vercel**

In Vercel project settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_SECRET`
- `AUTH_URL` (set to the production URL)

- [ ] **Step 4: Verify production build**

Visit the deployed URL:
- Sign in works
- All 6 tabs render
- Case Tracker saves/loads from Supabase
- Theme persists after login

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: configure Vercel deployment and environment variables"
```

---

## Verification Checklist

- [ ] `npm run build` passes with no TypeScript errors
- [ ] Login with `@callnovo.net` credentials works
- [ ] New agents can change password
- [ ] All 6 tabs render correctly
- [ ] Search/filter works in KB and Orientation tabs
- [ ] Copy-to-clipboard works on KB entries
- [ ] Refund calculators produce correct math
- [ ] Case Tracker: add/edit/delete → persists to Supabase
- [ ] Case Tracker: data visible from another device after login
- [ ] Theme toggle switches light/dark
- [ ] Theme preference persists after page refresh
- [ ] Brand dropdown opens correct URLs in new tabs
- [ ] Export/Import works in Case Tracker
- [ ] `/` keyboard shortcut focuses search
