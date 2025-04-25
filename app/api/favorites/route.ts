import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/mongodb';
import Favorites from '@/app/lib/models/Favorites';
import Bakugan from '@/app/lib/models/Bakugan';

// GET /api/favorites - Get user's favorites
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    await connectDB();
    
    // Get all favorite items for the user
    const favoriteItems = await Favorites.find({ userId: session.user.email }).sort({ addedAt: -1 });
    
    // Get all bakugan IDs from the favorites
    const bakuganIds = favoriteItems.map(item => item.bakuganId);
    
    // Fetch the bakugan details for all items in the favorites
    const bakuganItems = await Bakugan.find({ _id: { $in: bakuganIds } });
    
    // Map the bakugan details to the favorite items
    const favoritesWithDetails = favoriteItems.map(item => {
      const bakugan = bakuganItems.find(b => b._id.toString() === item.bakuganId);
      return {
        favoriteId: item._id,
        addedAt: item.addedAt,
        notes: item.notes,
        bakugan: bakugan || null
      };
    });
    
    return NextResponse.json(favoritesWithDetails);
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch favorites' }, { status: 500 });
  }
}

// POST /api/favorites - Add bakugan to favorites
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
    
    // Check if the bakugan is already in favorites
    const existingItem = await Favorites.findOne({ 
      userId: session.user.email, 
      bakuganId 
    });
    
    if (existingItem) {
      return NextResponse.json({ error: 'Bakugan already in favorites' }, { status: 400 });
    }
    
    // Add the bakugan to favorites
    const favoriteItem = new Favorites({
      userId: session.user.email,
      bakuganId,
      addedAt: new Date(),
      notes: notes || ''
    });
    
    await favoriteItem.save();
    
    return NextResponse.json({ 
      message: 'Bakugan added to favorites',
      favoriteItem: {
        id: favoriteItem._id,
        bakuganId,
        addedAt: favoriteItem.addedAt,
        notes: favoriteItem.notes
      }
    });
  } catch (error: any) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json({ error: error.message || 'Failed to add to favorites' }, { status: 500 });
  }
}
