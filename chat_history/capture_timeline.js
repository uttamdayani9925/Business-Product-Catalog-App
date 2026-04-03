const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setViewport({ width: 1400, height: 700 });
        
        await page.goto(`file://${__dirname}/timeline.html`, { waitUntil: 'load' });
        
        await page.screenshot({ path: 'Report_Screenshots/12_Week_Timeline.png' });
        
        await browser.close();
        console.log('Successfully captured 12_Week_Timeline.png');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
