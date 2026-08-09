# LiTime CS Knowledge Base

Internal knowledge base and case tracker for LiTime / AmpereTime customer support agents.
Next.js App Router + Supabase + NextAuth.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Create `.env.local` with:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `AUTH_SECRET` | NextAuth JWT signing secret |

`next build` fails at the page-data step without these — `src/lib/supabase.ts` reads them at module load.

## Supabase

Existing tables: `cases`, `user_preferences`.
Existing RPCs: `verify_agent_password(p_email, p_password)`, `change_agent_password(p_agent_id, p_old_password, p_new_password)`.

### `search_misses` (required for search-gap reporting)

Searches that return no results are recorded so whoever maintains the KB can see
what agents look for and fail to find. The app degrades silently if this table is
absent — searching still works, nothing is logged.

```sql
create table if not exists search_misses (
  id uuid primary key,
  user_id uuid not null,
  query text not null,
  source text not null,
  created bigint not null
);

create index if not exists search_misses_query_idx on search_misses (query);
create index if not exists search_misses_created_idx on search_misses (created desc);
```

Most-wanted missing content:

```sql
select query, count(*) as hits, max(created) as last_seen
from search_misses
group by query
order by hits desc
limit 50;
```

## Agent shortcuts

| Key | Action |
| --- | --- |
| `Ctrl/⌘ + K` | Search everything — KB, templates, troubleshooting, error codes, SKUs |
| `/` | Focus the current tab's search box |
| `↑` `↓` | Step through results |
| `Enter` | Expand the highlighted entry |
| `c` | Copy the highlighted entry's template |
| `Esc` | Clear the search, then drop the cursor |

## Reply templates

Templates carry fill-in markers (`[NAME]`, `[PRODUCT]`, `[refund or replacement]`,
`$XXXX`). The fields above each template are shared across the whole page — an
agent working one ticket types the customer name once and every template they
copy afterwards is already filled. Copy warns before handing over text that still
has markers in it.

Values live in `sessionStorage` (they contain customer details) and are dropped
when the browser session ends. Pins and recents live in `localStorage`, keyed per
agent.
