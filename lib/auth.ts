import { getServerSession, type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from './db';
import { User } from '@/models/User';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (!NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is not defined');
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  secret: NEXTAUTH_SECRET,
  pages: {
    signIn: '/giris'
  },
  providers: [
    Credentials({
      name: 'Email ve Şifre',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'ornek@mail.com' },
        password: { label: 'Şifre', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email ve şifre gereklidir');
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email.toLowerCase() }).lean();

        if (!user) {
          throw new Error('Kullanıcı bulunamadı');
        }

        const passwordMatches = await bcrypt.compare(credentials.password, user.password);

        if (!passwordMatches) {
          throw new Error('Geçersiz kimlik bilgileri');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: (typeof user.role === 'string' ? user.role.toLowerCase() : 'user') as 'user' | 'admin'
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = (typeof (user as any).role === 'string'
          ? (((user as any).role as string).toLowerCase() as 'user' | 'admin')
          : ('user' as 'user'));
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = (typeof token.role === 'string' && (token.role as string).toLowerCase() === 'admin')
          ? 'admin'
          : 'user';
      }
      return session;
    }
  }
};

export function auth() {
  return getServerSession(authOptions);
}
