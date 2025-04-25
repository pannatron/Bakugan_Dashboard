import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/lib/models/User';

// POST /api/auth/check-email - Check if email is already registered
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Find if the email already exists and is verified
    const user = await User.findOne({ 
      email, 
      isVerified: true,
      // Exclude temporary users (those with usernames starting with 'temp_')
      username: { $not: /^temp_/ }
    });
    
    if (user) {
      return NextResponse.json(
        { error: 'Email already registered. Please use a different email or sign in.' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      available: true,
      message: 'Email is available for registration',
    });
  } catch (error: any) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      { error: 'Failed to check email availability', details: error.message },
      { status: 500 }
    );
  }
}
