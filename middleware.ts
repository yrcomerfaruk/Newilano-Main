import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

declare global {
  // eslint-disable-next-line no-var
  var __adminRateLimiterStore: Map<string, number[]> | undefined;
}

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;
const ADMIN_TRUSTED_ORIGIN = process.env.ADMIN_TRUSTED_ORIGIN;

if (!NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is not defined');
}

const ADMIN_PREFIXES = ['/admin', '/api/admin'];
const ADMIN_API_PREFIX = '/api/admin';
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;

const allowedOrigins = new Set(
  [NEXTAUTH_URL, ADMIN_TRUSTED_ORIGIN].filter((value): value is string => Boolean(value))
);

const limiterStore: Map<string, number[]> = globalThis.__adminRateLimiterStore ?? new Map();
if (!globalThis.__adminRateLimiterStore) globalThis.__adminRateLimiterStore = limiterStore;

function applySecurityHeaders(response: NextResponse) {
  const headers = response.headers;
  const isDev = process.env.NODE_ENV !== 'production';
  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    'https://images.unsplash.com',
    'https://static.nike.com',
    'https://images.ctfassets.net',
    'https://assets.adidas.com',
    'https://upload.wikimedia.org'
  ].join(' ');

  const connectSrc = ["'self'", 'https://newilano.com'];
  if (isDev) {
    connectSrc.push('ws://localhost:*', 'ws://127.0.0.1:*');
  }

  const scriptSrc = isDev
    ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
    : ["'self'"];

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imgSrc}`,
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(' ')}`,
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'"
  ];

  const csp = directives.join('; ');

  headers.set('Content-Security-Policy', csp);
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-DNS-Prefetch-Control', 'off');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  if (!isDev) {
    headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  return response;
}

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const requests = limiterStore.get(ip)?.filter((timestamp) => timestamp > windowStart) ?? [];

  if (requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    limiterStore.set(ip, requests);
    return false;
  }

  requests.push(now);
  limiterStore.set(ip, requests);
  return true;
}

function isAdminPath(pathname: string) {
  return ADMIN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0]?.trim();
    if (ip) return ip;
  }
  return request.ip ?? '127.0.0.1';
}

function isSafeMethod(method: string) {
  return method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
}

function isAllowedOrigin(request: NextRequest) {
  const originHeader = request.headers.get('origin');
  // Allow if no Origin header but request appears same-origin (e.g., some browsers or server-side calls)
  if (!originHeader) {
    const referer = request.headers.get('referer');
    if (referer) {
      try {
        const refUrl = new URL(referer);
        if (refUrl.origin === request.nextUrl.origin) return true;
      } catch {
        // ignore malformed referer
      }
    }
    // Fallback: treat missing Origin as allowed for authenticated admin API
    return true;
  }

  if (allowedOrigins.size === 0) {
    allowedOrigins.add(request.nextUrl.origin);
  }

  // Always allow same-origin
  if (originHeader === request.nextUrl.origin) {
    return true;
  }

  return allowedOrigins.has(originHeader);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  const isAdminRoute = isAdminPath(pathname);
  const isAdminApi = pathname.startsWith(ADMIN_API_PREFIX);

  if (isAdminRoute) {
    const token = await getToken({ req: request, secret: NEXTAUTH_SECRET });

    if (!token || token.role !== 'admin') {
      if (isAdminApi) {
        return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 403 });
      }
      const signInUrl = new URL('/giris', request.url);
      signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(signInUrl);
    }

    if (isAdminApi) {
      if (!isSafeMethod(request.method) && !isAllowedOrigin(request)) {
        return NextResponse.json({ message: 'Geçersiz istek kaynağı' }, { status: 403 });
      }

      const clientIp = getClientIp(request);
      if (!rateLimit(clientIp)) {
        return NextResponse.json(
          { message: 'Çok fazla istek. Lütfen birkaç dakika sonra tekrar deneyin.' },
          { status: 429 }
        );
      }
    }
  }

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};

