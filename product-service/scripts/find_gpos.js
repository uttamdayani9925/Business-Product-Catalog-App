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

    // Check for GPOS items
    const gpos = await Product.find({
        $or: [
            { name: /GPOS/i },
            { category: /GPOS/i }
        ]
    });
    console.log("GPOS Items Count:", gpos.length);
    if (gpos.length) console.log("GPOS samples:", JSON.stringify(gpos.slice(0, 5), null, 2));

    // Check GPO Catalog too
    const gpoCatalog = await Product.find({ category: 'GPO Catalog' });
    console.log("GPO Catalog Count:", gpoCatalog.length);
    if (gpoCatalog.length) console.log("GPO Catalog samples:", JSON.stringify(gpoCatalog.slice(0, 5), null, 2));

    process.exit(0);
}
run();
