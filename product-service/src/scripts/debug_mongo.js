const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/database');
require('dotenv').config();

const debugMongo = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const counts = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);
        console.log('\nCategory Counts:');
        console.table(counts);

        const laceLabItems = await Product.find({ category: 'Lace Lab Exclusive' }).limit(5);
        console.log('\nLace Lab Exclusive Items (Top 5):');
        laceLabItems.forEach(p => console.log(`${p.name}: ${p.imageUrl}`));

        const catalogItems = await Product.find({ category: { $in: ['Cotton Lace', 'Polyester Lace'] } }).limit(5);
        console.log('\nCatalog Items (Top 5):');
        catalogItems.forEach(p => console.log(`${p.name}: ${p.imageUrl}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugMongo();
