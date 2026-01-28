const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/database');
require('dotenv').config();

const seedProducts = async () => {
  try {
    await Product.deleteMany({});
    console.log('Previous products removed');

    const products = [];

    // Designer Saree Images (Unsplash for now, until local provided)
    const sareeImages = [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1583391733956-628d3e236357?auto=format&fit=crop&w=500&q=80',
    ];

    // Salwar Suit / Kurti Images (Unsplash for now)
    const kurtiImages = [
      'https://images.unsplash.com/photo-1630734277837-7b2462d7c0f1?auto=format&fit=crop&w=500&q=80', // Model in Kurti
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=500&q=80'
    ];

    // Premium Lace Collection (Real Assets from Desktop/Products)
    // Files: 13.jpg to 160.jpg (based on file list)
    // We will scan a safe range or specific known files. 
    // The user provided folder has 13.jpg...160.jpg.

    // =========================================================
    // 1. CATALOG SECTION (Cotton & Polyester Laces)
    // Source: Original 'Cotton Laces' and 'Polyester Laces' folders (.png)
    // IDs: 1-148
    // =========================================================

    // Cotton Laces (ID 1-88) - Displayed in Catalog
    for (let i = 1; i <= 88; i++) {
      const imgPath = `/images/${i}.png`;
      products.push({
        name: `Premium Cotton Lace ${i}`,
        description: `High-quality pure cotton lace design ${i}. Soft texture suitable for summer wear.`,
        price: 18.00 + (i % 15),
        category: 'Cotton Lace',
        imageUrl: imgPath,
        images: [imgPath, imgPath],
        averageRating: 0,
        ratingsCount: 0
      });
    }

    // Polyester Laces (ID 89-148) - Displayed in Catalog
    for (let i = 89; i <= 148; i++) {
      const imgPath = `/images/${i}.png`;
      products.push({
        name: `Royal Polyester Lace ${i}`,
        description: `Durable and shiny polyester lace design ${i}. Ideal for party wear and sarees.`,
        price: 22.00 + (i % 20),
        category: 'Polyester Lace',
        imageUrl: imgPath,
        images: [imgPath, imgPath],
        averageRating: 0,
        ratingsCount: 0
      });
    }

    // =========================================================
    // 2. LACE LAB SECTION (Exclusive Textures)
    // Source: 'Products' folder (.jpg)
    // IDs: 13-160
    // These are COMPLETELY SEPARATE from the Catalog.
    // =========================================================
    // Range 2: Lace Lab Exclusive (13-160)
    for (let i = 13; i <= 160; i++) {
      const imgPath = `/images/${i}.jpg`;
      products.push({
        name: `Lab Texture Sample ${i}`,
        description: `High-resolution scan for Texture Contrast Lab usage only.`,
        price: 25.00,
        category: 'Lace Lab Exclusive',
        imageUrl: imgPath,
        images: [imgPath, imgPath],
        averageRating: 0,
        ratingsCount: 0
      });
    }

    // Range 3: Designer Saree (New Category)
    for (let i = 1; i <= 10; i++) {
      const img = sareeImages[i % sareeImages.length];
      products.push({
        name: `Designer Saree Collection ${i}`,
        description: `Exclusive Designer Saree ${i} with heavy embroidery and lace borders.`,
        price: 49.99 + (i * 2),
        category: 'Exclusive Zari & Others',
        imageUrl: img,
        images: [img, img],
        averageRating: 0,
        ratingsCount: 0
      });
    }

    // Range 4: Kurti / Top (Renamed from Salwar Suit)
    for (let i = 1; i <= 10; i++) {
      const img = kurtiImages[i % kurtiImages.length];
      products.push({
        name: `Premium Kurti & Top Set ${i}`,
        description: `High-quality fabric for Kurtis and Tops. Set ${i}.`,
        price: 39.99 + (i * 2),
        category: 'Exclusive Zari & Others',
        imageUrl: img,
        images: [img, img],
        averageRating: 0,
        ratingsCount: 0
      });
    }

    await Product.insertMany(products);
    console.log(`${products.length} products seeded successfully! (Cotton 1-88, Polyester 89-148, +Others)`);

    if (require.main === module) {
      mongoose.disconnect();
    }
  } catch (error) {
    console.error('Error seeding products:', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  connectDB().then(() => seedProducts());
}

module.exports = seedProducts;
