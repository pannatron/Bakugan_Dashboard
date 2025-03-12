import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  username: string;
  isAdmin: boolean;
}

// Middleware to verify authentication
export async function verifyAuth(
  req: NextRequest,
  requireAdmin = false
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    // Get token from cookies
    const token = cookies().get('auth_token')?.value;
    
    if (!token) {
      return { user: null, error: 'Not authenticated' };
    }

    // Verify token
    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret') as AuthUser;
    } catch (err) {
      return { user: null, error: 'Invalid token' };
    }

    // Check if admin is required
    if (requireAdmin && !decoded.isAdmin) {
      return { user: null, error: 'Admin access required' };
    }

    return { user: decoded, error: null };
  } catch (error: any) {
    console.error('Auth error:', error);
    return { user: null, error: error.message };
  }
}

// Helper function to handle unauthorized responses
export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

// Helper function to handle forbidden responses
export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}
