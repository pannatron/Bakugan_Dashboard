import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/lib/models/User';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

// Mark this route as dynamic to handle cookies
export const dynamic = 'force-dynamic';

// Helper function to check if user is admin
async function isAdmin(req: NextRequest) {
  try {
    // Get token from cookies
    const token = cookies().get('auth_token')?.value;
    
    if (!token) {
      return false;
    }

    // Verify token
    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret');
    } catch (err) {
      return false;
    }

    // Get user from database
    await connectDB();
    const user = await User.findById((decoded as any).id);
    
    if (!user || !user.isAdmin) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// GET /api/users - Get all users
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Get all users
    const users = await User.find({}, {
      passwordHash: 0,
      salt: 0,
      otp: 0,
      otpExpiry: 0
    }).sort({ createdAt: -1 });
    
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// PATCH /api/users - Update user role or subscription
export async function PATCH(req: NextRequest) {
  try {
    // Get request body
    const body = await req.json();
    const { 
      userId, 
      isAdmin: setAdminStatus,
      subscriptionPlan,
      subscriptionExpiry
    } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Prepare update object
    const updateData: any = {};
    
    // Handle admin status update
    if (typeof setAdminStatus === 'boolean') {
      updateData.isAdmin = setAdminStatus;
    }
    
    // Handle subscription plan update
    if (subscriptionPlan) {
      if (!['free', 'pro', 'elite'].includes(subscriptionPlan)) {
        return NextResponse.json(
          { error: 'Invalid subscription plan. Must be one of: free, pro, elite' },
          { status: 400 }
        );
      }
      updateData.subscriptionPlan = subscriptionPlan;
    }
    
    // Handle subscription expiry update
    if (subscriptionExpiry) {
      try {
        const expiryDate = new Date(subscriptionExpiry);
        updateData.subscriptionExpiry = expiryDate;
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid date format for subscription expiry' },
          { status: 400 }
        );
      }
    }
    
    // If no valid updates were provided
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid update fields provided' },
        { status: 400 }
      );
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-passwordHash -salt -otp -otpExpiry' }
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user role' },
      { status: 500 }
    );
  }
}
