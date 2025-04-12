import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Bakugan from '@/app/lib/models/Bakugan';
import PriceHistory from '@/app/lib/models/PriceHistory';
import mongoose from 'mongoose';
import { verifyAuth, unauthorized, forbidden } from '@/app/lib/auth';

// GET /api/bakugan/[id] - Get a specific Bakugan item with its price history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid Bakugan ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the Bakugan item with lean() for better performance
    const bakugan = await Bakugan.findById(id).lean();
    if (!bakugan) {
      return NextResponse.json(
        { error: 'Bakugan not found' },
        { status: 404 }
      );
    }

    // Get price history for this Bakugan with optimized query
    // First sort by timestamp (date) in descending order
    // Then for entries with the same date, sort by _id in descending order
    // This ensures that newer entries (added later) appear first when dates are the same
    const priceHistory = await PriceHistory.find({ bakuganId: id })
      .select('_id price timestamp notes referenceUri') // Only select needed fields
      .sort({ timestamp: -1, _id: -1 })
      .limit(20) // Limit to most recent 20 entries for performance
      .lean();

    return NextResponse.json({
      ...bakugan,
      priceHistory,
    });
  } catch (error: any) {
    console.error('Error fetching Bakugan item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bakugan item', details: error.message },
      { status: 500 }
    );
  }
}

  // PATCH /api/bakugan/[id] - Update a Bakugan's price
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check removed - anyone can update Bakugan price now

    const { id } = params;
    const body = await request.json();
    const { price, notes, referenceUri, timestamp } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid Bakugan ID' },
        { status: 400 }
      );
    }

    if (price === undefined || price <= 0) {
      return NextResponse.json(
        { error: 'Valid price is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the Bakugan item
    const bakugan = await Bakugan.findById(id);
    if (!bakugan) {
      return NextResponse.json(
        { error: 'Bakugan not found' },
        { status: 404 }
      );
    }

    // Update the current price and reference URI if provided
    bakugan.currentPrice = price;
    if (referenceUri) {
      bakugan.referenceUri = referenceUri;
    }
    
    // Update the date - it's required
    if (!timestamp) {
      console.error('Timestamp is missing in request body:', body);
      return NextResponse.json(
        { error: 'Timestamp is required' },
        { status: 400 }
      );
    }
    
    console.log('PATCH endpoint received timestamp:', timestamp);
    console.log('PATCH request body:', JSON.stringify(body));
    // Use the timestamp string directly without converting to a Date object
    bakugan.date = timestamp;
    
    await bakugan.save();

    // Add to price history
    // Always use the timestamp provided by the client
    console.log('Original timestamp from client:', timestamp);
    
    const priceHistoryEntry = await PriceHistory.create({
      bakuganId: id,
      price,
      timestamp: timestamp, // Use the timestamp directly as provided by the client
      notes: notes || '',
      referenceUri: referenceUri || '',
    });
    
    console.log('Created price history with timestamp:', timestamp);

    return NextResponse.json({
      bakugan,
      priceHistory: priceHistoryEntry,
    });
  } catch (error: any) {
    console.error('Error updating Bakugan price:', error);
    return NextResponse.json(
      { error: 'Failed to update Bakugan price', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/bakugan/[id] - Update a Bakugan's details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check removed - anyone can update Bakugan details now

    const { id } = params;
    const body = await request.json();
    const { 
      names, 
      size, 
      element, 
      specialProperties, 
      imageUrl,
      referenceUri 
    } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid Bakugan ID' },
        { status: 400 }
      );
    }

    if (!names || !size || !element) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the Bakugan item
    const bakugan = await Bakugan.findById(id);
    if (!bakugan) {
      return NextResponse.json(
        { error: 'Bakugan not found' },
        { status: 404 }
      );
    }

    // Update fields
    bakugan.names = names;
    bakugan.size = size;
    bakugan.element = element;
    bakugan.specialProperties = specialProperties || '';
    if (imageUrl) bakugan.imageUrl = imageUrl;
    if (referenceUri) bakugan.referenceUri = referenceUri;
    
    await bakugan.save();

    return NextResponse.json(bakugan);
  } catch (error: any) {
    console.error('Error updating Bakugan details:', error);
    return NextResponse.json(
      { error: 'Failed to update Bakugan details', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/bakugan/[id] - Delete a Bakugan item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check removed - anyone can delete Bakugan now

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid Bakugan ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find and delete the Bakugan item
    const bakugan = await Bakugan.findByIdAndDelete(id);
    if (!bakugan) {
      return NextResponse.json(
        { error: 'Bakugan not found' },
        { status: 404 }
      );
    }

    // Delete all price history entries for this Bakugan
    await PriceHistory.deleteMany({ bakuganId: id });

    return NextResponse.json(
      { message: 'Bakugan deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting Bakugan item:', error);
    return NextResponse.json(
      { error: 'Failed to delete Bakugan item', details: error.message },
      { status: 500 }
    );
  }
}
