'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { getCases, createCase, restoreCase, updateCaseStage, updateCaseNote, deleteCase, upsertCasesByOrder } from '@/lib/actions';
import * as XLSX from 'xlsx';
import type { CaseData } from '@/lib/actions';
import { useToast } from '@/components/ui/Toast';
import { useCaseStats } from '@/components/layout/CaseStatsProvider';
import { PLATFORMS, STAGES, TYPES, fmtAge, isOverdue } from '@/lib/sla';

const CACHE_KEY = 'litime-cases-cache';

function readCache(): CaseData[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    // Corrupt or unavailable cache — fall through to a normal load.
    return null;
  }
}

function writeCache(data: CaseData[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Non-fatal.
  }
}

export default function CaseTracker() {
  const { data: session } = useSession();
  const { setFromCases } = useCaseStats();
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const { toast } = useToast();

  // Ages are shown relative to now, so the clock has to advance on its own —
  // otherwise a case only looks overdue once something else forces a re-render.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCases();
      setCases(data);
      writeCache(data);
    } catch {
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!session?.user) return;

    const cached = readCache();
    if (cached) {
      setCases(cached);
      setLoading(false);
      // Silent background refresh — no loading flash.
      getCases()
        .then((data) => {
          setCases(data);
          writeCache(data);
        })
        .catch(() => {});
      return;
    }

    loadCases();
  }, [session, loadCases]);

  // Keep the navbar badge in step with what the tracker is showing, rather than
  // making the provider re-fetch the same rows.
  useEffect(() => {
    setFromCases(cases);
  }, [cases, setFromCases]);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const order = (fd.get('order') as string || '').trim();
    const email = (fd.get('email') as string || '').trim();
    if (!order || !email) { toast.error('Order number and customer email are required.'); return; }

    setSubmitting(true);
    try {
      const result = await createCase({
        order_number: order,
        email,
        platform: fd.get('platform') as string || 'Amazon',
        type: fd.get('type') as string || 'Return → Refund',
        note: fd.get('note') as string || '',
      });
      if (result?.error) {
        toast.error('Failed to create case: ' + result.error);
      } else {
        (e.target as HTMLFormElement).reset();
        await loadCases();
        toast.success('Case created');
      }
    } catch (err) {
      toast.error('Failed to create case: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStageChange(caseId: string, newStage: string) {
    // update optimistically
    setCases(prev => prev.map(c =>
      c.id === caseId ? { ...c, stage: newStage, stage_since: Date.now(), history: [...(c.history || []), newStage + ' @ ' + new Date().toLocaleDateString()] } : c
    ));
    try {
      await updateCaseStage(caseId, newStage);
    } catch {
      toast.error('Failed to update stage');
      await loadCases();
    }
  }

  async function handleNoteSave(caseId: string, value: string) {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, note: value } : c));
    setSavingNoteId(caseId);
    try {
      await updateCaseNote(caseId, value);
      setTimeout(() => setSavingNoteId(prev => prev === caseId ? null : prev), 800);
    } catch {
      setSavingNoteId(null);
      toast.error('Failed to save note');
      await loadCases();
    }
  }

  async function handleDelete(caseId: string) {
    const target = cases.find(c => c.id === caseId);
    if (!target) return;
    setCases(prev => prev.filter(c => c.id !== caseId));

    // `target` is captured directly in this closure rather than a shared ref,
    // so deleting a second case before clicking Undo on this toast can't make
    // this toast restore the wrong one.
    let undone = false;
    toast.info('Case removed', {
      label: 'Undo',
      onClick: async () => {
        if (undone) return;
        undone = true;
        setCases(prev => [...prev, target]);
        // restoreCase (not createCase) puts the case back exactly as it was —
        // same id, stage, and history — instead of resetting it to a brand
        // new case at "Label requested".
        const result = await restoreCase(target);
        if (result?.error) {
          toast.error('Failed to restore case: ' + result.error);
        }
        await loadCases();
      },
    });

    try {
      await deleteCase(caseId);
    } catch {
      toast.error('Failed to delete case');
      await loadCases();
    }
  }

  function handleExport() {
    if (cases.length === 0) { toast.error('No cases to export.'); return; }
    const rows = cases.map(c => ({
      'Order Number': c.order_number,
      Email: c.email,
      Platform: c.platform,
      Type: c.type,
      Stage: c.stage,
      Note: c.note,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 18 }, { wch: 28 }, { wch: 12 }, { wch: 22 }, { wch: 32 }, { wch: 40 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cases');
    XLSX.writeFile(wb, 'litime-cases-' + new Date().toISOString().slice(0, 10) + '.xlsx');
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

      if (rows.length === 0) { toast.error('File contains no cases.'); return; }

      const data = rows.map(r => ({
        order_number: String(r['Order Number'] || '').trim(),
        email: String(r['Email'] || '').trim(),
        platform: String(r['Platform'] || '').trim(),
        type: String(r['Type'] || '').trim(),
        stage: String(r['Stage'] || '').trim(),
        note: String(r['Note'] || '').trim(),
      })).filter(c => c.order_number);

      if (data.length === 0) { toast.error('No rows with an Order Number found.'); return; }

      const result = await upsertCasesByOrder(data);
      await loadCases();
      toast.success(`${result.created} created, ${result.updated} updated`);
    } catch {
      toast.error('Could not read that file. Make sure it\'s an .xlsx exported from this tracker.');
    }
    e.target.value = '';
  }

  const active = cases.filter(c => c.stage !== 'Done').length;
  const overdue = cases.filter((c) => isOverdue(c, now)).length;

  let rows = cases.slice();
  if (filter === 'active') rows = rows.filter(c => c.stage !== 'Done');
  else if (filter === 'overdue') rows = rows.filter((c) => isOverdue(c, now));
  else if (filter === 'done') rows = rows.filter(c => c.stage === 'Done');
  if (query) {
    const q = query.toLowerCase();
    rows = rows.filter(c => (c.order_number || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q));
  }
  rows.sort((a, b) => {
    const oa = isOverdue(a, now) ? 0 : 1, ob = isOverdue(b, now) ? 0 : 1;
    if (oa !== ob) return oa - ob;
    return a.stage_since - b.stage_since;
  });

  if (!session?.user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">Please sign in to use the Case Tracker.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-4 flex-wrap">
        <div>
          <h2 className="font-mono text-xl font-bold text-foreground">Case Tracker</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-[620px] leading-relaxed">
            Your follow-ups for returns, refunds, replacements and cancellations.
            Saved to your account — they persist across devices.
          </p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
            <b className="block font-mono text-xl tabular-nums text-foreground">{active}</b>
            <span className="text-[10.5px] text-muted-foreground uppercase tracking-wide">active</span>
          </div>
          <div className={`bg-card border rounded-lg px-4 py-2 text-center ${overdue ? 'border-[rgba(232,119,46,0.4)]' : 'border-border'}`}>
            <b className={`block font-mono text-xl tabular-nums ${overdue ? 'text-[#e8772e]' : 'text-foreground'}`}>{overdue}</b>
            <span className="text-[10.5px] text-muted-foreground uppercase tracking-wide">need follow-up</span>
          </div>
        </div>
      </div>

      {/* Add case form */}
      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.1fr_1.3fr_0.8fr_1.2fr_1.4fr_auto] gap-2 mb-4 p-3 bg-card border border-border rounded-xl"
      >
        <input
          name="order"
          placeholder="Order number *"
          required
          className="bg-background border border-border text-foreground px-2.5 py-2 rounded-lg text-xs font-mono outline-none focus:border-primary w-full"
        />
        <input
          name="email"
          type="email"
          placeholder="Customer email *"
          required
          className="bg-background border border-border text-foreground px-2.5 py-2 rounded-lg text-xs font-mono outline-none focus:border-primary w-full"
        />
        <select
          name="platform"
          className="bg-background border border-border text-foreground px-2.5 py-2 rounded-lg text-xs font-mono outline-none focus:border-primary w-full"
        >
          {PLATFORMS.map(p => <option key={p}>{p}</option>)}
        </select>
        <select
          name="type"
          className="bg-background border border-border text-foreground px-2.5 py-2 rounded-lg text-xs font-mono outline-none focus:border-primary w-full"
        >
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <input
          name="note"
          placeholder="Note (optional)"
          className="bg-background border border-border text-foreground px-2.5 py-2 rounded-lg text-xs font-mono outline-none focus:border-primary w-full"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-primary border-none text-primary-foreground font-bold rounded-lg px-3.5 py-2 cursor-pointer font-mono text-xs whitespace-nowrap hover:brightness-110 transition-all disabled:opacity-50"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-1.5">
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Adding...
            </span>
          ) : (
            '+ Add case'
          )}
        </button>
      </form>

      {/* Filters + search + export/import */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="flex gap-1.5">
          {(['active', 'overdue', 'all', 'done'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 font-mono text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                filter === f
                  ? 'bg-primary/20 border-primary text-primary-foreground'
                  : 'bg-card border-border text-muted-foreground hover:border-primary'
              }`}
            >
              {f === 'overdue' ? 'Need follow-up' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search order / email…"
          className="flex-1 min-w-[160px] bg-card border border-border text-foreground px-3 py-1.5 rounded-lg text-xs font-mono outline-none focus:border-primary"
        />
        <div className="flex gap-1.5 ml-auto">
          <button
            onClick={handleExport}
            className="bg-transparent border border-border text-muted-foreground px-3 py-1.5 rounded-lg cursor-pointer font-mono text-xs hover:border-primary hover:text-primary transition-colors"
          >
            Export
          </button>
          <label className="bg-transparent border border-border text-muted-foreground px-3 py-1.5 rounded-lg cursor-pointer font-mono text-xs hover:border-primary hover:text-primary transition-colors">
            Import
            <input type="file" accept=".xlsx" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Cases list */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-10">Loading cases...</p>
      ) : !rows.length ? (
        <div className="text-center py-10 text-muted-foreground text-xs bg-card border border-dashed border-border rounded-xl">
          {cases.length === 0
            ? 'No cases here yet. Add one above to start tracking.'
            : 'No cases match the current filter.'}
        </div>
      ) : (
        <div className="space-y-2.5">
          {rows.map(c => {
            const od = isOverdue(c, now);
            return (
              <div
                key={c.id}
                className={`bg-card border rounded-xl p-3.5 transition-colors ${
                  od
                    ? 'border-[rgba(232,119,46,0.5)] bg-gradient-to-b from-[rgba(232,119,46,0.05)] to-card'
                    : c.stage === 'Done'
                    ? 'border-border opacity-60'
                    : 'border-border'
                }`}
              >
                {/* Top row */}
                <div className="flex items-center gap-3 mb-2.5">
                  <div>
                    <b className="block font-mono text-sm text-foreground">{c.order_number || '—'}</b>
                    <span className="text-[11.5px] text-muted-foreground">{c.email || ''}</span>
                  </div>
                  <div className="flex gap-1.5 ml-1.5">
                    {c.platform && (
                      <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                        {c.platform}
                      </span>
                    )}
                    {c.type && (
                      <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                        {c.type}
                      </span>
                    )}
                  </div>
                  <div
                    className={`ml-auto font-mono text-xs tabular-nums whitespace-nowrap ${
                      od ? 'text-[#e8772e] font-bold' : 'text-muted-foreground'
                    }`}
                    title="Time in current stage"
                  >
                    {od ? '⚠ ' : ''}{fmtAge(now - c.stage_since)}
                  </div>
                </div>

                {/* Stage + Note + Delete */}
                <div className="grid grid-cols-1 sm:grid-cols-[1.3fr_2fr_32px] gap-2 items-center">
                  <select
                    value={c.stage}
                    onChange={e => handleStageChange(c.id, e.target.value)}
                    className="bg-background border border-border text-foreground px-2.5 py-2 rounded-lg text-xs font-mono outline-none focus:border-primary w-full"
                  >
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="relative">
                    <input
                      defaultValue={c.note || ''}
                      onBlur={e => handleNoteSave(c.id, e.target.value)}
                      placeholder="Add a note…"
                      className="bg-background border border-border text-foreground px-2.5 py-2 rounded-lg text-xs font-mono outline-none focus:border-primary w-full"
                    />
                    {savingNoteId === c.id && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                        Saved
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    title="Delete"
                    className="bg-background border border-border text-muted-foreground rounded-lg h-[33px] cursor-pointer text-base hover:border-destructive hover:text-destructive transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Footer */}
                <div className="text-[10.5px] text-muted-foreground mt-2 italic">
                  opened {fmtAge(now - c.created)} ago
                  {c.history && c.history.length > 0 && ' · ' + c.history[c.history.length - 1]}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
