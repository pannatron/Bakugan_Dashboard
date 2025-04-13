import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Bakugan from '@/app/lib/models/Bakugan';
import mongoose from 'mongoose';
import { verifyAuth, unauthorized, forbidden } from '@/app/lib/auth';
import PriceHistory from '@/app/lib/models/PriceHistory';

// GET /api/bakugan - Get all Bakugan items or search by name
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all search parameters
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search');
    const sizeParam = searchParams.get('size');
    const elementParam = searchParams.get('element');
    const bakutechParam = searchParams.get('bakutech');
    const excludeSizeParam = searchParams.get('excludeSize');
    const specialPropertiesParam = searchParams.get('specialProperties');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    
    // Add pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Build the query
    const query: any = {};
    
    // Add search query if provided
    if (searchQuery) {
      query.names = { $regex: searchQuery, $options: 'i' };
    }
    
    // Add size and element to query if provided
    if (sizeParam) {
      query.size = sizeParam;
    }
    
    if (elementParam) {
      query.element = elementParam;
    }
    
    // If bakutech=true, filter to only show B3 size
    if (bakutechParam === 'true') {
      query.size = 'B3';
    }
    
    // If excludeSize is provided, exclude that size
    if (excludeSizeParam) {
      query.size = { $ne: excludeSizeParam };
    }
    
    // Add special properties filter if provided
    if (specialPropertiesParam) {
      query.specialProperties = specialPropertiesParam;
    }
    
    // Add price range filters if provided
    if (minPriceParam || maxPriceParam) {
      // We'll filter the results after fetching them based on price history
      // This is because we need to match what's displayed in the UI (which uses price history)
      // We'll keep the query.currentPrice for backward compatibility but will filter again later
      query.currentPrice = {};
      
      if (minPriceParam) {
        query.currentPrice.$gte = 0; // Just ensure it's a positive number
      }
      
      if (maxPriceParam) {
        query.currentPrice.$lte = parseFloat(maxPriceParam) * 10; // Use a higher value to ensure we get all potential matches
      }
    }
    
    // Use lean() for better performance and only select needed fields
    let bakuganItems: any[] = await Bakugan.find(query)
      .select('_id names size element specialProperties imageUrl currentPrice referenceUri createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .lean();
    
    // If price filters are provided, we need to filter based on price history
    if (minPriceParam || maxPriceParam) {
      const minPrice = minPriceParam ? parseFloat(minPriceParam) : 0;
      const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : Number.MAX_SAFE_INTEGER;
      
      // Get all bakugan IDs to fetch their price histories
      const bakuganIds = bakuganItems.map(item => item._id);
      
      // Fetch the most recent price history entry for each Bakugan
      const priceHistories = await PriceHistory.aggregate([
        { $match: { bakuganId: { $in: bakuganIds } } },
        { $sort: { timestamp: -1, _id: -1 } },
        { $group: {
            _id: "$bakuganId",
            price: { $first: "$price" },
            timestamp: { $first: "$timestamp" }
          }
        }
      ]);
      
      // Create a map of bakuganId to latest price
      const priceMap = new Map();
      priceHistories.forEach(history => {
        priceMap.set(history._id.toString(), history.price);
      });
      
      // Filter bakugan items based on their latest price history
      bakuganItems = bakuganItems.filter(item => {
        const latestPrice = priceMap.get(item._id.toString()) || item.currentPrice;
        return latestPrice >= minPrice && latestPrice <= maxPrice;
      });
    }
    
    // Apply pagination after filtering
    const totalCount = bakuganItems.length;
    bakuganItems = bakuganItems.slice(skip, skip + limit);
    
    return NextResponse.json({
      items: bakuganItems,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching Bakugan items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bakugan items', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/bakugan - Create a new Bakugan item
export async function POST(request: NextRequest) {
  try {
    // Authentication check removed - anyone can add Bakugan now

    const body = await request.json();
    const { 
      names, 
      size, 
      element, 
      specialProperties, 
      imageUrl, 
      currentPrice,
      referenceUri,
      date
    } = body;

    if (!names || !size || !element || currentPrice === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();
    
// Check if Bakugan with the same primary name, size, and element already exists
const existingBakugan = await Bakugan.findOne({ 
  $and: [
    { 
      $or: [
        { 'names.0': names[0] },
        { name: names[0] } // For backward compatibility with old schema
      ]
    },
    { size: size },
    { element: element }
  ]
});

// If Bakugan with the same name, size, and element exists, update its price and add to price history
if (existingBakugan) {
  // Update the current price and reference URI if provided
  existingBakugan.currentPrice = currentPrice;
  if (referenceUri) {
    existingBakugan.referenceUri = referenceUri;
  }
  
  // Update the date if provided
  if (date) {
    // Use the date string directly without converting to a Date object
    existingBakugan.date = date;
  }
  
  await existingBakugan.save();

  // Add to price history
  // Always use the date provided by the client
  console.log('Original date from client:', date);
  
  await PriceHistory.create({
    bakuganId: existingBakugan._id,
    price: currentPrice,
    timestamp: date, // Use the date directly as provided by the client
    notes: '', // Remove the "Price updated via Add form" note
    referenceUri: referenceUri || '',
  });

  return NextResponse.json({
    message: 'Bakugan price updated successfully',
    bakugan: existingBakugan
  });
}

    // Create new Bakugan
    // Always use the date provided by the client
    if (!date) {
      console.error('Date is missing in request body:', body);
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }
    
    console.log('Original date for new Bakugan:', date);
    console.log('Request body:', JSON.stringify(body));
    
    const newBakugan = await Bakugan.create({
      names,
      size,
      element,
      specialProperties: specialProperties || 'Normal',
      imageUrl: imageUrl || '',
      currentPrice,
      referenceUri: referenceUri || '',
      date: date, // Use the provided date directly
    });

    // Create initial price history entry for the new Bakugan
    await PriceHistory.create({
      bakuganId: newBakugan._id,
      price: currentPrice,
      timestamp: date, // Use the date directly as provided by the client
      notes: 'Initial price',
      referenceUri: referenceUri || '',
    });

    return NextResponse.json(newBakugan, { status: 201 });
  } catch (error: any) {
    console.error('Error creating Bakugan item:', error);
    return NextResponse.json(
      { error: 'Failed to create Bakugan item', details: error.message },
      { status: 500 }
    );
  }
}
