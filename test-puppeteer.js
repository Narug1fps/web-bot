const puppeteer = require('puppeteer-core');

(async () => {
    try {
        console.log('Testing Puppeteer launch...');
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });
        console.log('Browser launched successfully!');
        await browser.close();
        console.log('Browser closed successfully!');
    } catch (error) {
        console.error('Failed to launch browser:', error);
    }
})();
