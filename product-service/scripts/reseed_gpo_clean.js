const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    images: [{ type: String }],
    inStock: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 }
});

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const riva1Dir = path.join(__dirname, "../public/images/riva1");
let riva1Files = fs.existsSync(riva1Dir) ? fs.readdirSync(riva1Dir).filter(f => !f.startsWith('.')) : [];
const riva2Dir = path.join(__dirname, "../public/images/riva2");
let riva2Files = fs.existsSync(riva2Dir) ? fs.readdirSync(riva2Dir).filter(f => !f.startsWith('.')) : [];

// Sort naturally
const sortNatural = (a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
};
riva1Files.sort(sortNatural);
riva2Files.sort(sortNatural);

async function run() {
    await mongoose.connect("mongodb://localhost:27017/products", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("Connected to MongoDB");

    // Clear all traces of GPOs with ANY category variation to be super clean
    await Product.deleteMany({
        $or: [
            { category: { $regex: /GPO/i } },
            { name: { $regex: /GPO/i } }
        ]
    });
    console.log("Cleared old GPO entries");

    // Add 157 GPOs mapping 1 to 1
    console.log(`Creating 157 GPO Laces in 'GPO Catalog'...`);
    for (let i = 0; i < 157; i++) {
        const fileNum = i + 1;
        const fileName = `${fileNum}.png`;

        // Check if file actually exists in both folders
        const r1Exists = riva1Files.includes(fileName);
        const r2Exists = riva2Files.includes(fileName);

        const url1 = r1Exists ? `/images/riva1/${fileName}` : (riva1Files[i % riva1Files.length] ? `/images/riva1/${riva1Files[i % riva1Files.length]}` : '');
        const url2 = r2Exists ? `/images/riva2/${fileName}` : (riva2Files[i % riva2Files.length] ? `/images/riva2/${riva2Files[i % riva2Files.length]}` : '');

        await Product.create({
            name: `Lace Lab Exclusive GPO ${fileNum}`,
            description: `Premium GPO Lace. Precision manufactured with pristine design features. High-quality thread and intricate embroidery.`,
            price: 75.00,
            category: "GPO Catalog",
            imageUrl: url1 || url2,
            images: [url1, url2].filter(x => !!x)
        });
    }

    console.log("Done seeding GPO Catalog.");
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
