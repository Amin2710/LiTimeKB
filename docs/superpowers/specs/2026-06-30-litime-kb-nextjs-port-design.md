# LiTime CS Knowledge Base — Next.js Port & Auth Design

## Overview

Port the existing single-file Litime CS Knowledge Base HTML site into a Next.js 16 application, reusing the existing Supabase database and `@callnovo.net` agent credentials from the Agent Portal project. Add per-user authentication, light/dark theme, brand logo dropdown, and server-side Case Tracker storage.

## 1. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 16, App Router, Turbopack | Matches Agent Portal; Vercel-native |
| Auth | NextAuth v5 beta + Credentials provider, JWT strategy | Reuses existing `verify_agent_password` RPC; no Supabase Auth migration |
| Database | Same Supabase project as Agent Portal | Add `cases` and `user_preferences` tables; no new DB |
| ORM | None (direct Supabase via Server Actions) | Simple CRUD on 2 tables + existing RPCs — Prisma adds unnecessary layer |
| UI | Tailwind CSS v4 + shadcn/ui | Consistent with Agent Portal |
| Hosting | Vercel (separate project) | Auto-deploy from GitHub |
| Git | Public repo: `Ahmed-Elsaeh/litime-cs-knowledge-base` | New public repository |

## 2. Architecture

### 2.1 Project Structure

```
D:/litime-cs-knowledge-base/
├── src/
│   ├── app/
│   │   ├── layout.tsx              — Root layout: Navbar, SessionProvider, ThemeProvider
│   │   ├── page.tsx                — Main page with 6-tab interface (search params: ?tab=)
│   │   ├── login/page.tsx          — Login form (matches Agent Portal pattern)
│   │   ├── change-password/page.tsx — Password change (Server Action + getToken)
│   │   └── api/auth/[...nextauth]/route.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          — Brand logo dropdown + tab bar + theme toggle + sign out
│   │   │   ├── ThemeToggle.tsx     — Light/dark switch (reused from Agent Portal pattern)
│   │   │   └── SessionProvider.tsx
│   │   ├── kb/
│   │   │   ├── AccordionView.tsx   — KB/Email/Troubleshoot accordion (searchable, category panels)
│   │   │   ├── CategoryPanel.tsx   — Collapsible category with sub-grouping
│   │   │   └── Card.tsx            — Individual entry card with copy button
│   │   ├── orient/
│   │   │   └── OrientationView.tsx — 97 SKU lookup with color-coded verdicts
│   │   ├── policy/
│   │   │   ├── PolicyGrid.tsx      — Policy summary grid
│   │   │   ├── OrderRefundCalc.tsx — DataX-mirror calculator
│   │   │   ├── DepreciationCalc.tsx — Multi-item depreciation
│   │   │   ├── PriceMatchCalc.tsx  — Price difference calc
│   │   │   └── ShippingFees.tsx    — Banded fee tables by region
│   │   └── tracker/
│   │       └── CaseTracker.tsx     — Full case tracker (auth-gated, Supabase-backed)
│   ├── lib/
│   │   ├── auth.ts                 — NextAuth config (Credentials provider, JWT callbacks)
│   │   ├── auth-helpers.ts         — Server Action helpers (getToken with secureCookie: true)
│   │   └── supabase.ts             — Supabase client (service-role for Server Actions)
│   └── data/                       — Static KB data as TypeScript modules
│       ├── kb.ts                   — 10 categories, ~180 entries
│       ├── email.ts                — 9 categories, 46 templates
│       ├── orient.ts               — 97 orientation records
│       ├── ship.ts                 — Return shipping fees by region
│       └── icons.ts                — SVG path strings per category
├── public/
│   └── (logo images)
└── .env.local
```

### 2.2 Tab System

Single page with URL search params: `/?tab=kb` | `/?tab=email` | `/?tab=troubleshoot` | `/?tab=orient` | `/?tab=policy` | `/?tab=tracker`. Default is `kb`.

The tab bar in the Navbar updates the query param. Each tab renders its corresponding component. This preserves the current single-page feel while adding URL shareability and back-button support.

## 3. Auth & Data Flow

### 3.1 Authentication (reuses Agent Portal's RPC)

- NextAuth v5 Credentials provider calls `verify_agent_password(p_email, p_password)` RPC
- Auto-creates new agents with `password123` for first-time `@callnovo.net` emails
- JWT session includes `agent_id`, `email`, `name`, `mustChangePassword`
- Login flow redirects to `/change-password` if `mustChangePassword` is true
- Server Actions use `getToken({ secureCookie: true })` pattern (not `auth()` in API routes)

### 3.2 RLS Limitation & Workaround

Since we use NextAuth (custom `agents` table) rather than Supabase Auth, `auth.uid()` won't work for RLS. Instead:

- **Server Actions** use Supabase service-role key (server-side only, never exposed to client)
- **Client-side reads** go through Next.js Server Actions, not direct Supabase queries
- The agent's ID comes from the NextAuth JWT session (`session.user.id`)

### 3.3 New Database Tables

```sql
-- Cases (replaces localStorage)
CREATE TABLE cases (
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

-- User preferences (theme, etc.)
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES agents(agent_id),
  theme TEXT DEFAULT 'dark',
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.4 Case Tracker Data Flow

| Operation | Mechanism |
|-----------|-----------|
| Load cases on tab visit | Server Action: `SELECT * FROM cases WHERE user_id = $1` |
| Save case (add/update) | Server Action: `UPSERT INTO cases` with user_id |
| Delete case | Server Action: `DELETE FROM cases WHERE id = $1 AND user_id = $2` |
| Export (JSON download) | Client-side: JSON.stringify of in-memory array (same as current) |
| Import (JSON upload) | Client-side: parse file, merge, then Server Action to persist |

## 4. UI Changes

### 4.1 Light/Dark Mode

- Theme stored in `user_preferences.theme` for logged-in users
- Fallback to `localStorage` when not authenticated
- Toggle button in navbar (sun/moon icon)
- `<html>` class toggles `dark` class (Tailwind dark mode)
- On login, load saved preference from DB
- Default: `dark` (matches current site's dark navy theme)

### 4.2 Brand Logo Dropdown

- Current logo area becomes a dropdown button
- Three items: **LiTime** (litime.com), **Red Odoo** (redodopower.com), **Power Queen** (ipowerqueen.com)
- Each opens in a new tab
- Shows chevron/arrow indicator for dropdown
- Styled consistently with the dark theme

### 4.3 Case Tracker Visibility Fix

Add `$('#trackerview').classList.add('hidden')` to `render()`, `renderOrient()`, and `renderPolicy()` in the current HTML. In the Next.js port, the tab components won't mount the Case Tracker at all when not on the tracker tab.

### 4.4 Retention Tracker Link

Update the link from current value to:
`https://docs.google.com/spreadsheets/d/1BOa1aZDGDYAWRyfgQed6Rwoz_8zww__X1J7BPqgyTcY/edit?gid=0#gid=0`

## 5. KB Data Migration

The 180+ KB entries, 46 email templates, 97 orientation records, and shipping fees are currently embedded as a single `const KB=...` JSON line in the HTML. These will be migrated into TypeScript modules in `src/data/`.

**Process:**
1. Extract the JSON from the HTML data line
2. Split into separate files by category (makes edits easier than the single-line JSON)
3. Type the data structures with TypeScript interfaces
4. Import the data modules in components

No database storage needed for KB content — it's static reference material that changes infrequently. When it changes, the Python build pipeline can still generate the data files, just targeting `.ts` instead of inline JSON.

## 6. Verification Plan

1. **Auth flow:** Login with `@callnovo.net` credentials → redirected to KB → session persists across refresh
2. **Tab switching:** All 6 tabs render correctly, no content leaks between tabs
3. **Case Tracker:** Add/edit/delete cases, data persists in Supabase (not localStorage)
4. **Multi-device:** Log in on two devices, cases appear on both
5. **Theme:** Toggle light/dark → persists across refresh → persists across devices
6. **Logo dropdown:** Click brand → opens correct URL in new tab
7. **Export/Import:** Download JSON, re-import, cases merge correctly
8. **Build:** `npm run build` completes with no TypeScript errors

## 7. Open Questions (to confirm before implementation)

- GitHub org: Is the repo under your personal account (`Ahmed-Elsaeh`) or an org?
- Should we keep the existing Python build pipeline (`kb_data.py`, etc.) for future content updates, or migrate content editing to the TypeScript files directly?
