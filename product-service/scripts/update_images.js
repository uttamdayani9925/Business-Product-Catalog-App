const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    images: [{ type: String }],
});

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const guruDir = path.join(__dirname, "../public/images/gurukrupa2");
let guruFiles = [];
if (fs.existsSync(guruDir)) {
    guruFiles = fs.readdirSync(guruDir);
}

const riva1Dir = path.join(__dirname, "../public/images/riva1");
let riva1Files = [];
if (fs.existsSync(riva1Dir)) {
    riva1Files = fs.readdirSync(riva1Dir);
}

const riva2Dir = path.join(__dirname, "../public/images/riva2");
let riva2Files = [];
if (fs.existsSync(riva2Dir)) {
    riva2Files = fs.readdirSync(riva2Dir);
}

async function run() {
    await mongoose.connect("mongodb://localhost:27017/products", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("Connected to local MongoDB");

    // 1. Update GPO Laces (already added) to have the proper array using the existing logic
    console.log("Fixing GPO images arrays...");
    const gpos = await Product.find({ name: /GPO/ });
    for (let i = 0; i < gpos.length; i++) {
        const gpo = gpos[i];

        // Match the number suffix from GPO 1.jpeg etc.
        const numMatch = gpo.imageUrl.match(/\/(\d+)\.jpeg$/);
        const nameSuffix = numMatch ? numMatch[1] : '';

        // Safely pick from riva if it doesn't match name directly, but better let's try to match by name
        let r1 = r1NameMatch(nameSuffix);
        let r2 = r2NameMatch(nameSuffix);

        gpo.images = [gpo.imageUrl];
        if (r1) gpo.images.push(r1);
        if (r2) gpo.images.push(r2);

        await gpo.save();
    }

    // 2. Update existing laces (Cotton and Polyester)
    console.log("Updating Cotton/Polyester laces with Gurukrupa images...");
    const existingLaces = await Product.find({
        $or: [
            { name: /Cotton Lace/i },
            { name: /Polyester Lace/i },
            { name: /Lab Texture Sample/i }
        ]
    });

    let guruIndex = 0;
    for (let i = 0; i < existingLaces.length; i++) {
        const lace = existingLaces[i];

        if (!lace.images || lace.images.length === 0) {
            lace.images = [lace.imageUrl]; // Ensure primary image is first
        }

        if (guruFiles.length > 0) {
            // Pick a sequential gurukrupa image
            const randomGuru = guruFiles[guruIndex % guruFiles.length];
            guruIndex++;
            const guruUrl = `/images/gurukrupa2/${randomGuru}`;

            if (!lace.images.includes(guruUrl)) {
                lace.images.push(guruUrl);
                await lace.save();
            }
        }
    }

    console.log("Done updating MongoDB images arrays.");
    process.exit(0);
}

function r1NameMatch(nameSuffix) {
    if (!nameSuffix) return "";
    const found = riva1Files.find(f => f.startsWith(nameSuffix + "."));
    return found ? `/images/riva1/${found}` : `/images/riva1/${riva1Files[0]}`;
}

function r2NameMatch(nameSuffix) {
    if (!nameSuffix) return "";
    const found = riva2Files.find(f => f.startsWith(nameSuffix + "."));
    return found ? `/images/riva2/${found}` : `/images/riva2/${riva2Files[0]}`;
}

run().catch(err => { console.error(err); process.exit(1); });
