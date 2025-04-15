import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Расширяем тип JWT для включения нашего поля role
interface CustomToken {
  id?: string;
  role?: string;
  name?: string;
  email?: string;
  iat?: number;
  exp?: number;
  jti?: string;
}

export async function middleware(request: NextRequest) {
  // Получаем токен с явным указанием типа
  const token = await getToken({ req: request, secret: process.env.JWT_SECRET }) as CustomToken | null;
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  
  // Перенаправление аутентифицированных пользователей с auth-страниц
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Защита маршрутов, требующих аутентификации
  if (!token && !isAuthPage) {
    const protectedRoutes = ['/dashboard', '/projects', '/tasks', '/settings'];
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    );
    
    // Защита маршрутов администратора
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    if (isAdminRoute && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 