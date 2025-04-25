import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/lib/models/User';

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, email, userId, adminKey } = body;

    if (!username || !password || !email || !userId) {
      return NextResponse.json(
        { error: 'Username, password, email, and userId are required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Find the user by userId (this should be the temporary user created during OTP verification)
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please verify your email first.' },
        { status: 404 }
      );
    }
    
    // Check if the user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Email not verified. Please verify your email first.' },
        { status: 403 }
      );
    }
    
    // Check if username already exists (for a different user)
    const existingUsername = await User.findOne({ 
      username, 
      _id: { $ne: user._id } 
    });
    
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Update the temporary user with complete information
    user.username = username;
    user.email = email;
    user.isAdmin = adminKey === process.env.ADMIN_SECRET_KEY;
    user.provider = 'credentials';
    
    user.setPassword(password);
    await user.save();

    // Return user without sensitive data
    return NextResponse.json({
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user', details: error.message },
      { status: 500 }
    );
  }
}
