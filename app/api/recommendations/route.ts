import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Recommendation from '@/app/lib/models/Recommendation';
import Bakugan from '@/app/lib/models/Bakugan';
import mongoose from 'mongoose';

// GET /api/recommendations - Get all recommendations
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all recommendations sorted by rank
    const recommendations = await Recommendation.find({})
      .sort({ rank: 1 })
      .populate({
        path: 'bakuganId',
        model: Bakugan,
        select: 'names size element specialProperties imageUrl currentPrice referenceUri'
      });
    
    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/recommendations - Create or update a recommendation
export async function POST(request: NextRequest) {
  try {
    // Authentication check removed - anyone can update recommendations
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
    const existingRankRecommendation = await Recommendation.findOne({ rank });
    
    // Check if a recommendation for this Bakugan already exists
    const existingBakuganRecommendation = await Recommendation.findOne({ 
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
        message: 'Recommendation ranks swapped successfully',
        recommendation: existingBakuganRecommendation
      });
    }
    
    // If recommendation with this rank exists, update it
    if (existingRankRecommendation) {
      existingRankRecommendation.bakuganId = new mongoose.Types.ObjectId(bakuganId);
      existingRankRecommendation.reason = reason || '';
      await existingRankRecommendation.save();
      
      return NextResponse.json({
        message: 'Recommendation updated successfully',
        recommendation: existingRankRecommendation
      });
    }
    
    // If recommendation for this Bakugan exists, update its rank
    if (existingBakuganRecommendation) {
      existingBakuganRecommendation.rank = rank;
      existingBakuganRecommendation.reason = reason || existingBakuganRecommendation.reason;
      await existingBakuganRecommendation.save();
      
      return NextResponse.json({
        message: 'Recommendation rank updated successfully',
        recommendation: existingBakuganRecommendation
      });
    }
    
    // Create new recommendation
    const newRecommendation = await Recommendation.create({
      bakuganId: new mongoose.Types.ObjectId(bakuganId),
      rank,
      reason: reason || '',
    });

    return NextResponse.json(newRecommendation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating/updating recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to create/update recommendation', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/recommendations - Delete a recommendation
export async function DELETE(request: NextRequest) {
  try {
    // Authentication check removed - anyone can delete recommendations
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
    const result = await Recommendation.findByIdAndDelete(id);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Recommendation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Recommendation deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to delete recommendation', details: error.message },
      { status: 500 }
    );
  }
}
