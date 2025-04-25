import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/mongodb';
import Favorites from '@/app/lib/models/Favorites';

// DELETE /api/favorites/[id] - Remove bakugan from favorites
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const favoriteId = params.id;
    
    if (!favoriteId) {
      return NextResponse.json({ error: 'Favorite item ID is required' }, { status: 400 });
    }
    
    await connectDB();
    
    // Find the favorite item
    const favoriteItem = await Favorites.findById(favoriteId);
    
    if (!favoriteItem) {
      return NextResponse.json({ error: 'Favorite item not found' }, { status: 404 });
    }
    
    // Check if the favorite item belongs to the user
    if (favoriteItem.userId !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Remove the favorite item
    await Favorites.findByIdAndDelete(favoriteId);
    
    return NextResponse.json({ 
      message: 'Bakugan removed from favorites',
      favoriteId
    });
  } catch (error: any) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json({ error: error.message || 'Failed to remove from favorites' }, { status: 500 });
  }
}
