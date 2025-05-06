import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import PriceHistory from '@/app/lib/models/PriceHistory';
import mongoose from 'mongoose';
import { cache } from 'react';

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 300;

// Cache for price history data
const priceHistoryCache = new Map<string, { data: any, timestamp: number }>();

// Cached database connection
const getDbConnection = cache(async () => {
  await connectDB();
  return true;
});

// POST /api/recommendations/price-history - Get price history for a list of Bakugan IDs
export async function POST(request: NextRequest) {
  try {
    // Connect to DB (using cached connection if available)
    await getDbConnection();
    
    // Get the list of Bakugan IDs from the request body
    const { bakuganIds } = await request.json();
    
    if (!bakuganIds || !Array.isArray(bakuganIds) || bakuganIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing bakuganIds array' },
        { status: 400 }
      );
    }
    
    // Validate each ID
    const validIds = bakuganIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid Bakugan IDs provided' },
        { status: 400 }
      );
    }
    
    // Create a cache key from the sorted IDs to ensure consistent caching
    const cacheKey = [...validIds].sort().join(',');
    const now = Date.now();
    
    // Check if we have a valid cache for this set of IDs
    const cachedData = priceHistoryCache.get(cacheKey);
    if (cachedData && (now - cachedData.timestamp) / 1000 < CACHE_DURATION) {
      // Return cached data if it's still valid
      return NextResponse.json(cachedData.data);
    }
    
    // Convert string IDs to ObjectIds
    const objectIds = validIds.map(id => new mongoose.Types.ObjectId(id));
    
    // Get the most recent price history entries for each Bakugan
    // Using aggregation to get the most recent entries efficiently
    const priceHistoryData = await PriceHistory.aggregate([
      {
        $match: {
          bakuganId: { $in: objectIds }
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
              _id: '$_id',
              price: '$price',
              timestamp: '$timestamp',
              // Only include essential fields to reduce payload size
              notes: { $ifNull: ['$notes', ''] },
              referenceUri: { $ifNull: ['$referenceUri', ''] }
            }
          }
        }
      },
      {
        $project: {
          bakuganId: '$_id',
          priceHistory: { $slice: ['$priceHistory', 3] } // Limit to just 3 most recent entries to reduce payload
        }
      }
    ]).allowDiskUse(true); // Allow disk use for large datasets
    
    // Transform the data into a more usable format
    const result = priceHistoryData.reduce((acc, item) => {
      acc[item.bakuganId.toString()] = item.priceHistory;
      return acc;
    }, {});
    
    // Update cache
    priceHistoryCache.set(cacheKey, { data: result, timestamp: now });
    
    // Limit cache size to prevent memory issues (keep only 50 most recent entries)
    if (priceHistoryCache.size > 50) {
      const oldestKey = Array.from(priceHistoryCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      priceHistoryCache.delete(oldestKey);
    }
    
    // Set cache headers
    const headers = new Headers();
    headers.set('Cache-Control', `public, max-age=${CACHE_DURATION}`);
    
    return NextResponse.json(result, { headers });
  } catch (error: any) {
    console.error('Error fetching price history data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price history data', details: error.message },
      { status: 500 }
    );
  }
}
