// Migration script to add quantity field to all portfolio items
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bakugan-dashboard';
console.log('Using MongoDB URI:', MONGODB_URI);

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Define Portfolio schema
const portfolioSchema = new mongoose.Schema({
  userId: String,
  bakuganId: String,
  addedAt: Date,
  notes: String,
  quantity: {
    type: Number,
    default: 1
  },
  createdAt: Date,
  updatedAt: Date
});

// Create model
const Portfolio = mongoose.models.Portfolio || mongoose.model('Portfolio', portfolioSchema);

async function migrateData() {
  try {
    // Find all portfolio items
    const portfolioItems = await Portfolio.find({});
    console.log(`Found ${portfolioItems.length} portfolio items`);
    
    // Use updateMany to add quantity field to all documents that don't have it
    const result = await Portfolio.updateMany(
      { quantity: { $exists: false } },
      { $set: { quantity: 1 } }
    );
    
    console.log(`Migration complete. Updated ${result.modifiedCount} items.`);
    
    // Verify all documents now have quantity field
    const itemsWithQuantity = await Portfolio.find({ quantity: { $exists: true } });
    console.log(`Items with quantity field: ${itemsWithQuantity.length}`);
    
    // Log a sample document to verify structure
    const sampleItem = await Portfolio.findOne({});
    if (sampleItem) {
      console.log('Sample document structure:');
      console.log(JSON.stringify(sampleItem.toObject(), null, 2));
    }
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
async function run() {
  await connectToDatabase();
  await migrateData();
  process.exit(0);
}

run();
