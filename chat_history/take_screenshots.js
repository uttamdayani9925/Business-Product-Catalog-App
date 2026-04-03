const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        if (!fs.existsSync('Report_Screenshots')) {
            fs.mkdirSync('Report_Screenshots');
        }

        console.log('Launching browser visibly...');
        const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'], defaultViewport: null });
        const page = await browser.newPage();

        console.log('Navigating to Home...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: 'Report_Screenshots/5.1_Home_Page.png' });

        console.log('Navigating to Catalog...');
        await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('a, button, li, div, h3'));
            const target = elements.find(el => el.textContent && el.textContent.trim() === 'Catalog');
            if (target) target.click();
        });
        
        console.log('Waiting for products to load...');
        try {
            await page.waitForSelector('.product-card-premium', { timeout: 8000 });
        } catch(e) {
            console.log("Images didn't load in 8s. Trying generic object...");
        }
        await new Promise(r => setTimeout(r, 3000));
        await page.screenshot({ path: 'Report_Screenshots/5.2_Catalogue_Page.png' });

        console.log('Testing Search...');
        const searchInput = await page.$('input[placeholder*="Search"]');
        if (searchInput) {
            await searchInput.type('Cotton Lace');
            await new Promise(r => setTimeout(r, 2000)); // wait for filter
            await page.screenshot({ path: 'Report_Screenshots/5.4_Global_Search.png' });
        }

        console.log('Opening a Product...');
        await page.evaluate(() => {
            const productCards = document.querySelectorAll('.product-card-premium');
            if (productCards.length > 0) productCards[0].click();
        });
        await new Promise(r => setTimeout(r, 3000));
        await page.screenshot({ path: 'Report_Screenshots/5.3_Product_Detail_Split.png' });

        console.log('Rating Section...');
        await page.evaluate(() => window.scrollBy(0, 1000));
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'Report_Screenshots/5.7_Rating_Feedback.png' });
        await page.evaluate(() => window.scrollTo(0, 0));

        console.log('Opening Cart/Add to Quote Drawer...');
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const quoteBtn = btns.find(b => b.textContent && b.textContent.includes('Quote'));
            if (quoteBtn) quoteBtn.click();
        });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: 'Report_Screenshots/5.9_Cart_Drawer.png' });

        // Close Drawer (Clicking dark overlay)
        await page.mouse.click(10, 500); 
        await new Promise(r => setTimeout(r, 1000));

        console.log('Navigating to Lace Lab...');
        await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('a, button, li, div'));
            const target = elements.find(el => el.textContent && el.textContent.trim().toLowerCase().includes('lab'));
            if (target) target.click();
        });
        await new Promise(r => setTimeout(r, 3000));
        await page.screenshot({ path: 'Report_Screenshots/5.5_Lace_Lab.png' });
        
        await page.evaluate(() => window.scrollBy(0, 300));
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'Report_Screenshots/5.6_Lace_Lab_Color.png' });

        console.log('Navigating to Contact/Partners...');
        await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('a, button, li, div'));
            const target = elements.find(el => el.textContent && el.textContent.trim().toLowerCase().includes('contact'));
            if (target) target.click();
        });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: 'Report_Screenshots/5.8_Partners.png' });

        console.log('Navigating to Login/Admin...');
        await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('a, button, li, div'));
            const target = elements.find(el => el.textContent && (el.textContent.trim().toLowerCase() === 'admin login' || el.textContent.trim().toLowerCase() === 'login'));
            if (target) target.click();
        });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: 'Report_Screenshots/5.11_Admin_SignIn.png' });

        await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('a, button, span'));
            const target = elements.find(el => el.textContent && el.textContent.trim().toLowerCase().includes('sign up'));
            if (target) target.click();
        });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: 'Report_Screenshots/5.10_Admin_SignUp.png' });

        await browser.close();
        console.log('All screenshots captured successfully!');
    } catch (e) {
        console.error('Error generating screenshots:', e);
        process.exit(1);
    }
})();
