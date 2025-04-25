import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || 
                       path === '/auth/signin' || 
                       path === '/auth/profile-setup' ||
                       path.startsWith('/api/auth');
  
  // Check if the path is for the Bakugan list page
  const isBakuganListPath = path === '/bakumania' || path.startsWith('/bakumania/');
  
  // If it's not a public path and not the Bakugan list path, allow access
  if (!isPublicPath && !isBakuganListPath) {
    return NextResponse.next();
  }
  
  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // For Bakugan list path, check authentication
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // If user is not authenticated and trying to access Bakugan list, redirect to signin
  if (!token && isBakuganListPath) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Allow authenticated users to access Bakugan list
  return NextResponse.next();
}

// Configure the paths that the middleware should run on
export const config = {
  matcher: [
    '/',
    '/bakumania',
    '/bakumania/:path*',
    '/auth/:path*',
  ],
};
