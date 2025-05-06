import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Recommendation from '@/app/lib/models/Recommendation';
import Bakugan from '@/app/lib/models/Bakugan';
import PriceHistory from '@/app/lib/models/PriceHistory';
import mongoose from 'mongoose';
import { cache } from 'react';

// Cache duration in seconds (15 minutes for better performance)
const CACHE_DURATION = 900;

// Cache for combined recommendations data
let cachedData: any = null;
let lastCacheTime: number = 0;

// Cached database connection
const getDbConnection = cache(async () => {
  await connectDB();
  return true;
});

// GET /api/recommendations/combined - Get all recommendations with price history in a single request
export async function GET(request: NextRequest) {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (cachedData && (now - lastCacheTime) / 1000 < CACHE_DURATION) {
      // Return cached data if it's still valid
      return NextResponse.json(cachedData);
    }
    
    console.log('Fetching combined recommendation data...');
    const startTime = performance.now();
    
    // Connect to DB (using cached connection if available)
    await getDbConnection();
    
    // Get all recommendations sorted by rank with minimal fields
    const recommendations = await Recommendation.find({})
      .sort({ rank: 1 })
      .limit(5) // Limit to top 5 recommendations for even faster loading
      .populate({
        path: 'bakuganId',
        model: Bakugan,
        select: 'names size element imageUrl currentPrice' // Only absolute essential fields
      })
      .lean()
      .exec(); // Use exec() for better performance
    
    // Extract Bakugan IDs for price history query
    const bakuganIds = recommendations.map(rec => rec.bakuganId._id);
    
    // Get only the most recent price history entry for each Bakugan
    const priceHistoryData = await PriceHistory.aggregate([
      {
        $match: {
          bakuganId: { $in: bakuganIds.map(id => new mongoose.Types.ObjectId(id)) }
        }
      },
      {
        $sort: { bakuganId: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$bakuganId',
          priceHistory: {
            $push: {
              price: '$price',
              timestamp: '$timestamp'
              // Removed notes and referenceUri to reduce payload size
            }
          }
        }
      },
      {
        $project: {
          bakuganId: '$_id',
          priceHistory: { $slice: ['$priceHistory', 1] } // Get only the most recent price entry
        }
      }
    ], { allowDiskUse: true });
    
    // Transform price history data into a map for easier access
    const priceHistoryMap = priceHistoryData.reduce((acc, item) => {
      acc[item.bakuganId.toString()] = item.priceHistory;
      return acc;
    }, {});
    
    // Combine recommendations with price history
    const combinedData = recommendations.map(rec => {
      const bakuganId = rec.bakuganId._id.toString();
      return {
        ...rec,
        bakuganId: {
          ...rec.bakuganId,
          priceHistory: priceHistoryMap[bakuganId] || []
        }
      };
    });
    
    const endTime = performance.now();
    console.log(`Combined data fetched in ${endTime - startTime}ms`);
    
    // Update cache
    cachedData = combinedData;
    lastCacheTime = now;
    
    // Set cache headers
    const headers = new Headers();
    headers.set('Cache-Control', `public, max-age=${CACHE_DURATION}`);
    
    return NextResponse.json(combinedData, { headers });
  } catch (error: any) {
    console.error('Error fetching combined recommendation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch combined recommendation data', details: error.message },
      { status: 500 }
    );
  }
}
