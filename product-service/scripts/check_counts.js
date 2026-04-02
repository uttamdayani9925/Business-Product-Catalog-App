const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: String,
    category: String,
    images: [String],
    imageUrl: String
});
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function run() {
    await mongoose.connect('mongodb://localhost:27017/products');
    console.log("Connected");
    const counts = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    console.log(JSON.stringify(counts, null, 2));

    const samples = await Product.find({ category: 'GPO Catalog' }).limit(3);
    console.log("GPO Samples:", JSON.stringify(samples, null, 2));

    process.exit(0);
}
run();
