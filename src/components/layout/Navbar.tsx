'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from './ThemeProvider';
import { useAgentSignature } from './SignatureProvider';
import { useFavorites } from './FavoritesProvider';
import SignatureDialog from './SignatureDialog';
import { useCaseStats } from './CaseStatsProvider';
import { useCommandPalette, entryHref } from '@/components/search/CommandPalette';
import { useToast } from '@/components/ui/Toast';
import { getIndex } from '@/lib/entries';

const BRANDS = [
  { label: 'LiTime', url: 'https://www.litime.com' },
  { label: 'Red Odoo', url: 'https://www.redodopower.com' },
  { label: 'Power Queen', url: 'https://ipowerqueen.com' },
];

const TABS = [
  { key: 'kb', label: 'Knowledge Base' },
  { key: 'email', label: 'Email Templates' },
  { key: 'troubleshoot', label: 'Troubleshooting' },
  { key: 'orient', label: 'Battery Orientation' },
  { key: 'policy', label: 'Policies & Tools' },
  { key: 'tracker', label: 'Case Tracker' },
];

function NavInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { overdue } = useCaseStats();
  const { openPalette } = useCommandPalette();
  const { theme, setTheme } = useTheme();
  const { signature } = useAgentSignature();
  const { favorites } = useFavorites();
  const { toast } = useToast();
  const [signatureOpen, setSignatureOpen] = useState(false);
  const activeTab = searchParams.get('tab') || 'kb';
  const hidden = pathname === '/' || pathname === '/change-password';

  const goToTab = useCallback(
    (tab: string) => {
      router.push(`/dashboard?tab=${tab}`);
    },
    [router]
  );

  // Number-key shortcuts for the six tabs. Guarded off whenever the target is
  // an input/textarea/contenteditable so it doesn't fire while typing a case
  // note or a template value.
  useEffect(() => {
    if (hidden) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      const index = Number(e.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < TABS.length) {
        e.preventDefault();
        goToTab(TABS[index].key);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hidden, goToTab]);

  function copyPinnedList() {
    const index = getIndex();
    const origin = window.location.origin;
    const lines = favorites
      .map((id) => index.find((e) => e.id === id))
      .filter((e): e is NonNullable<typeof e> => Boolean(e))
      .map((e) => `${e.title} — ${origin}${entryHref(e)}`);

    if (!lines.length) return;

    navigator.clipboard
      .writeText(lines.join('\n'))
      .then(() => toast.success('Pinned list copied — paste it anywhere to share'))
      .catch(() => toast.error('Could not access the clipboard.'));
  }

  // Hide navbar on login and change-password pages
  if (hidden) {
    return null;
  }

  return (
    <div className="max-w-[1180px] mx-auto px-[22px] flex items-center h-14 gap-4">
      {/* Left: Brand logo dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1.5 text-foreground font-bold text-sm font-heading shrink-0 hover:text-primary transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent-orange">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H11.5C15.2712 4 17.1569 4 18.3284 5.17157C19.5 6.34315 19.5 8.22876 19.5 12C19.5 15.7712 19.5 17.6569 18.3284 18.8284C17.1569 20 15.2712 20 11.5 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12ZM6.63577 8.34438C6.99786 8.14322 7.45446 8.27368 7.65562 8.63577L7 9C7.65562 8.63577 7.65616 8.63675 7.65634 8.63708L7.65711 8.63847L7.65878 8.64152L7.66263 8.64864L7.67226 8.66699C7.67951 8.68106 7.68839 8.69881 7.69863 8.72032C7.71912 8.76335 7.74506 8.82135 7.77448 8.89489C7.83335 9.04206 7.90593 9.251 7.9765 9.52622C8.11776 10.0772 8.25 10.8899 8.25 12C8.25 13.1101 8.11776 13.9228 7.9765 14.4738C7.90593 14.749 7.83335 14.9579 7.77448 15.1051C7.74506 15.1787 7.71912 15.2367 7.69863 15.2797C7.68839 15.3012 7.67951 15.3189 7.67226 15.333L7.66263 15.3514L7.65878 15.3585L7.65711 15.3615L7.65634 15.3629L7.65562 15.3642L7 15C7.65052 15.3614 7.65541 15.3645 7.65562 15.3642C7.45446 15.7263 6.99786 15.8568 6.63577 15.6556C6.27675 15.4562 6.14545 15.0056 6.33933 14.645L6.34434 14.6348C6.35119 14.6204 6.36431 14.5917 6.38177 14.548C6.41665 14.4608 6.46907 14.3135 6.5235 14.1012C6.63224 13.6772 6.75 12.9899 6.75 12C6.75 11.0101 6.63224 10.3228 6.5235 9.89878C6.46907 9.6865 6.41665 9.53919 6.38177 9.45198C6.36431 9.40834 6.35119 9.37962 6.34434 9.36522L6.33933 9.35499C6.14545 8.99441 6.27675 8.54383 6.63577 8.34438ZM11.1556 8.63577C10.9545 8.27368 10.4979 8.14322 10.1358 8.34438C9.77675 8.54383 9.64545 8.99441 9.83933 9.35499L9.84434 9.36522C9.85119 9.37962 9.86431 9.40834 9.88177 9.45198C9.91665 9.53919 9.96907 9.6865 10.0235 9.89878C10.1322 10.3228 10.25 11.0101 10.25 12C10.25 12.9899 10.1322 13.6772 10.0235 14.1012C9.96907 14.3135 9.91665 14.4608 9.88177 14.548C9.86431 14.5917 9.85119 14.6204 9.84434 14.6348L9.83933 14.645C9.64545 15.0056 9.77675 15.4562 10.1358 15.6556C10.4979 15.8568 10.9545 15.7263 11.1556 15.3642L10.5 15C11.1556 15.3642 11.1562 15.3632 11.1563 15.3629L11.1571 15.3615L11.1588 15.3585L11.1626 15.3514L11.1723 15.333C11.1795 15.3189 11.1884 15.3012 11.1986 15.2797C11.2191 15.2367 11.2451 15.1787 11.2745 15.1051C11.3333 14.9579 11.4059 14.749 11.4765 14.4738C11.6178 13.9228 11.75 13.1101 11.75 12C11.75 10.8899 11.6178 10.0772 11.4765 9.52622C11.4059 9.251 11.3333 9.04206 11.2745 8.89489C11.2451 8.82135 11.2191 8.76335 11.1986 8.72032C11.1884 8.69881 11.1795 8.68106 11.1723 8.66699L11.1626 8.64864L11.1588 8.64152L11.1571 8.63847L11.1563 8.63708L11.1556 8.63577ZM10.5002 8.99986C11.1505 8.63861 11.1554 8.63548 11.1556 8.63577L10.5002 8.99986ZM13.6358 8.34438C13.9979 8.14322 14.4545 8.27368 14.6556 8.63577L14 9C14.6556 8.63577 14.6562 8.63675 14.6563 8.63708L14.6571 8.63847L14.6588 8.64152L14.6626 8.64864L14.6723 8.66699C14.6795 8.68106 14.6884 8.69881 14.6986 8.72032C14.7191 8.76335 14.7451 8.82135 14.7745 8.89489C14.8333 9.04206 14.9059 9.251 14.9765 9.52622C15.1178 10.0772 15.25 10.8899 15.25 12C15.25 13.1101 15.1178 13.9228 14.9765 14.4738C14.9059 14.749 14.8333 14.9579 14.7745 15.1051C14.7451 15.1787 14.7191 15.2367 14.6986 15.2797C14.6884 15.3012 14.6795 15.3189 14.6723 15.333L14.6626 15.3514L14.6588 15.3585L14.6571 15.3615L14.6563 15.3629L14.6556 15.3642L14.0024 15.0014C14.6505 15.3614 14.6554 15.3645 14.6556 15.3642C14.4545 15.7263 13.9979 15.8568 13.6358 15.6556C13.2768 15.4562 13.1455 15.0056 13.3393 14.645L13.3443 14.6348C13.3512 14.6204 13.3643 14.5917 13.3818 14.548C13.4167 14.4608 13.4691 14.3135 13.5235 14.1012C13.6322 13.6772 13.75 12.9899 13.75 12C13.75 11.0101 13.6322 10.3228 13.5235 9.89878C13.4691 9.6865 13.4167 9.53919 13.3818 9.45198C13.3643 9.40834 13.3512 9.37962 13.3443 9.36522L13.3393 9.35499C13.1455 8.99441 13.2768 8.54383 13.6358 8.34438Z" fill="currentColor"/>
            <path d="M21.25 14C21.25 14.4142 21.5858 14.75 22 14.75C22.4142 14.75 22.75 14.4142 22.75 14V10C22.75 9.58579 22.4142 9.25 22 9.25C21.5858 9.25 21.25 9.58579 21.25 10V14Z" fill="currentColor"/>
          </svg>
          AmpereTime
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-card border-border text-foreground min-w-[150px]">
          {BRANDS.map((brand) => (
            <DropdownMenuItem
              key={brand.label}
              onClick={() => window.open(brand.url, '_blank')}
              className="hover:bg-accent text-sm"
            >
              {brand.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Center: Tab navigation. Six fixed tabs, laid out flat above 1024px
          where they're measured to fit with room to spare. Below that they'd
          get clipped with nothing to shrink into (the row has no overflow
          handling by design, see the compact dropdown below), so this is
          hidden rather than left to overlap the menu button. */}
      <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
        {TABS.map((tab, i) => (
          <button
            key={tab.key}
            onClick={() => goToTab(tab.key)}
            aria-current={activeTab === tab.key ? 'page' : undefined}
            title={`${tab.label} (${i + 1})`}
            className={`relative px-3 py-1.5 min-h-[44px] text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {tab.label}
            {/* Overdue follow-ups were previously only visible from inside the
                tracker, so they went unnoticed while working other tabs. */}
            {tab.key === 'tracker' && overdue > 0 && (
              <span
                title={`${overdue} case${overdue > 1 ? 's' : ''} need follow-up`}
                className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-accent-orange text-[10px] font-bold text-white tabular-nums align-middle"
              >
                {overdue > 99 ? '99+' : overdue}
                <span className="sr-only"> cases need follow-up</span>
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Below 1024px: the flat row above is hidden, so this dropdown is the
          only way to switch tabs. It has to exist or four of six tabs become
          unreachable with no scrollbar and nothing to click. */}
      <div className="flex lg:hidden flex-1 min-w-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 w-full min-w-0 px-3 py-1.5 min-h-[44px] text-xs font-medium rounded-md border border-border text-foreground hover:border-primary transition-colors">
            <span className="truncate flex-1 text-left">
              {TABS.find((tab) => tab.key === activeTab)?.label ?? 'Menu'}
            </span>
            {overdue > 0 && (
              <span
                title={`${overdue} case${overdue > 1 ? 's' : ''} need follow-up`}
                className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-accent-orange text-[10px] font-bold text-white tabular-nums shrink-0"
              >
                {overdue > 99 ? '99+' : overdue}
                <span className="sr-only"> cases need follow-up</span>
              </span>
            )}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-card border-border text-foreground min-w-[200px]">
            {TABS.map((tab, i) => (
              <DropdownMenuItem
                key={tab.key}
                onClick={() => goToTab(tab.key)}
                className="hover:bg-accent text-sm justify-between"
              >
                <span className="flex items-center gap-2">
                  <kbd className="text-[10px] font-sans text-muted-foreground">{i + 1}</kbd>
                  {tab.label}
                </span>
                {tab.key === 'tracker' && overdue > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-accent-orange text-[10px] font-bold text-white tabular-nums">
                    {overdue > 99 ? '99+' : overdue}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: one menu for search / theme / signature / session — kept to a
          single control so the tab row keeps the width it needs. */}
      <div className="shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger
            title="Search, theme, signature and account"
            aria-label="Menu"
            className="inline-flex items-center justify-center w-11 h-11 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border text-foreground min-w-[190px]">
            <DropdownMenuItem onClick={openPalette} className="hover:bg-accent text-sm justify-between">
              Search everything
              <kbd className="text-[10px] font-sans text-muted-foreground">⌘K</kbd>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hover:bg-accent text-sm"
            >
              🌙 Switch to {theme === 'dark' ? 'light' : 'dark'} theme
            </DropdownMenuItem>
            {session?.user && (
              <DropdownMenuItem onClick={() => setSignatureOpen(true)} className="hover:bg-accent text-sm justify-between">
                Your signature
                {signature && <span className="text-muted-foreground truncate max-w-[70px]">{signature}</span>}
              </DropdownMenuItem>
            )}
            {favorites.length > 0 && (
              <DropdownMenuItem onClick={copyPinnedList} className="hover:bg-accent text-sm">
                Copy pinned list ({favorites.length})
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {session?.user ? (
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/' })}
                className="hover:bg-accent text-sm text-destructive"
              >
                Sign Out
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => router.push('/')} className="hover:bg-accent text-sm">
                Sign In
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <SignatureDialog open={signatureOpen} onClose={() => setSignatureOpen(false)} />
      </div>
    </div>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm overflow-x-hidden">
      <Suspense fallback={<div className="max-w-[1180px] mx-auto px-[22px] flex items-center h-14 border-b border-border bg-background/95" />}>
        <NavInner />
      </Suspense>
    </header>
  );
}
