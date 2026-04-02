
const fs = require("fs");
const path = require("path");

function copyDir(src, dest) {
    if(!fs.existsSync(dest)) fs.mkdirSync(dest, {recursive: true});
    const files = fs.readdirSync(src);
    for(let f of files) {
        fs.copyFileSync(path.join(src, f), path.join(dest, f));
    }
}

const projRoot = "C:/Users/Uttam Dayani/Uttam Dayani/Desktop/Business-Product-Catalog-App";
copyDir(path.join(projRoot, "Riva Fashion Laces"), path.join(__dirname, "../public/images/riva1"));
copyDir(path.join(projRoot, "Riva Fashion 2nd Laces"), path.join(__dirname, "../public/images/riva2"));
copyDir(path.join(projRoot, "Gurukrupa Exports 2nd Laces"), path.join(__dirname, "../public/images/gurukrupa2"));
console.log("Images copied.");

