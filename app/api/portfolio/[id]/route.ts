import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/mongodb';
import Portfolio from '@/app/lib/models/Portfolio';

// DELETE /api/portfolio/[id] - Remove bakugan from portfolio
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const portfolioId = params.id;
    
    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio item ID is required' }, { status: 400 });
    }
    
    await connectDB();
    
    // Find the portfolio item
    const portfolioItem = await Portfolio.findById(portfolioId);
    
    if (!portfolioItem) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });
    }
    
    // Check if the portfolio item belongs to the user
    if (portfolioItem.userId !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Remove the portfolio item
    await Portfolio.findByIdAndDelete(portfolioId);
    
    return NextResponse.json({ 
      message: 'Bakugan removed from portfolio',
      portfolioId
    });
  } catch (error: any) {
    console.error('Error removing from portfolio:', error);
    return NextResponse.json({ error: error.message || 'Failed to remove from portfolio' }, { status: 500 });
  }
}
