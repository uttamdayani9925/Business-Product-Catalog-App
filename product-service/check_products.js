const http = require('http');

const check = () => {
    http.get('http://localhost:5000/api/products', (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log('Success:', json.success);
                console.log('Total Products:', json.data ? json.data.length : 0);

                if (json.data) {
                    const cotton = json.data.find(p => p.category === 'Cotton Lace');
                    const poly = json.data.find(p => p.category === 'Polyester Lace');

                    console.log('Sample Cotton:', cotton ? { name: cotton.name, img: cotton.imageUrl } : 'None');
                    console.log('Sample Poly:', poly ? { name: poly.name, img: poly.imageUrl } : 'None');
                }
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                console.log('Raw data snippet:', data.substring(0, 100));
            }
        });
    }).on('error', (err) => {
        console.error('Error fetching:', err.message);
    });
};

check();
