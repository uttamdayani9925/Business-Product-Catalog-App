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
const guruDir = path.join(__dirname, "../public/images/gurukrupa2");
let guruFiles = fs.existsSync(guruDir) ? fs.readdirSync(guruDir).filter(f => !f.startsWith('.')) : [];

// Sort naturally
const sortNatural = (a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
};
riva1Files.sort(sortNatural);
riva2Files.sort(sortNatural);
guruFiles.sort(sortNatural);

async function run() {
    await mongoose.connect("mongodb://localhost:27017/products", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("Connected to MongoDB local database");

    // Clear old GPOs entirely to avoid duplication and get clean IDs
    await Product.deleteMany({ category: "GPO Catalog" });
    await Product.deleteMany({ name: /GPO/ });
    console.log("Deleted old GPOs");

    // Add 157 GPOs mapping 1 to 1 with the 157 files in Riva folders
    console.log(`Creating ${Math.max(157, riva1Files.length)} GPO Laces...`);
    const count = Math.max(157, riva1Files.length);
    for (let i = 0; i < count; i++) {
        // Exact name match preferred, otherwise array index
        const idxStr = String(i + 1) + ".";

        let r1 = riva1Files.find(name => name.startsWith(idxStr));
        if (!r1 && riva1Files.length) r1 = riva1Files[i % riva1Files.length];

        let r2 = riva2Files.find(name => name.startsWith(idxStr));
        if (!r2 && riva2Files.length) r2 = riva2Files[i % riva2Files.length];

        const url1 = r1 ? `/images/riva1/${r1}` : '';
        const url2 = r2 ? `/images/riva2/${r2}` : '';

        await Product.create({
            name: `Lace Lab Exclusive GPO ${i + 1}`,
            description: `Premium GPO Lace. Precision manufactured with pristine design features.`,
            price: 49.99,
            category: "GPO Catalog",
            imageUrl: url1 || url2, // The 1st image from Riva Fashion Laces folder is primary
            images: [url1, url2].filter(x => !!x)
        });
    }

    // Update Cotton & Polyester (Total 148, which perfectly aligns with 148 files in Gurukrupa Exports)
    console.log("Updating Cotton/Polyester laces with Gurukrupa...");
    const existingLaces = await Product.find({
        $or: [
            { category: "Cotton Lace" },
            { category: "Polyester Lace" }
        ]
    });

    // Sort laces to map 1 to 1 with the sorted array of images (1-148)
    existingLaces.sort((a, b) => sortNatural(a.name, b.name));

    for (let i = 0; i < existingLaces.length; i++) {
        const lace = existingLaces[i];

        let guruImg = "";
        // Extract number like "Cotton Lace 15" -> 15. Check if `15.png` exists in Guru, otherwise use modulo.
        const numMatch = lace.name.match(/\d+/);
        const laceNum = numMatch ? numMatch[0] : String(i + 1);

        const gName = guruFiles.find(name => name.startsWith(laceNum + "."));
        if (gName) {
            guruImg = `/images/gurukrupa2/${gName}`;
        } else if (guruFiles.length > 0) {
            guruImg = `/images/gurukrupa2/${guruFiles[i % guruFiles.length]}`;
        }

        // Clean up arrays with duplicated same image
        let uniqueImages = [...new Set(lace.images || [])];
        if (uniqueImages.length === 0) uniqueImages = [lace.imageUrl];

        // Keep exactly 2 images: 1 orig, 1 from Gurukrupa
        uniqueImages = [lace.imageUrl];

        // Push new Guru image
        if (guruImg && !uniqueImages.includes(guruImg)) {
            uniqueImages.push(guruImg);
        }

        lace.images = uniqueImages;
        await lace.save();
    }

    console.log("Done updating laces.");
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
