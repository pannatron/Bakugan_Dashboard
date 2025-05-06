import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Recommendation from '@/app/lib/models/Recommendation';
import Bakugan from '@/app/lib/models/Bakugan';
import { cache } from 'react';

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 300;

// Cache for recommendations data
let cachedRecommendations: any = null;
let lastCacheTime: number = 0;

// Cached database connection
const getDbConnection = cache(async () => {
  await connectDB();
  return true;
});

// GET /api/recommendations/basic - Get all recommendations with minimal data for fast loading
export async function GET(request: NextRequest) {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (cachedRecommendations && (now - lastCacheTime) / 1000 < CACHE_DURATION) {
      // Return cached data if it's still valid
      return NextResponse.json(cachedRecommendations);
    }
    
    // Connect to DB (using cached connection if available)
    await getDbConnection();
    
    // Get all recommendations sorted by rank with only the essential data for initial display
    // This excludes price history to make the initial load faster
    const recommendations = await Recommendation.find({})
      .sort({ rank: 1 })
      .limit(10) // Limit to top 10 recommendations for faster loading
      .populate({
        path: 'bakuganId',
        model: Bakugan,
        select: 'names size element imageUrl currentPrice' // Only select fields needed for gallery display
      })
      .lean(); // Use lean() for faster query execution
    
    // Update cache
    cachedRecommendations = recommendations;
    lastCacheTime = now;
    
    // Set cache headers
    const headers = new Headers();
    headers.set('Cache-Control', `public, max-age=${CACHE_DURATION}`);
    
    return NextResponse.json(recommendations, { headers });
  } catch (error: any) {
    console.error('Error fetching basic recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch basic recommendations', details: error.message },
      { status: 500 }
    );
  }
}
