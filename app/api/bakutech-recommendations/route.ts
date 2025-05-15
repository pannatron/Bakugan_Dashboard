import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import BakutechRecommendation from '@/app/lib/models/BakutechRecommendation';
import Bakugan from '@/app/lib/models/Bakugan';
import mongoose from 'mongoose';

// GET /api/bakutech-recommendations - Get all BakuTech recommendations
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all BakuTech recommendations sorted by rank with minimal data for gallery display
    // Add lean() to return plain JavaScript objects instead of Mongoose documents
    // Add cache control headers to enable browser caching
    const recommendations = await BakutechRecommendation.find({})
      .sort({ rank: 1 })
      .populate({
        path: 'bakuganId',
        model: Bakugan,
        select: 'names size element imageUrl currentPrice' // Only select fields needed for gallery display
      })
      .lean();
    
    // Create response with cache control headers
    const response = NextResponse.json(recommendations);
    
    // Set cache control headers to enable browser caching for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    
    return response;
  } catch (error: any) {
    console.error('Error fetching BakuTech recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch BakuTech recommendations', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/bakutech-recommendations - Create or update a BakuTech recommendation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bakuganId, rank, reason } = body;

    if (!bakuganId || !rank) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rank is between 1 and 5
    if (rank < 1 || rank > 5) {
      return NextResponse.json(
        { error: 'Rank must be between 1 and 5' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Check if Bakugan exists
    const bakugan = await Bakugan.findById(bakuganId);
    if (!bakugan) {
      return NextResponse.json(
        { error: 'Bakugan not found' },
        { status: 404 }
      );
    }

    // Check if a recommendation with this rank already exists
    const existingRankRecommendation = await BakutechRecommendation.findOne({ rank });
    
    // Check if a recommendation for this Bakugan already exists
    const existingBakuganRecommendation = await BakutechRecommendation.findOne({ 
      bakuganId: new mongoose.Types.ObjectId(bakuganId) 
    });

    // If both exist and they're different, we need to swap ranks
    if (existingRankRecommendation && existingBakuganRecommendation && 
        !existingRankRecommendation._id.equals(existingBakuganRecommendation._id)) {
      // Swap ranks
      existingRankRecommendation.bakuganId = existingBakuganRecommendation.bakuganId;
      existingRankRecommendation.reason = existingBakuganRecommendation.reason;
      await existingRankRecommendation.save();
      
      // Update the existing Bakugan recommendation with new rank
      existingBakuganRecommendation.rank = rank;
      existingBakuganRecommendation.reason = reason || existingBakuganRecommendation.reason;
      await existingBakuganRecommendation.save();
      
      return NextResponse.json({
        message: 'BakuTech recommendation ranks swapped successfully',
        recommendation: existingBakuganRecommendation
      });
    }
    
    // If recommendation with this rank exists, update it
    if (existingRankRecommendation) {
      existingRankRecommendation.bakuganId = new mongoose.Types.ObjectId(bakuganId);
      existingRankRecommendation.reason = reason || '';
      await existingRankRecommendation.save();
      
      return NextResponse.json({
        message: 'BakuTech recommendation updated successfully',
        recommendation: existingRankRecommendation
      });
    }
    
    // If recommendation for this Bakugan exists, update its rank
    if (existingBakuganRecommendation) {
      existingBakuganRecommendation.rank = rank;
      existingBakuganRecommendation.reason = reason || existingBakuganRecommendation.reason;
      await existingBakuganRecommendation.save();
      
      return NextResponse.json({
        message: 'BakuTech recommendation rank updated successfully',
        recommendation: existingBakuganRecommendation
      });
    }
    
    // Create new recommendation
    const newRecommendation = await BakutechRecommendation.create({
      bakuganId: new mongoose.Types.ObjectId(bakuganId),
      rank,
      reason: reason || '',
    });

    return NextResponse.json(newRecommendation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating/updating BakuTech recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to create/update BakuTech recommendation', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/bakutech-recommendations - Delete a BakuTech recommendation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing recommendation ID' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Delete the recommendation
    const result = await BakutechRecommendation.findByIdAndDelete(id);
    
    if (!result) {
      return NextResponse.json(
        { error: 'BakuTech recommendation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'BakuTech recommendation deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting BakuTech recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to delete BakuTech recommendation', details: error.message },
      { status: 500 }
    );
  }
}
