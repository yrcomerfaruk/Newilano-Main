import NextAuth, { type DefaultSession } from 'next-auth';
import { type JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: DefaultSession['user'] & {
      id: string;
      role: 'user' | 'admin';
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: 'user' | 'admin';
  }
}
