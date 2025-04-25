import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/lib/models/User';
import nodemailer from 'nodemailer';

// Configure nodemailer with SendGrid
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD
  }
});

// POST /api/auth/send-otp - Send OTP to user's email
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
    
    // Find or create a temporary user
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create a temporary user with just email
      user = new User({
        username: `temp_${Date.now()}`, // Temporary username
        email,
        isVerified: false,
      });
    }
    
    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Bakugan Dashboard Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3b82f6; text-align: center;">Bakugan Dashboard</h2>
          <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="font-size: 16px; line-height: 1.5;">Your verification code for Bakugan Dashboard is:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="font-size: 16px; line-height: 1.5;">This code will expire in 10 minutes.</p>
          <p style="font-size: 16px; line-height: 1.5;">If you didn't request this code, you can safely ignore this email.</p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">© ${new Date().getFullYear()} Bakugan Dashboard. All rights reserved.</p>
        </div>
      `
    });

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      userId: user._id,
    });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/auth/send-otp/verify - Verify OTP
export async function PUT(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { userId, otp } = body;
    console.log('OTP Verification Request:', { userId, otp });

    if (!userId || !otp) {
      console.log('Missing required fields:', { userId: !!userId, otp: !!otp });
      return NextResponse.json(
        { error: 'User ID and OTP are required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('User not found with ID:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log('User found:', { 
      id: user._id, 
      storedOtp: user.otp, 
      otpExpiry: user.otpExpiry,
      currentTime: new Date(),
      isExpired: user.otpExpiry ? new Date() > user.otpExpiry : true
    });
    
    // Validate OTP
    const isValid = user.validateOTP(otp);
    console.log('OTP validation result:', isValid);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }
    
    // Mark as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    console.log('User verified successfully:', user._id);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      userId: user._id,
      isVerified: user.isVerified,
    });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP', details: error.message },
      { status: 500 }
    );
  }
}
