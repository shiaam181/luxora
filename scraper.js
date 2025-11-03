import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Meesho Scraper Running ✅' });
});

// Scrape endpoint
app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  
  console.log('📥 Received request:', url);
  
  if (!url || !url.includes('meesho.com')) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid Meesho URL' 
    });
  }

  let browser;
  try {
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('🌐 Opening Meesho page...');
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });
    
    // Wait for product to load
    console.log('⏳ Waiting for content...');
    await page.waitForSelector('h1, [data-testid="product-title"], .sc-eDvSVe', { timeout: 15000 });
    
    // Small delay to ensure all content loads
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🔍 Extracting product data...');
    const productData = await page.evaluate(() => {
      // Helper function to clean text
      const cleanText = (text) => text?.trim().replace(/\s+/g, ' ') || '';
      
      // Extract product name (try multiple selectors)
      const name = cleanText(
        document.querySelector('h1')?.textContent ||
        document.querySelector('[data-testid="product-title"]')?.textContent ||
        document.querySelector('.sc-eDvSVe')?.textContent ||
        document.querySelector('[class*="ProductTitle"]')?.textContent ||
        'Imported Product from Meesho'
      );

      // Extract prices
      let price = 999;
      let originalPrice = 1499;
      
      const priceElements = document.querySelectorAll('[class*="price"], [class*="Price"], h4, h5');
      const prices = [];
      
      priceElements.forEach(el => {
        const text = el.textContent;
        const matches = text.match(/₹\s*(\d+)/g);
        if (matches) {
          matches.forEach(m => {
            const num = parseInt(m.replace(/[^\d]/g, ''));
            if (num > 0 && num < 50000) prices.push(num);
          });
        }
      });
      
      if (prices.length > 0) {
        prices.sort((a, b) => a - b);
        price = prices[0];
        originalPrice = prices[prices.length - 1] || Math.round(price * 1.5);
      }

      // Extract description
      const description = cleanText(
        document.querySelector('[class*="description"]')?.textContent ||
        document.querySelector('[class*="Description"]')?.textContent ||
        document.querySelector('p[class*="detail"]')?.textContent ||
        Array.from(document.querySelectorAll('p'))
          .find(p => p.textContent.length > 50)?.textContent ||
        'Premium quality product imported from Meesho. Add your custom description here.'
      ).substring(0, 500);

      // Extract images
      const imageElements = document.querySelectorAll('img');
      const images = [];
      
      imageElements.forEach(img => {
        const src = img.src || img.dataset.src || img.getAttribute('data-src');
        if (src && 
            src.startsWith('http') && 
            (src.includes('meesho') || src.includes('cloudinary')) &&
            !src.includes('logo') && 
            !src.includes('icon') &&
            !src.includes('avatar')) {
          images.push(src);
        }
      });

      // Extract features
      const features = [];
      document.querySelectorAll('li, [class*="highlight"], [class*="feature"], [class*="specification"]').forEach(el => {
        const text = cleanText(el.textContent);
        if (text.length > 5 && text.length < 100 && !text.includes('©') && !text.includes('Login')) {
          features.push(text);
        }
      });

      return {
        name,
        price,
        originalPrice,
        description,
        images: [...new Set(images)].slice(0, 10), // Remove duplicates, max 10
        features: features.slice(0, 4).length > 0 ? features.slice(0, 4) : [
          'High quality material',
          'Premium finish',
          'Perfect for daily use',
          'Excellent craftsmanship'
        ]
      };
    });

    await browser.close();

    // Validate extracted data
    if (!productData.name || productData.name === 'Imported Product from Meesho') {
      throw new Error('Could not extract product name. The page structure might have changed.');
    }

    if (productData.images.length === 0) {
      throw new Error('No product images found. Please check if the URL is correct.');
    }

    console.log('✅ Successfully extracted:', productData.name);
    console.log('📸 Images found:', productData.images.length);

    res.json({ 
      success: true, 
      data: productData,
      message: 'Product imported successfully!'
    });

  } catch (error) {
    if (browser) await browser.close();
    
    console.error('❌ Scraping error:', error.message);
    
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to scrape product',
      hint: 'Make sure the Meesho URL is correct and the product page is accessible'
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Meesho Scraper API is running!`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`✅ Ready to accept scraping requests\n`);
});