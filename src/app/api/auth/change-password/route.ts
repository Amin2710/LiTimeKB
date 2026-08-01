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

  const { oldPassword, newPassword } = await req.json();

  if (!oldPassword || !newPassword) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const { error } = await supabase.rpc('change_agent_password', {
    p_agent_id: token.id,
    p_old_password: oldPassword,
    p_new_password: newPassword,
  });

  if (error) {
    return Response.json({ error: error.message || 'Failed to change password' }, { status: 400 });
  }

  return Response.json({ ok: true });
}
