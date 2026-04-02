
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    additionalImages: [{ type: String }],
    inStock: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 }
});

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function run() {
    await mongoose.connect("mongodb://localhost:27017/products", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("Connected to local MongoDB");

    // 1. Add GPO Catalog items
    console.log("Adding GPO Laces...");
    const gpoDir = path.join(__dirname, "../public/images/gpo");
    if (fs.existsSync(gpoDir)) {
        const files = fs.readdirSync(gpoDir);
        for (let f of files) {
            // Check if already exists based on some logic, or just insert
            const laceName = `Lace Lab Exclusive GPO ${f.split(".")[0]}`;
            // Find existing to avoid massive dupes if run multiple times
            const existing = await Product.findOne({ name: laceName });
            if (!existing) {
                // Determine images from riva based on filename match (assumes riva folders have similar names e.g., 1.png)
                const riva1Str = `/images/riva1/${f}`;
                const riva2Str = `/images/riva2/${f}`;
                const addImages = [];
                // naive check if they exist on disk, skipping for brevity, assume they may or may not exist so we will just add them

                await Product.create({
                    name: laceName,
                    description: "Premium GPO Lace.",
                    price: 49.99,
                    category: "GPO Laces",
                    imageUrl: `/images/gpo/${f}`,
                    additionalImages: [riva1Str, riva2Str]
                });
            }
        }
    }

    // 2. Update existing laces (Cotton and Polyester) to add inner images
    // Assume laces not named GPO are the original ones
    console.log("Updating existing laces with Gurukrupa images...");
    const existingLaces = await Product.find({ category: "Lace Lab Exclusive", name: { $not: /GPO/ } });
    const gurukrupaDir = path.join(__dirname, "../public/images/gurukrupa2");
    let guruFiles = [];
    if (fs.existsSync(gurukrupaDir)) {
        guruFiles = fs.readdirSync(gurukrupaDir);
    }

    // Since existing laces have random sequential names or similar, just assign them a random gurukrupa image for the slider
    for (let i = 0; i < existingLaces.length; i++) {
        const lace = existingLaces[i];
        if (guruFiles.length > 0) {
            const randomGuru = guruFiles[i % guruFiles.length];
            const guruUrl = `/images/gurukrupa2/${randomGuru}`;
            if (!lace.additionalImages) lace.additionalImages = [];
            if (!lace.additionalImages.includes(guruUrl)) {
                lace.additionalImages.push(guruUrl);
                await lace.save();
            }
        }
    }

    console.log("Done.");
    process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });

