const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'products.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
        return;
    }
    console.log('Connected to database');
});

const queries = [
    "SELECT count(*) as count, category FROM products GROUP BY category",
    "SELECT id, name, category, image_url FROM products WHERE category = 'Lace Lab Exclusive' LIMIT 5",
    "SELECT id, name, category, image_url FROM products WHERE category IN ('Cotton Laces', 'Polyester Laces') LIMIT 5"
];

db.serialize(() => {
    queries.forEach(query => {
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error("Query failed:", query, err);
            } else {
                console.log("\nQuery:", query);
                console.table(rows);
            }
        });
    });
});

db.close();
