import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/lib/models/User';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

/**
 * This API route is designed to be called by a cron job to check for expired subscriptions
 * and revert users back to the free plan when their subscription expires.
 * 
 * It can be scheduled to run daily using a service like Vercel Cron Jobs or an external service.
 */
export async function GET(req: NextRequest) {
  try {
    // Check for authorization token (optional, but recommended for security)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // If CRON_SECRET is set, require authorization
    if (cronSecret && (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== cronSecret)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Get current date
    const now = new Date();
    
    // Find users with expired subscriptions
    const expiredSubscriptions = await User.find({
      subscriptionPlan: { $ne: 'free' },
      subscriptionExpiry: { $lt: now }
    });
    
    // Update expired subscriptions to free plan
    const updatePromises = expiredSubscriptions.map(user => 
      User.findByIdAndUpdate(
        user._id,
        { subscriptionPlan: 'free' },
        { new: true }
      )
    );
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    return NextResponse.json({
      success: true,
      message: `Checked subscriptions. Reverted ${expiredSubscriptions.length} expired subscriptions to free plan.`
    });
  } catch (error: any) {
    console.error('Error checking subscriptions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check subscriptions' },
      { status: 500 }
    );
  }
}
