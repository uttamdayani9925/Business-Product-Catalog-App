const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    images: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function run() {
    try {
        await mongoose.connect('mongodb://localhost:27017/products');
        console.log('Connected to MongoDB');

        // 1. Clear existing expansion products to start fresh with the full lookbook collection
        await Product.deleteMany({
            category: { $in: ['Bridal Lehengas', 'Designer Sarees', 'Fashion Kurtis & Tops'] }
        });
        console.log('Cleared existing expansion products.');

        // 2. Full Lookbook Collection from Bring It Online
        const expansions = [
            // BRIDAL LEHENGAS
            {
                name: 'Heritage Maroon Zardozi Lehenga',
                description: 'Magnificent bridal lehenga with heavy traditional maroon zardozi embroidery. Premium velvet fabric with intricate stone work. A masterpiece of traditional craftsmanship.',
                price: 2200.00,
                category: 'Bridal Lehengas',
                imageUrl: 'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-8_orig.jpg',
                images: [
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-8_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-11_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-13_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-15_orig.jpg'
                ]
            },
            {
                name: 'Crimson Red Velvet Bridal Lehenga',
                description: 'Classic crimson red bridal lehenga with royal velvet finish and heavy gold embroidery. Perfect for a traditional royal wedding theme.',
                price: 1950.00,
                category: 'Bridal Lehengas',
                imageUrl: 'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-50_orig.jpg',
                images: [
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-50_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-51_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-55_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-56_orig.jpg'
                ]
            },
            {
                name: 'Ivory & Gold Regal Lehenga',
                description: 'Sophisticated ivory based lehenga with heavy gold metallic thread work. Elegant and modern take on traditional bridal wear.',
                price: 1800.00,
                category: 'Bridal Lehengas',
                imageUrl: 'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-39_orig.jpg',
                images: [
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-39_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-41_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-42_orig.jpg'
                ]
            },
            {
                name: 'Mint Green Pastel Lehenga',
                description: 'Vibrant and fresh mint green pastel lehenga for the modern bride. Features delicate floral motifs and sequin detailing.',
                price: 1650.00,
                category: 'Bridal Lehengas',
                imageUrl: 'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-70_orig.jpg',
                images: [
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-70_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-73_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-74_orig.jpg'
                ]
            },

            // DESIGNER SAREES
            {
                name: 'Royal Teal Silk Designer Saree',
                description: 'Exquisite teal blue silk saree with designer hand-woven borders. A regal choosing for formal celebrations and luxury events.',
                price: 950.00,
                category: 'Designer Sarees',
                imageUrl: 'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-22_orig.jpg',
                images: [
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-22_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-25_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-28_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-30_orig.jpg'
                ]
            },
            {
                name: 'Emerald Green Festive Drape',
                description: 'Stunning emerald green festive saree featuring a sophisticated silhouette and delicate ethnic textures.',
                price: 850.00,
                category: 'Designer Sarees',
                imageUrl: 'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-60_orig.jpg',
                images: [
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-60_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-61_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-62_orig.jpg'
                ]
            },

            // FASHION KURTIS & TOPS
            {
                name: 'Sunshine Festive Kurti Set',
                description: 'Vibrant sunshine yellow festive kurti with intricate ethnic embroidery. Perfect for light celebrations and daytime festivities.',
                price: 450.00,
                category: 'Fashion Kurtis & Tops',
                imageUrl: 'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-31_orig.jpg',
                images: [
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-31_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-33_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-35_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-36_orig.jpg'
                ]
            },
            {
                name: 'Elegant Peach Fusion Set',
                description: 'Modern peach fusion ethnic set combining traditional embroidery with a contemporary cut. Lightweight and stylish.',
                price: 550.00,
                category: 'Fashion Kurtis & Tops',
                imageUrl: 'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-4_orig.jpg',
                images: [
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-4_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-5_orig.jpg',
                    'https://www.bringitonline.in/uploads/2/2/4/5/22456530/bridal-lehenga-editorial-photography-delhi-6_orig.jpg'
                ]
            }
        ];

        for (const item of expansions) {
            await Product.create(item);
            console.log(`Added Expansion Product: ${item.name} (${item.images.length} images)`);
        }

        console.log('Comprehensive expansion seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
