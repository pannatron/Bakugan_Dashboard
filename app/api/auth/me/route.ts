import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/lib/models/User';

// GET /api/auth/me - Get current user info
export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = cookies().get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret');
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user from database
    await connectDB();
    const user = await User.findById((decoded as any).id).select('-passwordHash -salt');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user info
    return NextResponse.json({
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    });
  } catch (error: any) {
    console.error('Error getting user info:', error);
    return NextResponse.json(
      { error: 'Failed to get user info', details: error.message },
      { status: 500 }
    );
  }
}
