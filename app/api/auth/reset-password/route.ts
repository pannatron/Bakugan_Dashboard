import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/lib/models/User';

// POST /api/auth/reset-password - Initiate password reset
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
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security reasons, don't reveal if the email exists or not
      return NextResponse.json({
        success: true,
        message: 'If your email is registered, a verification code has been sent',
      });
    }
    
    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email is handled by the send-otp endpoint
    // We'll reuse that endpoint to avoid code duplication
    const sendOtpResponse = await fetch(new URL('/api/auth/send-otp', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!sendOtpResponse.ok) {
      throw new Error('Failed to send verification code');
    }

    const sendOtpData = await sendOtpResponse.json();

    return NextResponse.json({
      success: true,
      message: 'If your email is registered, a verification code has been sent',
      userId: sendOtpData.userId,
    });
  } catch (error: any) {
    console.error('Error initiating password reset:', error);
    return NextResponse.json(
      { error: 'Failed to initiate password reset', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/auth/reset-password - Complete password reset
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, otp, newPassword } = body;

    if (!userId || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'User ID, OTP, and new password are required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Validate OTP
    const isValid = user.validateOTP(otp);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }
    
    // Update password
    user.setPassword(newPassword);
    
    // Clear OTP
    user.otp = undefined;
    user.otpExpiry = undefined;
    
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password', details: error.message },
      { status: 500 }
    );
  }
}
