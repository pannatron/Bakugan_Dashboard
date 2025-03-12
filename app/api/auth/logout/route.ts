import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST /api/auth/logout - Logout a user
export async function POST() {
  try {
    // Clear the auth cookie
    cookies().delete('auth_token');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { error: 'Failed to logout', details: error.message },
      { status: 500 }
    );
  }
}
