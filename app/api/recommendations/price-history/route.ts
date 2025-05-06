import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import PriceHistory from '@/app/lib/models/PriceHistory';
import mongoose from 'mongoose';

// POST /api/recommendations/price-history - Get price history for a list of Bakugan IDs
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
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
              notes: '$notes',
              referenceUri: '$referenceUri'
            }
          }
        }
      },
      {
        $project: {
          bakuganId: '$_id',
          priceHistory: { $slice: ['$priceHistory', 5] } // Limit to the 5 most recent entries
        }
      }
    ]);
    
    // Transform the data into a more usable format
    const result = priceHistoryData.reduce((acc, item) => {
      acc[item.bakuganId.toString()] = item.priceHistory;
      return acc;
    }, {});
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching price history data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price history data', details: error.message },
      { status: 500 }
    );
  }
}
