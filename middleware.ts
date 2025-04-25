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
  
  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // For all other paths including Bakugan list, check authentication
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // If user is not authenticated, redirect to signin
  if (!token) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Allow authenticated users to access protected paths
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
