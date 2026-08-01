# LiTime CS Knowledge Base — VS Code Handoff

## Project Overview

Next.js 16 app with Supabase backend (shared DB from Agent Portal), NextAuth v5, Tailwind CSS v4, shadcn/ui. Case tracker, KB search, policy calculators, battery orientation reference — all behind agent login.

## Tech Stack

- **Framework:** Next.js 16 (Turbopack) with App Router
- **Auth:** NextAuth v5 beta, credentials provider, Supabase DB for users
- **Database:** Supabase PostgreSQL (shared with Agent Portal)
- **Styling:** Tailwind CSS v4 with CSS variables, dark mode via `.dark` class
- **UI:** shadcn/ui components, custom Base UI Button
- **Fonts:** Inter (body via `--font-body`), Space Grotesk (headings/mono via `--font-heading`)

## Key Files

| Path | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout, font loading, theme toggle |
| `src/app/page.tsx` | Login page |
| `src/app/dashboard/page.tsx` | Main dashboard with KB, Case Tracker, Policies, Orientation tabs |
| `src/app/change-password/page.tsx` | Forced password change on first login |
| `src/app/globals.css` | CSS variables, theme, Tailwind config, reduced-motion |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth config with Supabase adapter |
| `src/app/api/auth/change-password/route.ts` | Password change API |
| `src/lib/actions.ts` | Server actions for cases CRUD |
| `src/lib/utils.ts` | `cn()` utility |
| `src/components/ui/button.tsx` | Base UI button with CVA variants |
| `src/components/kb/Card.tsx` | KB entry card with expand/collapse, copy, highlight |
| `src/components/kb/CategoryPanel.tsx` | Category accordion panel wrapping Card |
| `src/components/kb/AccordionView.tsx` | Full KB with search, category chips |
| `src/components/tracker/CaseTracker.tsx` | Case Tracker with 12 stages, SLA, filters, export/import |
| `src/components/orient/OrientationView.tsx` | Battery orientation SKU reference |
| `src/components/policy/PolicyGrid.tsx` | Policy links grid |
| `src/components/policy/DepreciationCalc.tsx` | Depreciation calculator |
| `src/components/policy/PriceMatchCalc.tsx` | Price match calculator |
| `src/components/policy/ShippingFees.tsx` | Shipping fee policy |

## Completed UI/UX Pro Max Audit (this session)

1. **Press feedback** — `active:scale-[0.98]` + `translate-y-px` on `<Button>` component
2. **Reduced motion support** — `@media (prefers-reduced-motion: reduce)` in globals.css
3. **Login spinner** — animated SVG spinner on sign-in button during authentication
4. **Password toggles** — eye/eye-off toggle on login password field and change-password page (3 fields)
5. **CaseTracker loading** — spinner + disabled state on Add Case button during submit
6. **Orientation badge icons** — checkmark/dash/X SVG icons on verdict badges for colorblind accessibility
7. **Accordion animation** — smooth expand/collapse via `grid-template-rows` transition on Card and CategoryPanel

## Auth Flow

1. User logs in at `/` with email + password (NextAuth credentials provider)
2. If `must_change_password` flag is set, redirects to `/change-password`
3. After password change, redirects to `/` with `?changed=1` success message
4. On successful login → `/dashboard?tab=kb`
5. API routes use `auth()` middleware; Server Actions use `getToken` with `secureCookie: true`

## Case Tracker Details

- 12 stages with SLA hours (48h for Label requested, 24h for Label ready, etc.)
- Optimistic updates for stage changes, note saves, deletes
- 4 filters: Active, Need follow-up, All, Done
- Search by order number or email
- Export/Import JSON
- Overdue highlighting with orange (`#e8772e`) + gradient background

## Color Tokens

Defined in globals.css using `oklch()`:
- `--primary`: blue tint (`oklch(0.4 0.12 260)`)
- `--success`: green (`oklch(0.627 0.194 149.214)`)
- `--warning`: amber (`oklch(0.681 0.162 75.834)`)
- `--destructive`: red (`oklch(0.577 0.245 27.325)`)
- Radius: `0.625rem` base, scaled via `--radius-sm/md/lg/xl/2xl/3xl/4xl`

## Pending / Not Yet Done

- **Git push** — HTTPS auth not configured in this environment. Push manually:
  ```bash
  git push origin master
  ```
  Vercel auto-deploys from GitHub on push.

## Running Locally

```bash
npm run dev     # http://localhost:3000
npm run build   # Production build
```

## Database

Uses the same Supabase project as Agent Portal. Tables:
- `users` — managed by NextAuth Supabase adapter, has `must_change_password` column
- `cases` — case tracker data, RLS policies restrict by user ID
- `preferences` — user preferences (theme, default tab)
