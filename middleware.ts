import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
);

const COOKIE_NAME = 'casa-quetzal-token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas
  if (pathname === '/login') {
    // Se já está autenticado, redirecionar para home ou admin
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      try {
        const verified = await jwtVerify(token, JWT_SECRET);
        const payload = verified.payload as { role?: string };
        
        if (payload.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.redirect(new URL('/', request.url));
      } catch {
        // Token inválido, permitir acesso ao login
      }
    }
    return NextResponse.next();
  }

  // Rotas protegidas
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload as { role?: string };

    // Verificar acesso admin
    if (pathname.startsWith('/admin')) {
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Token inválido
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by API route auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ],
};

