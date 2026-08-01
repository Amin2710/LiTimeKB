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