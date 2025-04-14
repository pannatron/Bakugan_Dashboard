import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import PriceHistory from '@/app/lib/models/PriceHistory';
import Bakugan from '@/app/lib/models/Bakugan';
import mongoose from 'mongoose';

// DELETE /api/price-history/[id] - Delete a specific price history entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid Price History ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the price history entry first to get the bakuganId
    const priceHistory = await PriceHistory.findById(id);
    if (!priceHistory) {
      return NextResponse.json(
        { error: 'Price history entry not found' },
        { status: 404 }
      );
    }

    const bakuganId = priceHistory.bakuganId;

    // Delete the price history entry
    await PriceHistory.findByIdAndDelete(id);

    // Find the most recent price history entry for this Bakugan
    const latestPriceHistory = await PriceHistory.findOne({ bakuganId })
      .sort({ timestamp: -1, _id: -1 })
      .lean() as { price: number; timestamp: string } | null;

    // Update the Bakugan's current price if there's a remaining price history entry
    if (latestPriceHistory) {
      await Bakugan.findByIdAndUpdate(bakuganId, {
        currentPrice: latestPriceHistory.price,
        date: latestPriceHistory.timestamp,
      });
    }

    // Get the updated price history for this Bakugan
    const updatedPriceHistory = await PriceHistory.find({ bakuganId })
      .select('_id price timestamp notes referenceUri')
      .sort({ timestamp: -1, _id: -1 })
      .lean();

    return NextResponse.json({
      message: 'Price history entry deleted successfully',
      priceHistory: updatedPriceHistory,
    });
  } catch (error: any) {
    console.error('Error deleting price history entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete price history entry', details: error.message },
      { status: 500 }
    );
  }
}
