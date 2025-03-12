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
    
    // Check if there's a search query
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search');
    
    if (searchQuery) {
      // Get additional search parameters for size and element
      const sizeParam = searchParams.get('size');
      const elementParam = searchParams.get('element');
      
      // Build the query
      const query: any = {
        names: { $regex: searchQuery, $options: 'i' }
      };
      
      // Add size and element to query if provided
      if (sizeParam) {
        query.size = sizeParam;
      }
      
      if (elementParam) {
        query.element = elementParam;
      }
      
      // Search by name (case-insensitive) and optionally by size and element
      const bakuganItems = await Bakugan.find(query).sort({ updatedAt: -1 }).limit(5);
      
      return NextResponse.json(bakuganItems);
    } else {
      // Get all Bakugan items
      const bakuganItems = await Bakugan.find({}).sort({ updatedAt: -1 });
      return NextResponse.json(bakuganItems);
    }
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
    notes: 'Price updated via Add form', // Add a note to indicate this was from the Add form
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

    return NextResponse.json(newBakugan, { status: 201 });
  } catch (error: any) {
    console.error('Error creating Bakugan item:', error);
    return NextResponse.json(
      { error: 'Failed to create Bakugan item', details: error.message },
      { status: 500 }
    );
  }
}
