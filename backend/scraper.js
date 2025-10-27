import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Meesho Scraper API Running' });
});

// Scrape endpoint
app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  
  if (!url || !url.includes('meesho.com')) {
    return res.status(400).json({ error: 'Invalid Meesho URL' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content to load
    await page.waitForSelector('h1, [data-testid="product-title"]', { timeout: 10000 });

    const productData = await page.evaluate(() => {
      // Extract product name
      const name = document.querySelector('h1')?.textContent?.trim() || 
                   document.querySelector('[data-testid="product-title"]')?.textContent?.trim() ||
                   document.querySelector('.product-title')?.textContent?.trim() ||
                   'Imported Product';

      // Extract prices
      const priceText = document.querySelector('[data-testid="product-price"]')?.textContent ||
                        document.querySelector('.price')?.textContent ||
                        document.querySelector('[class*="price"]')?.textContent || '';
      
      const prices = priceText.match(/₹\s*(\d+)/g) || [];
      const price = prices[0] ? parseInt(prices[0].replace(/[^\d]/g, '')) : 999;
      const originalPrice = prices[1] ? parseInt(prices[1].replace(/[^\d]/g, '')) : price + 500;

      // Extract description
      const description = document.querySelector('[data-testid="product-description"]')?.textContent?.trim() ||
                         document.querySelector('.description')?.textContent?.trim() ||
                         document.querySelector('[class*="description"]')?.textContent?.trim() ||
                         'Imported from Meesho - Add your description';

      // Extract images
      const images = Array.from(document.querySelectorAll('img'))
        .map(img => img.src || img.dataset.src)
        .filter(src => src && 
                src.includes('meesho') && 
                !src.includes('logo') && 
                !src.includes('icon') &&
                src.startsWith('http'))
        .slice(0, 10);

      // Extract features/highlights
      const features = Array.from(document.querySelectorAll('li, [class*="highlight"], [class*="feature"]'))
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 5 && text.length < 100)
        .slice(0, 4);

      return {
        name,
        price,
        originalPrice,
        description: description.substring(0, 500),
        images: [...new Set(images)], // Remove duplicates
        features: features.length > 0 ? features : [
          'High quality material',
          'Perfect fit',
          'Durable',
          'Stylish design'
        ]
      };
    });

    await browser.close();

    // Validate data
    if (!productData.name || productData.name === 'Imported Product') {
      throw new Error('Could not extract product details. Try another URL.');
    }

    if (productData.images.length === 0) {
      throw new Error('No images found. Check if URL is correct.');
    }

    res.json({ success: true, data: productData });

  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to scrape product', 
      message: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Scraper API running on port ${PORT}`);
});