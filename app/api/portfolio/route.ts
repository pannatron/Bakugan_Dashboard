import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/mongodb';
import Portfolio from '@/app/lib/models/Portfolio';
import Bakugan from '@/app/lib/models/Bakugan';

// GET /api/portfolio - Get user's portfolio
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    await connectDB();
    
    // Get all portfolio items for the user
    const portfolioItems = await Portfolio.find({ userId: session.user.email }).sort({ addedAt: -1 });
    
    // Get all bakugan IDs from the portfolio
    const bakuganIds = portfolioItems.map(item => item.bakuganId);
    
    // Fetch the bakugan details for all items in the portfolio
    const bakuganItems = await Bakugan.find({ _id: { $in: bakuganIds } });
    
    // Map the bakugan details to the portfolio items
    const portfolioWithDetails = portfolioItems.map(item => {
      const bakugan = bakuganItems.find(b => b._id.toString() === item.bakuganId);
      return {
        portfolioId: item._id,
        addedAt: item.addedAt,
        notes: item.notes,
        bakugan: bakugan || null
      };
    });
    
    return NextResponse.json(portfolioWithDetails);
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch portfolio' }, { status: 500 });
  }
}

// POST /api/portfolio - Add bakugan to portfolio
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const { bakuganId, notes } = await req.json();
    
    if (!bakuganId) {
      return NextResponse.json({ error: 'Bakugan ID is required' }, { status: 400 });
    }
    
    await connectDB();
    
    // Check if the bakugan exists
    const bakugan = await Bakugan.findById(bakuganId);
    if (!bakugan) {
      return NextResponse.json({ error: 'Bakugan not found' }, { status: 404 });
    }
    
    // Check if the bakugan is already in the portfolio
    const existingItem = await Portfolio.findOne({ 
      userId: session.user.email, 
      bakuganId 
    });
    
    if (existingItem) {
      return NextResponse.json({ error: 'Bakugan already in portfolio' }, { status: 400 });
    }
    
    // Add the bakugan to the portfolio
    const portfolioItem = new Portfolio({
      userId: session.user.email,
      bakuganId,
      addedAt: new Date(),
      notes: notes || ''
    });
    
    await portfolioItem.save();
    
    return NextResponse.json({ 
      message: 'Bakugan added to portfolio',
      portfolioItem: {
        id: portfolioItem._id,
        bakuganId,
        addedAt: portfolioItem.addedAt,
        notes: portfolioItem.notes
      }
    });
  } catch (error: any) {
    console.error('Error adding to portfolio:', error);
    return NextResponse.json({ error: error.message || 'Failed to add to portfolio' }, { status: 500 });
  }
}
