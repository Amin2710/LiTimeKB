'use server';

import { auth } from './auth';
import { supabase } from './supabase';
import { countStats } from './sla';

async function getUserId() {
  const session = await auth();
  return session?.user?.id;
}

export interface CaseData {
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

export async function getCases() {
  const userId = await getUserId();
  if (!userId) return [];

  const { data } = await supabase
    .from('cases')
    .select('*')
    .eq('user_id', userId)
    .order('created', { ascending: false });

  return (data || []) as CaseData[];
}

function genId() {
  return crypto.randomUUID();
}

export async function createCase(fields: {
  order_number: string;
  email: string;
  platform: string;
  type: string;
  note: string;
}): Promise<{ error: string } | null> {
  const userId = await getUserId();
  if (!userId) return { error: 'Not authenticated' };

  const now = Date.now();
  const { error } = await supabase.from('cases').insert({
    id: genId(),
    user_id: userId,
    order_number: fields.order_number,
    email: fields.email,
    platform: fields.platform,
    type: fields.type,
    note: fields.note || '',
    stage: 'Label requested',
    stage_since: now,
    created: now,
    history: ['Label requested @ ' + new Date().toLocaleDateString()],
  });

  if (error) return { error: error.message };
  return null;
}

export async function bulkImportCases(imported: Array<{
  order_number: string;
  email: string;
  platform?: string;
  type?: string;
  note?: string;
  stage?: string;
  stage_since?: number;
  created?: number;
  history?: string[];
}>) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const now = Date.now();
  const records = imported.map((c) => ({
    id: genId(),
    user_id: userId,
    order_number: c.order_number,
    email: c.email,
    platform: c.platform || '',
    type: c.type || '',
    note: c.note || '',
    stage: c.stage || 'Label requested',
    stage_since: c.stage_since || now,
    created: c.created || now,
    history: c.history || ['Imported @ ' + new Date().toLocaleDateString()],
  }));

  const { error } = await supabase.from('cases').insert(records);
  if (error) throw new Error(error.message);
  return records.length;
}

export async function updateCaseStage(caseId: string, stage: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('cases')
    .select('stage, history, stage_since')
    .eq('id', caseId)
    .single();

  if (!existing) throw new Error('Case not found');

  const now = Date.now();
  const history = (existing.history || []).concat(
    stage + ' @ ' + new Date().toLocaleDateString()
  );

  const { error } = await supabase
    .from('cases')
    .update({ stage, stage_since: now, history })
    .eq('id', caseId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

export async function deleteCase(caseId: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('cases')
    .delete()
    .eq('id', caseId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

export async function updateCaseNote(caseId: string, note: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('cases')
    .update({ note })
    .eq('id', caseId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

export async function upsertCasesByOrder(imported: Array<{
  order_number: string;
  email?: string;
  platform?: string;
  type?: string;
  note?: string;
  stage?: string;
}>) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('cases')
    .select('*')
    .eq('user_id', userId);

  const existingByOrder = new Map(existing?.map(c => [c.order_number, c]) || []);
  const now = Date.now();
  let created = 0;
  let updated = 0;

  for (const row of imported) {
    if (!row.order_number) continue;
    const existing = existingByOrder.get(row.order_number);

    if (existing) {
      const updates: Record<string, unknown> = {};
      if (row.email !== undefined && row.email !== existing.email) updates.email = row.email;
      if (row.platform !== undefined && row.platform !== existing.platform) updates.platform = row.platform;
      if (row.type !== undefined && row.type !== existing.type) updates.type = row.type;
      if (row.note !== undefined && row.note !== existing.note) updates.note = row.note;
      if (row.stage !== undefined && row.stage !== existing.stage) {
        updates.stage = row.stage;
        updates.stage_since = now;
        updates.history = [...(existing.history || []), row.stage + ' @ ' + new Date().toLocaleDateString()];
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('cases')
          .update(updates)
          .eq('id', existing.id)
          .eq('user_id', userId);
        if (error) throw new Error(error.message);
        updated++;
      }
    } else {
      const { error } = await supabase.from('cases').insert({
        id: genId(),
        user_id: userId,
        order_number: row.order_number,
        email: row.email || '',
        platform: row.platform || '',
        type: row.type || '',
        note: row.note || '',
        stage: row.stage || 'Label requested',
        stage_since: now,
        created: now,
        history: [(row.stage || 'Label requested') + ' @ ' + new Date().toLocaleDateString()],
      });
      if (error) throw new Error(error.message);
      created++;
    }
  }

  return { created, updated };
}

/**
 * Just the counts behind the navbar badge. Selects two columns rather than the
 * whole case list, since this runs on every tab, not only the tracker.
 */
export async function getCaseCounts(): Promise<{ active: number; overdue: number }> {
  const userId = await getUserId();
  if (!userId) return { active: 0, overdue: 0 };

  const { data } = await supabase
    .from('cases')
    .select('stage, stage_since')
    .eq('user_id', userId);

  return countStats(data ?? []);
}

/**
 * Records a search that returned nothing, so whoever maintains the KB can see
 * what agents look for and fail to find.
 *
 * Requires a `search_misses` table (see README). Deliberately swallows every
 * error: a missing table or a failed insert must never break searching.
 */
export async function logSearchMiss(query: string, source: string): Promise<void> {
  const trimmed = query.trim();
  if (trimmed.length < 3 || trimmed.length > 120) return;

  const userId = await getUserId();
  if (!userId) return;

  try {
    await supabase.from('search_misses').insert({
      id: crypto.randomUUID(),
      user_id: userId,
      query: trimmed.toLowerCase(),
      source,
      created: Date.now(),
    });
  } catch {
    // Telemetry is best-effort.
  }
}

export async function saveTheme(theme: string) {
  const userId = await getUserId();
  if (!userId) return;

  await supabase.from('user_preferences').upsert(
    { user_id: userId, theme },
    { onConflict: 'user_id' }
  );
}

/** The name this agent signs replies with, empty when they have not set one. */
export async function getSignature(): Promise<string> {
  const userId = await getUserId();
  if (!userId) return '';

  const { data } = await supabase
    .from('user_preferences')
    .select('signature_name')
    .eq('user_id', userId)
    .maybeSingle();

  return data?.signature_name ?? '';
}

export async function saveSignature(name: string) {
  const userId = await getUserId();
  if (!userId) return;

  await supabase.from('user_preferences').upsert(
    { user_id: userId, signature_name: name.trim() },
    { onConflict: 'user_id' }
  );
}
