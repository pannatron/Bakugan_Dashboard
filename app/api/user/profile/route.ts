import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/lib/models/User';

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Find user by email
    let user;
    
    if (session.user.email) {
      user = await User.findOne({ email: session.user.email });
    }
    
    // If not found by email, try to find by username
    if (!user && session.user.name) {
      user = await User.findOne({ username: session.user.name });
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user
    user.name = name;
    await user.save();

    // Return updated user info
    return NextResponse.json({
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    );
  }
}
