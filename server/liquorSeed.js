// liquorseed.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js'; 
import Liquor from '../models/liquorModel.js';

dotenv.config();

// Define image objects using provided details
const image1 = {
  public_id: 'gt2srnec008szd7roh6j',
  url: 'https://res.cloudinary.com/ddjymfoha/image/upload/v1732481546/gt2srnec008szd7roh6j.jpg',
};

const image2 = {
  public_id: 'ekxxdnz1vvroaaalqmmr',
  url: 'https://res.cloudinary.com/ddjymfoha/image/upload/v1732197882/ekxxdnz1vvroaaalqmmr.png',
};

const image3 = {
  public_id: 'uxnw1m7naidlkhupqbyy',
  url: 'https://res.cloudinary.com/ddjymfoha/image/upload/v1732197875/uxnw1m7naidlkhupqbyy.jpg',
};

// liquor entries, each with all three images
const liquors = [
  {
    name: 'Smirnoff Vodka',
    price: 20,
    description: 'A smooth and versatile vodka perfect for any cocktail.',
    images: [image1, image2, image3],
    stock: 50,
    brand: 'Diageo',
    category: 'Vodka',
  },
  {
    name: 'Bacardi Rum',
    price: 25,
    description: 'Light and crisp rum ideal for mixing in tropical drinks.',
    images: [image1, image2, image3],
    stock: 40,
    brand: 'Bacardi Limited',
    category: 'Rum',
  },
  {
    name: 'Patron Tequila',
    price: 35,
    description: 'Premium tequila with a rich, full-bodied flavor.',
    images: [image1, image2, image3],
    stock: 30,
    brand: 'Bacardi Brands',
    category: 'Tequila',
  },
  {
    name: "Jack Daniel's",
    price: 30,
    description: 'Iconic whiskey with a distinctive smooth taste.',
    images: [image1, image2, image3],
    stock: 45,
    brand: "Brown–Forman",
    category: 'Whiskey',
  },
  {
    name: 'Bombay Sapphire',
    price: 28,
    description: 'A refined gin with botanical flavors and a crisp finish.',
    images: [image1, image2, image3],
    stock: 35,
    brand: 'Bacardi Brands',
    category: 'Gin',
  },
  {
    name: 'Hennessy',
    price: 40,
    description: 'A high-quality brandy known for its complex aroma and taste.',
    images: [image1, image2, image3],
    stock: 20,
    brand: 'Jas Hennessy & Cie',
    category: 'Brandy',
  },
  {
    name: 'Heineken Beer',
    price: 10,
    description: 'Refreshing beer with a balanced taste and light bitterness.',
    images: [image1, image2, image3],
    stock: 100,
    brand: 'Heineken',
    category: 'Beer',
  },
  {
    name: 'Robert Mondavi',
    price: 50,
    description: 'Elegant wine with deep flavors and a long finish.',
    images: [image1, image2, image3],
    stock: 25,
    brand: 'Constellation Brands',
    category: 'Wine',
  },
  {
    name: 'Moët & Chandon',
    price: 60,
    description: 'Luxurious champagne perfect for special celebrations.',
    images: [image1, image2, image3],
    stock: 15,
    brand: 'BRUT',
    category: 'Champagne',
  },
  {
    name: 'Gekkeikan',
    price: 22,
    description: 'Traditional Japanese sake with a smooth and delicate profile.',
    images: [image1, image2, image3],
    stock: 30,
    brand: 'Gekkeikan',
    category: 'Sake',
  },
];

// Seed function to insert the liquor entries
const seedLiquors = async () => {
  try {
    // Optionally clear existing liquors
    // await Liquor.deleteMany();
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
