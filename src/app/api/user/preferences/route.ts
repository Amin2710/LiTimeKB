import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = await getToken({
    req: { headers: { cookie: cookieStore.toString() } },
    secret: process.env.AUTH_SECRET,
    secureCookie: true,
  });

  if (!token?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { theme } = await req.json();
  if (!theme || !['dark', 'light'].includes(theme)) {
    return Response.json({ error: 'Invalid theme' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: token.id, theme }, { onConflict: 'user_id' });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
