// liquorseed.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js'; 
import Liquor from '../models/liquorModel.js';

dotenv.config();

// Define the common image object
const image = {
  public_id: 'qhbtpz5hpw3qhgdmfwss',
  url: 'https://res.cloudinary.com/ddjymfoha/image/upload/v1732481636/qhbtpz5hpw3qhgdmfwss.jpg',
};

// liquor entries
const liquors = [
  {
    name: 'Smirnoff Vodka',
    price: 20,
    description: 'A smooth and versatile vodka perfect for any cocktail.',
    images: [image],
    stock: 50,
    category: 'Vodka',
  },
  {
    name: 'Bacardi Rum',
    price: 25,
    description: 'Light and crisp rum ideal for mixing in tropical drinks.',
    images: [image],
    stock: 40,
    category: 'Rum',
  },
  {
    name: 'Patron Tequila',
    price: 35,
    description: 'Premium tequila with a rich, full-bodied flavor.',
    images: [image],
    stock: 30,
    category: 'Tequila',
  },
  {
    name: "Jack Daniel's Whiskey",
    price: 30,
    description: 'Iconic whiskey with a distinctive smooth taste.',
    images: [image],
    stock: 45,
    category: 'Whiskey',
  },
  {
    name: 'Bombay Sapphire Gin',
    price: 28,
    description: 'A refined gin with botanical flavors and a crisp finish.',
    images: [image],
    stock: 35,
    category: 'Gin',
  },
  {
    name: 'Hennessy Brandy',
    price: 40,
    description: 'A high-quality brandy known for its complex aroma and taste.',
    images: [image],
    stock: 20,
    category: 'Brandy',
  },
  {
    name: 'Heineken Beer',
    price: 10,
    description: 'Refreshing beer with a balanced taste and light bitterness.',
    images: [image],
    stock: 100,
    category: 'Beer',
  },
  {
    name: 'Robert Mondavi Wine',
    price: 50,
    description: 'Elegant wine with deep flavors and a long finish.',
    images: [image],
    stock: 25,
    category: 'Wine',
  },
  {
    name: 'Moët & Chandon Champagne',
    price: 60,
    description: 'Luxurious champagne perfect for special celebrations.',
    images: [image],
    stock: 15,
    category: 'Champagne',
  },
  {
    name: 'Gekkeikan Sake',
    price: 22,
    description: 'Traditional Japanese sake with a smooth and delicate profile.',
    images: [image],
    stock: 30,
    category: 'Sake',
  },
];

// Seed function to insert the liquor entries
const seedLiquors = async () => {
  try {
    // Optionally clear existing liquors
    await Liquor.deleteMany();
    // Insert the new liquor entries
    await Liquor.insertMany(liquors);
    console.log('Successfully seeded 10 liquor entries');
  } catch (error) {
    console.error('Error seeding liquors:', error);
  } finally {
    // Close the connection after seeding
    await mongoose.connection.close();
    process.exit();
  }
};

// Connect to the database and run the seed function
const runSeed = async () => {
  try {
    await connectDB();
    console.log('Database connected for seeding');
    await seedLiquors();
  } catch (error) {
    console.error('Error in seeding script:', error);
    process.exit(1);
  }
};

runSeed();
