import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/lib/models/User';

// PUT /api/user/change-password - Change user password
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
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
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

    // Validate current password
    const isValidPassword = user.validatePassword(currentPassword);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Update password
    user.setPassword(newPassword);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error: any) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password', details: error.message },
      { status: 500 }
    );
  }
}
