import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { supabase } from './supabase';

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
        const { data, error } = await supabase.rpc('verify_agent_password', {
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
    signIn: '/',
  },
  session: { strategy: 'jwt' },
});