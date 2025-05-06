import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Recommendation from '@/app/lib/models/Recommendation';
import Bakugan from '@/app/lib/models/Bakugan';

// GET /api/recommendations/basic - Get all recommendations with minimal data for fast loading
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all recommendations sorted by rank with only the essential data for initial display
    // This excludes price history to make the initial load faster
    const recommendations = await Recommendation.find({})
      .sort({ rank: 1 })
      .populate({
        path: 'bakuganId',
        model: Bakugan,
        select: 'names size element imageUrl currentPrice' // Only select fields needed for gallery display
      });
    
    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error('Error fetching basic recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch basic recommendations', details: error.message },
      { status: 500 }
    );
  }
}
