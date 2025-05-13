import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectToDatabase } from '../services/dbConnection';
import Country from '../models/country';
import { countryData } from '../data/countries';

// Load environment variables
dotenv.config();

// Seed function
async function seedDatabase() {
  try {
    // Connect to database
    await connectToDatabase();
    console.log('Connected to MongoDB for seeding');
    
    // Check if countries collection is empty
    const countryCount = await Country.countDocuments();
    
    if (countryCount === 0) {
      console.log('Country collection is empty. Seeding data...');
      
      // Insert country data
      const result = await Country.insertMany(countryData);
      console.log(`✅ Successfully seeded ${result.length} countries`);
    } else {
      console.log(`Countries collection already contains ${countryCount} documents. Skipping seeding.`);
    }
    
    console.log('Database seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Execute seed function
seedDatabase();