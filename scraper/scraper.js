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
    return res.status(400).json({ 
      success: false,
      message: 'Please provide a valid Meesho URL' 
    });
  }

  let browser;
  try {
    console.log('🔍 Scraping:', url);
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('📄 Loading page...');
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for content
    await page.waitForSelector('h1, img', { timeout: 10000 });
    
    console.log('📦 Extracting data...');
    const productData = await page.evaluate(() => {
      // Get product name
      const name = document.querySelector('h1')?.textContent?.trim() ||
                   document.querySelector('[class*="title"]')?.textContent?.trim() ||
                   'Imported Product';

      // Get prices
      const priceElements = document.querySelectorAll('[class*="price"], [class*="Price"]');
      let price = 999;
      let originalPrice = 1499;
      
      priceElements.forEach(el => {
        const text = el.textContent || '';
        const match = text.match(/₹\s*(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          if (num < price) {
            originalPrice = price;
            price = num;
          } else if (num > price && num < originalPrice) {
            originalPrice = num;
          }
        }
      });

      // Get description
      const description = document.querySelector('[class*="description"], [class*="Description"]')?.textContent?.trim() ||
                         Array.from(document.querySelectorAll('p'))
                           .find(p => p.textContent.length > 50)?.textContent?.trim() ||
                         'Imported product from Meesho. High quality and stylish.';

      // Get images
      const images = Array.from(document.querySelectorAll('img'))
        .map(img => img.src || img.dataset.src || img.getAttribute('data-src'))
        .filter(src => 
          src && 
          src.startsWith('http') &&
          src.includes('meesho') &&
          !src.includes('logo') &&
          !src.includes('icon') &&
          src.length > 50
        )
        .slice(0, 10);

      // Get features
      const features = Array.from(document.querySelectorAll('li, [class*="feature"], [class*="Feature"]'))
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 10 && text.length < 100)
        .slice(0, 4);

      if (features.length === 0) {
        features.push('Premium quality', 'Stylish design', 'Comfortable fit', 'Durable material');
      }

      return {
        name: name.substring(0, 100),
        price,
        originalPrice,
        description: description.substring(0, 500),
        images: [...new Set(images)],
        features
      };
    });

    console.log('✅ Scraped:', productData.name);

    await browser.close();

    if (!productData.images || productData.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No product images found. Please check if the URL is correct.'
      });
    }

    res.json({ success: true, data: productData });

  } catch (error) {
    console.error('❌ Scraping error:', error.message);
    if (browser) await browser.close();
    
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to scrape product'
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Meesho Scraper API running on http://localhost:${PORT}`);
  console.log(`📡 Ready to receive scrape requests\n`);
});