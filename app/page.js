'use client'
import React, { useState, createContext, useContext, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';
import { getAll, getOne, create, update, remove, subscribe } from '@/lib/firestore';
import { uploadImage, deleteImage, getOptimizedUrl } from '@/lib/cloudinary';
import { loginAdmin, logoutAdmin, onAuthChange } from '@/lib/auth';
import { ShoppingCart, Heart, Menu, X, Home, Package, Star, Trash2, Plus, Minus, Facebook, Twitter, Instagram, Mail, Phone, MapPin, Search, AlertCircle, ChevronLeft, ChevronRight, Filter, TrendingUp, Clock, Award, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import Image from 'next/image';


// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
};



// Sample Products Data
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Elegant Silk Saree",
    price: 2499,
    originalPrice: 3299,
    category: "Ethnic",
    description: "Beautiful silk saree with intricate embroidery. Perfect for weddings and festive occasions.",
    rating: 4.5,
    stock: 15,
    image: "saree",
    reviews: [
      { id: 1, user: "Priya M.", rating: 5, comment: "Absolutely gorgeous! The fabric quality is amazing.", date: "2024-09-15" },
      { id: 2, user: "Raj K.", rating: 4, comment: "Beautiful saree but slightly expensive.", date: "2024-09-10" }
    ],
    features: ["Pure silk fabric", "Intricate embroidery", "Comes with blouse piece", "Dry clean only"],
    ageRange: "Free Size",
    dimensions: "5.5 meters length",
    tags: ["trending", "bestseller"]
  },
  {
    id: 2,
    name: "Designer Kurti Set",
    price: 1899,
    originalPrice: 2499,
    category: "Casual",
    description: "Comfortable cotton kurti with palazzo pants. Ideal for daily wear.",
    rating: 5,
    stock: 25,
    image: "kurti",
    reviews: [
      { id: 1, user: "Amit S.", rating: 5, comment: "Very comfortable and stylish!", date: "2024-09-20" },
      { id: 2, user: "Sneha P.", rating: 5, comment: "Perfect fit and great quality.", date: "2024-09-18" }
    ],
    features: ["100% cotton", "Comfortable fit", "Machine washable", "Includes palazzo pants"],
    ageRange: "S, M, L, XL",
    dimensions: "Length: 42 inches",
    tags: ["bestseller"]
  },
  {
    id: 3,
    name: "Statement Necklace",
    price: 1299,
    originalPrice: 1799,
    category: "Jewelry",
    description: "Stunning gold-plated necklace to complement any outfit.",
    rating: 4.8,
    stock: 30,
    image: "necklace",
    reviews: [
      { id: 1, user: "Meera L.", rating: 5, comment: "So elegant! Gets compliments everywhere.", date: "2024-09-22" },
      { id: 2, user: "Kiran V.", rating: 4, comment: "Beautiful piece, slightly heavy.", date: "2024-09-19" }
    ],
    features: ["Gold-plated finish", "Adjustable chain", "Anti-tarnish coating", "Gift box included"],
    ageRange: "Adjustable",
    dimensions: "18 inch chain",
    tags: ["new"]
  },
  {
    id: 4,
    name: "Designer Handbag",
    price: 3299,
    originalPrice: 4299,
    category: "Accessories",
    description: "Premium leather handbag with multiple compartments.",
    rating: 4.6,
    stock: 12,
    image: "handbag",
    reviews: [
      { id: 1, user: "Vikram R.", rating: 5, comment: "Excellent quality leather!", date: "2024-09-21" },
      { id: 2, user: "Deepak M.", rating: 4, comment: "Great bag but could have more pockets.", date: "2024-09-16" }
    ],
    features: ["Premium leather", "Multiple compartments", "Zipper closure", "Adjustable strap"],
    ageRange: "One Size",
    dimensions: "30 x 25 x 10 cm",
    tags: ["trending"]
  },
  {
    id: 5,
    name: "Stylish Sunglasses",
    price: 1599,
    originalPrice: 2199,
    category: "Accessories",
    description: "UV protection sunglasses with trendy frames.",
    rating: 4.7,
    stock: 20,
    image: "sunglasses",
    reviews: [
      { id: 1, user: "Anjali T.", rating: 5, comment: "Perfect for summer! Love the design.", date: "2024-09-23" },
      { id: 2, user: "Rohit B.", rating: 4, comment: "Good quality and stylish.", date: "2024-09-17" }
    ],
    features: ["UV 400 protection", "Polarized lenses", "Lightweight frames", "Comes with case"],
    ageRange: "Universal Fit",
    dimensions: "Standard size",
    tags: ["bestseller"]
  },
  {
    id: 6,
    name: "Gold Plated Earrings",
    price: 899,
    originalPrice: 1299,
    category: "Jewelry",
    description: "Elegant dangling earrings for special occasions.",
    rating: 4.4,
    stock: 18,
    image: "earrings",
    reviews: [
      { id: 1, user: "Kavita N.", rating: 4, comment: "Pretty earrings, lightweight.", date: "2024-09-14" },
      { id: 2, user: "Suresh G.", rating: 5, comment: "Beautiful design and finish!", date: "2024-09-12" }
    ],
    features: ["Gold plating", "Lightweight design", "Push back closure", "Hypoallergenic"],
    ageRange: "One Size",
    dimensions: "5 cm length",
    tags: ["new"]
  },
  {
    id: 7,
    name: "Diamond Ring",
    price: 2799,
    originalPrice: 3499,
    category: "Jewelry",
    description: "Sparkling diamond-studded ring in white gold finish.",
    rating: 4.9,
    stock: 8,
    image: "ring",
    reviews: [
      { id: 1, user: "Arun K.", rating: 5, comment: "Absolutely stunning! Looks expensive.", date: "2024-09-25" }
    ],
    features: ["AAA zirconia stones", "Adjustable size", "Rhodium plated", "Comes in gift box"],
    ageRange: "Adjustable (6-9)",
    dimensions: "Ring size adjustable",
    tags: ["trending", "new"]
  },
  {
    id: 8,
    name: "Palazzo Pants Set",
    price: 4299,
    originalPrice: 5499,
    category: "Casual",
    description: "Flowy palazzo pants with matching top in vibrant colors.",
    rating: 4.7,
    stock: 10,
    image: "palazzo",
    reviews: [
      { id: 1, user: "Pooja S.", rating: 5, comment: "Super comfortable! Perfect for summer.", date: "2024-09-24" }
    ],
    features: ["Flowy fabric", "Elastic waistband", "Matching top included", "Available in 3 colors"],
    ageRange: "S, M, L, XL",
    dimensions: "Length: 40 inches",
    tags: ["bestseller"]
  }
];

// Context for Cart, Wishlist, and Orders
const StoreContext = createContext();

const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

// Store Provider Component
const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Ethnic', 'Casual', 'Western', 'Jewelry', 'Accessories', 'Footwear']);
  const [cart, setCart] = useState([]);
  const [isFirstCartAdd, setIsFirstCartAdd] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);


  React.useEffect(() => {
  if (typeof window !== 'undefined' && cart.length > 0) {
    localStorage.setItem('luxora_cart', JSON.stringify(cart));
  } else if (cart.length === 0) {
    localStorage.removeItem('luxora_cart');
  }
}, [cart]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAdminLoggedIn(localStorage.getItem('isAdminLoggedIn') === 'true');
    }
  }, []);

  const [coupons, setCoupons] = useState({
    'SAVE10': 10,
    'WELCOME20': 20,
    'KIDS15': 15
  });

  // 🔥 REPLACE ENTIRE useEffect WITH THIS:
React.useEffect(() => {
  loadDataFromFirebase();
}, []);

const loadDataFromFirebase = async () => {
  setLoading(true);
  try {
    // Load products
    const productsData = await getAll('products');
    if (productsData.length === 0) {
      await seedInitialProducts();
    } else {
      setProducts(productsData);
    }

    // Load orders
    const ordersData = await getAll('orders');
    setOrders(ordersData || []);

    // 🔧 FIX: Load categories with better error handling
    const categoriesData = await getOne('settings', 'categories');
    
    if (categoriesData && Array.isArray(categoriesData.categories)) {
      setCategories(categoriesData.categories);
    } else if (categoriesData && categoriesData.categories) {
      // If categories exists but isn't an array, convert it
      console.warn('Categories data is not an array, resetting to default');
      const defaultCategories = ['Ethnic', 'Casual', 'Western', 'Jewelry', 'Accessories', 'Footwear'];
      await update('settings', 'categories', { categories: defaultCategories });
      setCategories(defaultCategories);
    } else {
      // If no categories data exists, create default
      const defaultCategories = ['Ethnic', 'Casual', 'Western', 'Jewelry', 'Accessories', 'Footwear'];
      await create('settings', { categories: defaultCategories }, 'categories');
      setCategories(defaultCategories);
    }

    // Load coupons
    const couponsData = await getAll('coupons');
    if (couponsData.length > 0) {
      const couponsObj = {};
      couponsData.forEach(c => {
        couponsObj[c.code] = c.discount;
      });
      setCoupons(couponsObj);
    } else {
      const initialCoupons = { 'SAVE10': 10, 'WELCOME20': 20, 'KIDS15': 15 };
      setCoupons(initialCoupons);
      for (const [code, discount] of Object.entries(initialCoupons)) {
        await create('coupons', { code, discount }, code);
      }
    }

    // Real-time updates
    const unsubProducts = subscribe('products', (data) => {
      console.log('Products updated in real-time!');
      setProducts(data);
    });

    const unsubOrders = subscribe('orders', (data) => {
      console.log('Orders updated in real-time!');
      setOrders(data);
    });

    // Load cart from localStorage
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('luxora_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    }

    return () => {
      unsubProducts();
      unsubOrders();
    };
  } catch (error) {
    console.error('Error loading data:', error);
    setProducts(INITIAL_PRODUCTS);
    // 🔧 Ensure categories is always an array even on error
    setCategories(['Ethnic', 'Casual', 'Western', 'Jewelry', 'Accessories', 'Footwear']);
  } finally {
    setLoading(false);
  }
};

const seedInitialProducts = async () => {
  for (const product of INITIAL_PRODUCTS) {
    await create('products', product, String(product.id));
  }
  const productsData = await getAll('products');
  setProducts(productsData);
};

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        if (newQuantity > product.stock) {
          alert(`Only ${product.stock} units available in stock!`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: newQuantity } : item);
      }
      if (quantity > product.stock) {
        alert(`Only ${product.stock} units available in stock!`);
        return prev;
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, change) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return item;
        if (newQuantity > item.stock) {
          alert(`Only ${item.stock} units available!`);
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setDiscount(0);
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const moveWishlistToCart = (product) => {
    addToCart(product, 1);
    toggleWishlist(product);
  };

  const addToRecentlyViewed = (product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 10);
    });
  };

  const toggleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 4) {
        alert('You can compare maximum 4 products');
        return prev;
      }
      return [...prev, product];
    });
  };

  const isInCompare = (productId) => {
    return compareList.some(item => item.id === productId);
  };

  const applyCoupon = (code) => {
    const upperCode = code.toUpperCase();
    if (coupons[upperCode]) {
      setCouponCode(upperCode);
      setDiscount(coupons[upperCode]);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscount(0);
  };

 

  const adminLogin = async (email, password) => {
  try {
    await loginAdmin(email, password);
    setIsAdminLoggedIn(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isAdminLoggedIn', 'true');
    }
    return true;
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
};

const adminLogout = async () => {
  try {
    await logoutAdmin();
    setIsAdminLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdminLoggedIn');
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};;

  const addProduct = async (productData) => {
  // Use timestamp + random to ensure uniqueness
  const newId = Date.now() + Math.floor(Math.random() * 1000);
  const newProduct = {
    ...productData,
    id: newId,
    rating: 0,
    reviews: []
  };
  const created = await create('products', newProduct, String(newId));
  if (created) {
    setProducts(prev => [...prev, created]);
  }
};
  const updateProduct = async (productId, updates) => {
  const product = products.find(p => p.id === productId);
  if (!product || !product._id) return;
  
  const updated = await update('products', product._id, { ...product, ...updates });
  if (updated) {
    setProducts(prev => prev.map(p => p.id === productId ? updated : p));
  }
};


const deleteProduct = async (productId) => {
  console.log('🗑️ Deleting product ID:', productId);
  
  // Find product by ID
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    console.error('❌ Product not found:', productId);
    toast.error('Product not found');
    return;
  }
  
  if (!product._id) {
    console.error('❌ Product missing _id:', product);
    toast.error('Cannot delete: Product missing database ID');
    return;
  }
  
  console.log('🔥 Deleting from Firebase, _id:', product._id);
  
  try {
    // Delete from Firebase
    const deleted = await remove('products', product._id);
    
    if (deleted) {
      console.log('✅ Deleted from Firebase successfully');
      
      // Update local state
      setProducts(prev => prev.filter(p => p.id !== productId));
      
      toast.success('Product deleted successfully!');
      return true;
    } else {
      console.error('❌ Delete returned false');
      toast.error('Failed to delete product from database');
      return false;
    }
  } catch (error) {
    console.error('❌ Delete product error:', error);
    toast.error('Error deleting product: ' + error.message);
    return false;
  }
};

const updateOrderStatus = async (orderId, newStatus) => {
  const order = orders.find(o => o.id === orderId);
  if (!order || !order._id) {
    console.error('Order not found or missing _id');
    return;
  }
  
  const updated = await update('orders', order._id, { 
    ...order, 
    status: newStatus 
  });
  
  if (updated) {
    setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    alert(`Order status updated to: ${newStatus}`);
  } else {
    alert('Failed to update order status');
  }
};

const addCoupon = async (code, discount) => {
  await create('coupons', { code, discount }, code);
  setCoupons(prev => ({ ...prev, [code]: discount }));
};

const deleteCoupon = async (code) => {
  await remove('coupons', code);
  setCoupons(prev => {
    const newCoupons = { ...prev };
    delete newCoupons[code];
    return newCoupons;
  });
};

const addCategory = async (categoryName) => {
  const trimmedName = categoryName.trim();
  if (!trimmedName) {
    alert('Category name cannot be empty');
    return false;
  }
  
  if (categories.includes(trimmedName)) {
    alert('Category already exists');
    return false;
  }
  
  const newCategories = [...categories, trimmedName];
  
  try {
    // Try to update existing document first
    const updated = await update('settings', 'categories', { categories: newCategories });
    
    if (!updated) {
      // If update fails, try create
      const created = await create('settings', { categories: newCategories }, 'categories');
      if (!created) {
        alert('Failed to save category. Check Firebase rules.');
        return false;
      }
    }
    
    setCategories(newCategories);
    return true;
  } catch (error) {
    console.error('Add category error:', error);
    alert('Error adding category: ' + error.message);
    return false;
  }
};

const deleteCategory = async (categoryName) => {
  const productsInCategory = products.filter(p => p.category === categoryName);
  
  if (productsInCategory.length > 0) {
    alert(`Cannot delete category "${categoryName}". ${productsInCategory.length} product(s) are using it.`);
    return false;
  }
  
  const newCategories = categories.filter(c => c !== categoryName);
  setCategories(newCategories);
  
  await update('settings', 'categories', { categories: newCategories });
  return true;
};

const updateCategory = async (oldName, newName) => {
  const trimmedName = newName.trim();
  
  if (!trimmedName) {
    alert('Category name cannot be empty');
    return false;
  }
  
  if (categories.includes(trimmedName) && oldName !== trimmedName) {
    alert('Category already exists');
    return false;
  }
  
  // Update all products that use this category
  const productsToUpdate = products.filter(p => p.category === oldName);
  
  for (const product of productsToUpdate) {
    if (product._id) {
      await update('products', product._id, { ...product, category: trimmedName });
    }
  }
  
  // Update category list
  const newCategories = categories.map(c => c === oldName ? trimmedName : c);
  setCategories(newCategories);
  
  // Update products in state
  setProducts(prev => prev.map(p => 
    p.category === oldName ? { ...p, category: trimmedName } : p
  ));
  
  // Save to Firebase
  await update('settings', 'categories', { categories: newCategories });
  return true;
};
  
  const sendOrderEmail = async (order, orderData) => {
    console.log('📧 Starting email send...');
    
    try {
      if (!window.emailjs) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
        document.head.appendChild(script);
        
        await new Promise((resolve) => { script.onload = resolve; });
        window.emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log('✅ EmailJS loaded');
      }

      const itemsList = order.items.map(item => 
        `${item.name} x${item.quantity} - Rs.${item.price * item.quantity}`
      ).join('\n');

      const params = {
        to_email: orderData.email,
        to_name: orderData.fullName,
        order_id: order.id,
        order_total: `Rs.${orderData.total}`,
        payment_method: orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
        order_items: itemsList,
        delivery_address: `${orderData.address}, ${orderData.city}, ${orderData.state} - ${orderData.pincode}`,
        phone: orderData.phone
      };

      console.log('📧 Sending to:', params.to_email);
      
      await window.emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        params
      );
      
      console.log('✅ Email sent!');
      return true;
    } catch (error) {
      console.error('❌ Error:', error);
      return false;
    }
  };

  const placeOrder = async (orderData) => {
  const newOrder = {
    id: Date.now(),
    ...orderData,
    items: [...cart],
    date: new Date().toISOString(),
    status: 'Processing'
  };

  try {
    const created = await create('orders', newOrder, String(newOrder.id));
    
    if (created) {
      setOrders(prev => [created, ...prev]);
      
      await sendOrderEmail(newOrder, orderData);
      
      return newOrder.id;
    }
  } catch (error) {
    console.error('Error placing order:', error);
  }
  
  return null;
};

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (cartSubtotal * discount) / 100;
  const cartTotal = cartSubtotal - discountAmount;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider value={{
      products, setProducts, cart, wishlist, orders, recentlyViewed, compareList, addToCart, removeFromCart, 
      updateQuantity, toggleWishlist, isInWishlist, cartTotal, cartCount, clearCart, 
      moveWishlistToCart, addToRecentlyViewed, toggleCompare, isInCompare, 
      applyCoupon, removeCoupon, couponCode, discount, discountAmount, cartSubtotal,
      placeOrder, isAdminLoggedIn, adminLogin, adminLogout, addProduct, updateProduct, 
      deleteProduct, updateOrderStatus, coupons, addCoupon, deleteCoupon,
      categories, addCategory, deleteCategory, updateCategory, 
      isFirstCartAdd, setIsFirstCartAdd, loading
    }}>
      {children}
    </StoreContext.Provider>
  );
};

// Header Component
const Header = ({ setCurrentPage, setShowCart }) => {
  const { cartCount, wishlist, compareList, isAdminLoggedIn} = useStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="bg-black text-white shadow-2xl sticky top-0 z-50 border-b-2 border-yellow-500">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold animate-pulse">
            <ShieldCheck className="w-4 h-4" />
            <span>🎉 FREE Cash on Delivery Available on ALL Orders!</span>
            <Truck className="w-4 h-4" />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <Package className="w-8 h-8" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-pulse">Luxora</h1>
          </div>

          <nav className="hidden md:flex space-x-6">
            <button onClick={() => setCurrentPage('home')} className="hover:text-yellow-500 transition flex items-center space-x-1">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>
            <button onClick={() => setCurrentPage('products')} className="hover:text-yellow-300 transition flex items-center space-x-1">
              <Package className="w-5 h-5" />
              <span>Products</span>
            </button>
            
            <button onClick={() => setCurrentPage('orders')} className="hover:text-yellow-300 transition flex items-center space-x-1">
              <Clock className="w-5 h-5" />
              <span>Orders</span>
            </button>

          </nav>

          <div className="flex items-center space-x-4">
            {compareList.length > 0 && (
              <button onClick={() => setCurrentPage('compare')} className="relative hover:text-yellow-300 transition hidden md:block">
                <Filter className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {compareList.length}
                </span>
              </button>
            )}
            <button onClick={() => setCurrentPage('wishlist')} className="relative hover:text-yellow-300 transition">
              <Heart className="w-6 h-6" />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button onClick={() => setShowCart(true)} className="relative hover:text-yellow-300 transition">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden">
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <nav className="md:hidden mt-4 flex flex-col space-y-2">
            <button onClick={() => { setCurrentPage('home'); setShowMobileMenu(false); }} className="text-left py-2 hover:text-yellow-300">
              Home
            </button>
            <button onClick={() => { setCurrentPage('products'); setShowMobileMenu(false); }} className="text-left py-2 hover:text-yellow-300">
              Products
            </button>
            <button onClick={() => { setCurrentPage('orders'); setShowMobileMenu(false); }} className="text-left py-2 hover:text-yellow-300">
              Orders
            </button>
            
            {compareList.length > 0 && (
              <button onClick={() => { setCurrentPage('compare'); setShowMobileMenu(false); }} className="text-left py-2 hover:text-yellow-300">
                Compare ({compareList.length})
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

// Product Image Component
const ProductImage = ({ image, images, name }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // If product has uploaded images array, show carousel
  if (images && Array.isArray(images) && images.length > 0) {
    return (
      <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden group">
        <Image 
          src={getOptimizedUrl(images[currentImageIndex], { width: 500, height: 500 })} 
          alt={name} 
          className="w-full h-full object-contain" 
          width={500} 
          height={500} 
          
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-opacity-70"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % images.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-opacity-70"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
  {Array.isArray(images) && images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                  className={`w-2 h-2 rounded-full transition ${idx === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Fallback to emoji icons for old products
  const imageMap = {
    necklace: '💍',
    kurti: '👗',
    earrings: '👂',
    handbag: '👜',
    saree: '🥻',
    sunglasses: '🕶️',
    ring: '💎',
    palazzo: '👘'
  };

  return (
    <div className="w-full h-48 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center text-6xl">
      {imageMap[image] || <Package className="w-16 h-16 text-purple-400" />}
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, showMoveToCart = false, onViewDetails, onCartOpen }) => {
  const { addToCart, toggleWishlist, isInWishlist, moveWishlistToCart, toggleCompare, isInCompare, isFirstCartAdd, setIsFirstCartAdd } = useStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      addToCart(product, 1);
      if (isFirstCartAdd && onCartOpen) {
        setIsFirstCartAdd(false);
        onCartOpen();
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    setIsTogglingWishlist(true);
    try {
      toggleWishlist(product);
      await new Promise(resolve => setTimeout(resolve, 200));
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      <div className="relative cursor-pointer" onClick={() => onViewDetails && onViewDetails(product)}>
        <ProductImage image={product.image} images={product.images} name={product.name} />
        <button
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
          className={`absolute top-2 right-2 p-2 rounded-full ${inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-700'} hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
        >
          {isTogglingWishlist ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
          ) : (
            <Heart className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} />
          )}
        </button>
        <span className="absolute top-2 left-2 bg-black text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-500">
          {product.category}
        </span>
        {discount > 0 && (
          <span className="absolute top-12 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {discount}% OFF
          </span>
        )}
        {product.stock < 10 && (
          <span className="absolute bottom-2 left-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Only {product.stock} left!
          </span>
        )}
        {product.tags?.includes('bestseller') && (
          <span className="absolute bottom-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
            <Award className="w-3 h-3 mr-1" /> Bestseller
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 cursor-pointer hover:text-purple-600" onClick={() => onViewDetails && onViewDetails(product)}>
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">({product.rating}) • {product.reviews?.length || 0} reviews</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-bold text-yellow-600">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="ml-2 text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {showMoveToCart ? (
            <button
              onClick={() => moveWishlistToCart(product)}
              disabled={product.stock === 0}
              className={`flex-1 ${product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-black border-2 border-yellow-500 hover:border-yellow-400'} text-white px-4 py-2 rounded-lg transition flex items-center justify-center space-x-1`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Move to Cart</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAddingToCart}
                className={`flex-1 ${product.stock === 0 || isAddingToCart ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-black border-2 border-yellow-500 hover:border-yellow-400'} text-white px-4 py-2 rounded-lg transition flex items-center justify-center space-x-1`}
              >
                {isAddingToCart ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{product.stock === 0 ? 'Out of Stock' : 'Add'}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => toggleCompare(product)}
                disabled={isAddingToCart}
                className={`${inCompare ? 'bg-blue-600' : 'bg-gray-200'} p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Filter className={`w-4 h-4 ${inCompare ? 'text-white' : 'text-gray-700'}`} />
              </button>
            </>
          )}
        </div>
        <p className={`text-sm mt-2 ${product.stock < 10 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
          Stock: {product.stock} units
        </p>
      </div>
    </div>
  );
};

// ProductDetailsModal component 
const ProductDetailsModal = ({ product: initialProduct, onClose }) => {
  const { addToCart, toggleWishlist, isInWishlist, updateProduct, products, isAdminLoggedIn } = useStore();
  
  // Get fresh product data from store
  const product = products.find(p => p.id === initialProduct.id) || initialProduct;
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Review form states
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  
  // Fix: Check if running on client
  const [isClient, setIsClient] = useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const CURRENT_USER = "Anonymous User";

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert('Added to cart!');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
            <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Images */}
              <div>
                <div 
                  className="relative mb-4 cursor-pointer"
                  onClick={() => {
                    if (product.images && product.images.length > 0) {
                      setModalImageIndex(selectedImage);
                      setShowImageModal(true);
                    }
                  }}
                >
                  <ProductImage image={product.image} images={product.images} name={product.name} />
                  {product.tags?.includes('new') && (
                    <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      NEW
                    </span>
                  )}
                  {product.images && product.images.length > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-xs">
                      Click to zoom
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Details */}
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">({product.rating}) • {product.reviews?.length || 0} reviews</span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-yellow-600">₹{product.price}</span>
                    {product.originalPrice > product.price && (
                      <>
                        <span className="text-xl text-gray-400 line-through">₹{product.originalPrice}</span>
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-green-600 font-semibold">Inclusive of all taxes</p>
                </div>

                <p className="text-gray-600 mb-6">{product.description}</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
  <h3 className="font-bold text-gray-800 mb-3">Key Features:</h3>
  <ul className="space-y-2">
    {Array.isArray(product.features) && product.features.length > 0 ? (
      product.features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <span className="text-purple-600 mr-2">✓</span>
          <span className="text-gray-700">{feature}</span>
        </li>
      ))
    ) : (
      <li className="text-gray-500 text-sm">No features listed</li>
    )}
  </ul>
</div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Available Sizes</p>
                    <p className="font-bold text-purple-600">{product.sizeRange || product.ageRange}</p>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Stock</p>
                    <p className="font-bold text-pink-600">{product.stock} units</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 py-2 font-semibold">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 ${product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'} text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center`}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`${inWishlist ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'} p-3 rounded-lg hover:scale-110 transition`}
                  >
                    <Heart className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Delivery Info */}
                <div className="border-t pt-6 space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Truck className="w-5 h-5 mr-3 text-green-600" />
                    <span>Free Delivery on orders above ₹999</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <RotateCcw className="w-5 h-5 mr-3 text-blue-600" />
                    <span>7 Days Easy Return Policy</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <ShieldCheck className="w-5 h-5 mr-3 text-purple-600" />
                    <span>100% Safe & Secure Products</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section - ONLY RENDER ON CLIENT */}
            {isClient && (
              <div className="mt-8 border-t pt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Customer Reviews</h3>
                  <button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    Write a Review
                  </button>
                </div>

                {showReviewForm && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h4 className="font-bold mb-4">{editingReviewId ? 'Edit Your Review' : 'Share Your Experience'}</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              className={`w-8 h-8 cursor-pointer transition ${star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                              onClick={() => setReviewRating(star)}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Your Review</label>
                        <textarea 
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
                          rows="4"
                          placeholder="Tell us what you think about this product..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="flex-1 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                          onClick={() => {
  if (reviewRating === 0) {
    alert('Please select a rating');
    return;
  }
  if (reviewText.trim() === '') {
    alert('Please write a review');
    return;
  }
  
  // Ensure reviews is an array
  const currentReviews = Array.isArray(product.reviews) ? product.reviews : [];
  let updatedReviews;
  
  if (editingReviewId) {
    updatedReviews = currentReviews.map(r => 
      r.id === editingReviewId 
        ? { ...r, rating: reviewRating, comment: reviewText, date: new Date().toISOString() }
        : r
    );
  } else {
    const newReview = {
      id: Date.now(),
      user: CURRENT_USER,
      rating: reviewRating,
      comment: reviewText,
      date: new Date().toISOString()
    };
    updatedReviews = [...currentReviews, newReview];
  }
                            
                            const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
                            
                            updateProduct(product.id, {
                              reviews: updatedReviews,
                              rating: parseFloat(avgRating.toFixed(1))
                            });
                            
                            alert(editingReviewId ? 'Review updated!' : 'Thank you for your review!');
                            setReviewRating(0);
                            setReviewText('');
                            setEditingReviewId(null);
                            setShowReviewForm(false);
                          }}
                        >
                          {editingReviewId ? 'Update Review' : 'Submit Review'}
                        </button>
                        <button 
                          type="button"
                          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                          onClick={() => {
                            setReviewRating(0);
                            setReviewText('');
                            setEditingReviewId(null);
                            setShowReviewForm(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
  {Array.isArray(product.reviews) && product.reviews.length > 0 ? (
    product.reviews.map(review => {
      const isReviewOwner = review.user === CURRENT_USER;
      const showEditDelete = isReviewOwner || isAdminLoggedIn;
      
      return (
        <div key={review.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-bold text-gray-800">{review.user}</p>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
              
              {showEditDelete && (
                <div className="flex gap-2">
                  {isReviewOwner && (
                    <button
                      onClick={() => {
                        setReviewRating(review.rating);
                        setReviewText(review.comment);
                        setEditingReviewId(review.id);
                        setShowReviewForm(true);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-600"
                    >
                      Edit
                    </button>
                  )}
                  {(isReviewOwner || isAdminLoggedIn) && (
                    <button
                      onClick={() => {
                        if (confirm('Delete this review?')) {
                          const updatedReviews = product.reviews.filter(r => r.id !== review.id);
                          const avgRating = updatedReviews.length > 0 
                            ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length 
                            : 0;
                          
                          updateProduct(product.id, {
                            reviews: updatedReviews,
                            rating: parseFloat(avgRating.toFixed(1))
                          });
                          alert('Review deleted!');
                        }
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-700">{review.comment}</p>
        </div>
      );
    })
  ) : (
    <div className="text-center py-8 text-gray-500">
      <p>No reviews yet. Be the first to review!</p>
    </div>
  )}
</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IMAGE ZOOM MODAL */}
      {showImageModal && product.images && product.images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-[60] flex items-center justify-center p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white z-10 bg-black bg-opacity-50 px-4 py-2 rounded-full">
            {modalImageIndex + 1} / {product.images.length}
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center px-16">
            <Image
              src={product.images[modalImageIndex]}
              alt={`${product.name} - Image ${modalImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
              width={1200}
              height={1200}
              loading="lazy" // Add lazy loading
             placeholder="blur" // Add blur placeholder
             blurDataURL="data:image/svg+xml;base64,..." // Optional: add blur data
             />

          </div>

          {/* Navigation Arrows */}
          {product.images.length > 1 && (
            <>
              <button
                onClick={() => setModalImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-black p-3 rounded-full hover:bg-gray-200 transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setModalImageIndex((prev) => (prev + 1) % product.images.length)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-black p-3 rounded-full hover:bg-gray-200 transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

// Cart Sidebar Component
const CartSidebar = ({ show, onClose, setCurrentPage }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartSubtotal, discount, discountAmount, couponCode, applyCoupon, removeCoupon, setIsFirstCartAdd } = useStore();
  
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!show) return null;

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setCurrentPage('checkout');
    onClose();
  };

  const handleApplyCoupon = () => {
    if (applyCoupon(couponInput)) {
      setCouponError('');
      setCouponInput('');
      alert('Coupon applied successfully!');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
            <button onClick={() => {
              setIsFirstCartAdd(false);
              onClose();
            }} className="text-gray-600 hover:text-gray-800">
              <X className="w-6 h-6" />
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded flex items-center justify-center flex-shrink-0 text-2xl overflow-hidden">
  {item.images && item.images.length > 0 ? (
    <Image src={item.images[0]} alt={item.name} className="w-full h-full object-cover" width={64} height={64} />
  ) : (
    <>
      {item.image === 'necklace' && '💍'}
      {item.image === 'kurti' && '👗'}
      {item.image === 'earrings' && '💂'}
      {item.image === 'handbag' && '👜'}
      {item.image === 'saree' && '🥻'}
      {item.image === 'sunglasses' && '🕶️'}
      {item.image === 'ring' && '💎'}
      {item.image === 'palazzo' && '👘'}
      {!item.image && <Package className="w-8 h-8 text-purple-400" />}
    </>
  )}
</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-purple-600 font-bold">₹{item.price}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="bg-gray-200 p-1 rounded hover:bg-gray-300">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="bg-gray-200 p-1 rounded hover:bg-gray-300">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="border-t pt-4 mb-4">
                {couponCode ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-green-800 font-semibold">Coupon Applied: {couponCode}</p>
                      <p className="text-xs text-green-600">You saved ₹{discountAmount}!</p>
                    </div>
                    <button onClick={removeCoupon} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-xs">{couponError}</p>}
                    <p className="text-xs text-gray-500">Try: SAVE10, WELCOME20, KIDS15</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%)</span>
                      <span>- ₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
                    <span>Total</span>
                    <span className="text-yellow-600">₹{cartTotal}</span>
                  </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-black to-gray-900 text-white py-3 rounded-lg font-semibold border-2 border-yellow-500 hover:border-yellow-400 transition shadow-xl"
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

// Home Page Component
const HomePage = ({ setCurrentPage, setSelectedProduct, setShowCart }) => {
  const { recentlyViewed, products } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    { title: "Welcome to Luxora!", subtitle: "Luxury Products in Your Price" },
    { title: "Mega Sale!", subtitle: "Up Coming", color: "from-blue-500 via-purple-500 to-pink-500" },
    { title: "New Arrivals", subtitle: "Latest Collection Just In", color: "from-green-500 via-teal-500 to-blue-500" }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <section className="relative">
        <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-20 transition-all duration-500 border-b-4 border-yellow-500">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">{banners[currentSlide].title}</h1>
            <p className="text-xl md:text-2xl mb-8">{banners[currentSlide].subtitle}</p>
            <button
              onClick={() => setCurrentPage('products')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-full text-lg font-bold hover:from-yellow-400 hover:to-yellow-500 transition transform hover:scale-105 shadow-xl border-2 border-yellow-300"
            >
              Shop Now
            </button>
          </div>
        </div>
        <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full hover:bg-opacity-75">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full hover:bg-opacity-75">
          <ChevronRight className="w-6 h-6" />
        </button>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full ${idx === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'}`}
            />
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Luxora?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
              <p className="text-gray-600">All Products Made By Love 🥰</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Express delivery across India</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive prices with exclusive offers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <button onClick={() => setCurrentPage('products')} className="text-purple-600 hover:text-purple-800 font-semibold flex items-center">
              View All <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
     
{products.filter(p => p.tags?.includes('bestseller')).map((product, index) => (
  <ProductCard 
    key={`product-${product.id || product._id}-${index}`}  // ✅ index now defined
    product={product} 
    onViewDetails={setSelectedProduct}
    onCartOpen={() => setShowCart(true)} 
  />
))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">New Arrivals</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.filter(p => p.tags?.includes('bestseller')).map((product, index) => (
  <ProductCard 
    key={`product-${product.id || product._id}-${index}`}  // ✅ index now defined
    product={product} 
    onViewDetails={setSelectedProduct}
    onCartOpen={() => setShowCart(true)} 
  />
))}
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12">Recently Viewed</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentlyViewed.slice(0, 4).map((product, index) => (
                 <ProductCard 
    key={`product-${product.id || product._id}-${index}`}
    product={product}
                  onViewDetails={setSelectedProduct}
                  onCartOpen={() => setShowCart(true)} 
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="py-16 bg-black text-white border-y-4 border-yellow-500">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-6 text-center">
            <div>
              <Package className="w-12 h-12 mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">FREE COD</h4>
              <p className="text-sm opacity-90">Pay when you receive</p>
            </div>
            <div>
              <Truck className="w-12 h-12 mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">Free Shipping</h4>
              <p className="text-sm opacity-90">On orders above ₹999</p>
            </div>
            <div>
              <ShieldCheck className="w-12 h-12 mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">Secure Payment</h4>
              <p className="text-sm opacity-90">100% secure transactions</p>
            </div>
            <div>
              <RotateCcw className="w-12 h-12 mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">Easy Returns</h4>
              <p className="text-sm opacity-90">7 days return policy</p>
            </div>
            <div>
              <Award className="w-12 h-12 mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">Quality Assured</h4>
              <p className="text-sm opacity-90">Certified safe products</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Products Page Component
const ProductsPage = ({ setSelectedProduct, setShowCart }) => {
  const { products, categories: rawCategories } = useStore(); // Get categories from store
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Safe categories - never crashes
  const safeCategories = Array.isArray(rawCategories) ? rawCategories : [];
  const categories = ['All', ...safeCategories];

  let filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    return matchesCategory && matchesSearch && matchesPrice;
  });

  // Sorting
  if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'name') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Our Products</h1>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for fashion, jewelry, accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} md:flex flex-wrap gap-4 w-full md:w-auto`}>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {/* Price Range Filter */}
        {showFilters && (
          <div className="bg-white rounded-lg p-4 mb-8 md:hidden">
            <h3 className="font-bold mb-3">Price Range</h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="flex-1"
              />
              <span className="text-sm font-semibold">₹0 - ₹{priceRange[1]}</span>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">Showing {filteredProducts.length} products</p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">No products found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
  <ProductCard 
    key={`product-${product.id || product._id}-${index}`}  // ✅ index now defined
    product={product} 
    onViewDetails={setSelectedProduct}
    onCartOpen={() => setShowCart(true)} 
  />
))}
          </div>
        )}
      </div>
    </div>
  );
};

// Wishlist Page Component
const WishlistPage = ({ setSelectedProduct, setShowCart }) => {
  const { wishlist } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">My Wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-24 h-24 mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 mb-4">Your wishlist is empty</p>
            <p className="text-gray-500 mb-8">Add products you love to your wishlist!</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">{wishlist.length} item(s) in your wishlist</p>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((product, index) => (
                  <ProductCard 
    key={`product-${product.id || product._id}-${index}`}
    product={product}
                  showMoveToCart={true} 
                  onViewDetails={setSelectedProduct}
                  onCartOpen={() => setShowCart(true)} 
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Compare Page Component
const ComparePage = () => {
  const { compareList, toggleCompare } = useStore();

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8">Compare Products</h1>
          <div className="text-center py-20">
            <Filter className="w-24 h-24 mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">No products to compare</p>
            <p className="text-gray-500 mt-2">Add products to compare their features</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Compare Products</h1>

        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left font-bold">Feature</th>
                {compareList.map((product, index) => (
                  <th key={product.id} className="p-4 text-center min-w-[200px]">
                    <div className="relative">
                      <button
                        onClick={() => toggleCompare(product)}
                        className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <ProductImage image={product.image} images={product.images} name={product.name} />
                      <p className="font-bold mt-2">{product.name}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4 font-semibold">Price</td>
                {compareList.map((product, index) => (
                  <td key={product.id} className="p-4 text-center">
                    <span className="text-2xl font-bold text-yellow-600">₹{product.price}</span>
                    {product.originalPrice > product.price && (
                      <div className="text-sm text-gray-400 line-through">₹{product.originalPrice}</div>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-semibold">Rating</td>
                {compareList.map((product, index) => (
                  <td key={product.id} className="p-4 text-center">
                    <div className="flex justify-center items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 font-bold">{product.rating}</span>
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-semibold">Category</td>
                {compareList.map((product, index) => (
                  <td key={product.id} className="p-4 text-center">{product.category}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-semibold">Stock</td>
                {compareList.map((product, index) => (
                  <td key={product.id} className="p-4 text-center">
                    <span className={product.stock < 10 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                      {product.stock} units
                    </span>
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-semibold">Age Range</td>
                {compareList.map((product, index) => (
                  <td key={product.id} className="p-4 text-center">{product.ageRange}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-semibold">Features</td>
                {compareList.map((product, index) => (
                  <td key={product.id} className="p-4">
                    <ul className="text-sm space-y-1">
                      {product.features?.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-600 mr-1">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Orders Page Component
const OrdersPage = () => {
  const { orders } = useStore();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-yellow-100 text-yellow-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-4xl font-bold text-center mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-24 h-24 mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 mb-4">No orders yet</p>
            <p className="text-gray-500">Your order history will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, orderIndex) => (
              <div key={`order-${order.id}-${orderIndex}`} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.date).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="border-t border-b py-4 mb-4">
                  <div className="space-y-3">
                    {order.items.map((item, itemIndex) => (
                      <div key={`${order.id}-item-${item.id}-${itemIndex}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded flex items-center justify-center text-2xl overflow-hidden">
                          {item.images && item.images.length > 0 ? (
                          <Image src={item.images[0]} alt={item.name} className="w-full h-full object-cover" width={64} height={64} />
                          ) : (
                          <>
                          {item.image === 'necklace' && '💍'}
                          {item.image === 'kurti' && '👗'}
                          {item.image === 'earrings' && '💂'}
                          {item.image === 'handbag' && '👜'}
                          {item.image === 'saree' && '🥻'}
                          {item.image === 'sunglasses' && '🕶️'}
                          {item.image === 'ring' && '💎'}
                          {item.image === 'palazzo' && '👘'}
                          {!item.image && <Package className="w-8 h-8 text-purple-400" />}
                          </>
                          )}
                          </div>
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-bold text-purple-600">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Shipping Address</h4>
                    <p className="text-sm text-gray-600">{order.fullName}</p>
                    <p className="text-sm text-gray-600">{order.address}</p>
                    <p className="text-sm text-gray-600">{order.city}, {order.state} - {order.pincode}</p>
                    <p className="text-sm text-gray-600">{order.phone}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Order Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="font-bold text-purple-600">₹{order.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-semibold">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ show, onClose, amount, onSuccess }) => {
  const [paymentType, setPaymentType] = useState('upi-apps');
  const [manualUpiId, setManualUpiId] = useState('');
  const [upiIdValid, setUpiIdValid] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  // Your UPI ID for receiving payments
  const MERCHANT_UPI = 'shiham181@okaxis'; // ⬅️ CHANGE THIS TO YOUR UPI ID

  if (!show) return null;

  // Validate UPI ID format
  const validateUpiId = (upi) => {
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    return upiRegex.test(upi);
  };

  const handleUpiIdChange = (e) => {
    const value = e.target.value;
    setManualUpiId(value);
    
    if (value.length > 0) {
      setUpiIdValid(validateUpiId(value));
    } else {
      setUpiIdValid(null);
    }
  };

  // Generate UPI payment URL
  const generateUpiUrl = (app) => {
    const paymentUrl = `upi://pay?pa=${MERCHANT_UPI}&pn=Luxora&am=${amount}&cu=INR&tn=Order Payment`;
    
    const appSchemes = {
      phonepe: `phonepe://pay?pa=${MERCHANT_UPI}&pn=Luxora&am=${amount}&cu=INR&tn=Order Payment`,
      paytm: `paytmmp://pay?pa=${MERCHANT_UPI}&pn=Luxora&am=${amount}&cu=INR&tn=Order Payment`,
      gpay: `tez://upi/pay?pa=${MERCHANT_UPI}&pn=Luxora&am=${amount}&cu=INR&tn=Order Payment`,
      default: paymentUrl
    };
    
    return appSchemes[app] || appSchemes.default;
  };

  const handleUpiAppPayment = (app) => {
    const upiUrl = generateUpiUrl(app);
    
    // Try to open the UPI app
    window.location.href = upiUrl;
    
    // Show verification dialog after 3 seconds
    setTimeout(() => {
      const verified = confirm('Have you completed the payment in the app?\n\nClick OK if payment is done, Cancel if not.');
      if (verified) {
        handlePaymentSuccess();
      }
    }, 3000);
  };

  const handleManualUpiPayment = () => {
    if (!validateUpiId(manualUpiId)) {
      toast.error('Please enter a valid UPI ID');
      return;
    }

    const upiUrl = `upi://pay?pa=${manualUpiId}&pn=Luxora&am=${amount}&cu=INR&tn=Order Payment`;
    window.location.href = upiUrl;
    
    setTimeout(() => {
      const verified = confirm('Have you completed the payment?\n\nClick OK if payment is done.');
      if (verified) {
        handlePaymentSuccess();
      }
    }, 2000);
  };

  const handleQRPayment = () => {
    setShowQR(true);
    
    // Show payment verification after some time
    setTimeout(() => {
      const verified = confirm('Have you scanned the QR code and completed payment?\n\nClick OK if payment is done.');
      if (verified) {
        handlePaymentSuccess();
      }
    }, 5000);
  };

  const handlePaymentSuccess = () => {
    setPaymentVerified(true);
    toast.success('Payment verified! Processing order...');
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  const handleCardPayment = async () => {
    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Payment Successful!');
      onSuccess();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => !processing && onClose()}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
            <h2 className="text-2xl font-bold">Complete Payment</h2>
            <button 
              onClick={onClose} 
              disabled={processing}
              className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Amount Display */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6 text-center border-2 border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
              <p className="text-4xl font-bold text-purple-600">₹{amount}</p>
              <p className="text-xs text-gray-500 mt-2">Order Total (incl. all taxes)</p>
            </div>

            {/* Payment Type Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              <button
                onClick={() => setPaymentType('upi-apps')}
                disabled={processing}
                className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                  paymentType === 'upi-apps' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                UPI Apps
              </button>
              <button
                onClick={() => setPaymentType('upi-id')}
                disabled={processing}
                className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                  paymentType === 'upi-id' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                UPI ID
              </button>
              <button
                onClick={() => setPaymentType('qr-code')}
                disabled={processing}
                className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                  paymentType === 'qr-code' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                QR Code
              </button>
              <button
                onClick={() => setPaymentType('card')}
                disabled={processing}
                className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                  paymentType === 'card' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Card
              </button>
            </div>

            {/* UPI Apps Payment */}
            {paymentType === 'upi-apps' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg mb-4">Pay with UPI Apps</h3>
                
                <button
                  onClick={() => handleUpiAppPayment('phonepe')}
                  disabled={processing}
                  className="w-full bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition flex items-center justify-between disabled:opacity-50"
                >
                  <span className="font-semibold text-lg">PhonePe</span>
                  <span className="text-2xl">📱</span>
                </button>

                <button
                  onClick={() => handleUpiAppPayment('paytm')}
                  disabled={processing}
                  className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-between disabled:opacity-50"
                >
                  <span className="font-semibold text-lg">Paytm</span>
                  <span className="text-2xl">💳</span>
                </button>

                <button
                  onClick={() => handleUpiAppPayment('gpay')}
                  disabled={processing}
                  className="w-full bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition flex items-center justify-between disabled:opacity-50"
                >
                  <span className="font-semibold text-lg">Google Pay</span>
                  <span className="text-2xl">🔷</span>
                </button>

                <button
                  onClick={() => handleUpiAppPayment('default')}
                  disabled={processing}
                  className="w-full bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition flex items-center justify-between disabled:opacity-50"
                >
                  <span className="font-semibold text-lg">Other UPI Apps</span>
                  <span className="text-2xl">💰</span>
                </button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>How it works:</strong>
                    <br />1. Click on your UPI app
                    <br />2. App will open with pre-filled payment details
                    <br />3. Enter your UPI PIN to complete payment
                  </p>
                </div>
              </div>
            )}

            {/* Manual UPI ID Payment */}
            {paymentType === 'upi-id' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg mb-4">Pay with UPI ID</h3>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Enter UPI ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={manualUpiId}
                      onChange={handleUpiIdChange}
                      placeholder="example@paytm"
                      disabled={processing}
                      className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                        upiIdValid === false ? 'border-red-500' : upiIdValid === true ? 'border-green-500' : 'border-gray-300'
                      }`}
                    />
                    {upiIdValid === true && (
                      <span className="absolute right-3 top-3 text-green-500 text-xl">✓</span>
                    )}
                    {upiIdValid === false && (
                      <span className="absolute right-3 top-3 text-red-500 text-xl">✗</span>
                    )}
                  </div>
                  {upiIdValid === false && (
                    <p className="text-red-500 text-sm mt-1">Invalid UPI ID format</p>
                  )}
                  {upiIdValid === true && (
                    <p className="text-green-500 text-sm mt-1">Valid UPI ID ✓</p>
                  )}
                </div>

                <button
                  onClick={handleManualUpiPayment}
                  disabled={!upiIdValid || processing}
                  className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay ₹{amount}
                </button>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>💡 Popular UPI IDs:</strong>
                    <br />• PhonePe: yourname@ybl
                    <br />• Paytm: mobile@paytm
                    <br />• Google Pay: mobile@okaxis
                  </p>
                </div>
              </div>
            )}

            {/* QR Code Payment */}
            {paymentType === 'qr-code' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg mb-4 text-center">Scan QR Code to Pay</h3>
                
                {!showQR ? (
                  <button
                    onClick={handleQRPayment}
                    className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold hover:bg-purple-700 transition"
                  >
                    Generate QR Code
                  </button>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl border-4 border-purple-600 mb-4">
                      <QRCodeCanvas
                        value={`upi://pay?pa=${MERCHANT_UPI}&pn=Luxora&am=${amount}&cu=INR&tn=Order Payment`}
                        size={300}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    
                    <div className="text-center mb-4">
                      <p className="text-2xl font-bold text-purple-600 mb-2">₹{amount}</p>
                      <p className="text-sm text-gray-600">Scan with any UPI app</p>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-3xl mb-1">📱</div>
                        <p className="text-xs">PhonePe</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-1">💳</div>
                        <p className="text-xs">Paytm</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-1">🔷</div>
                        <p className="text-xs">GPay</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-1">💰</div>
                        <p className="text-xs">Others</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const verified = confirm('Have you completed the payment?\n\nClick OK if payment is done.');
                        if (verified) handlePaymentSuccess();
                      }}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                    >
                      Ive Completed Payment
                    </button>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>How to pay:</strong>
                    <br />1. Open any UPI app (PhonePe, Paytm, GPay, etc.)
                    <br />2. Scan the QR code
                    <br />3. Verify amount and complete payment
                  </p>
                </div>
              </div>
            )}

            {/* Card Payment (existing) */}
            {paymentType === 'card' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg mb-4">Pay with Card</h3>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    disabled={processing}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                      disabled={processing}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength="3"
                      disabled={processing}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCardPayment}
                  disabled={processing}
                  className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `Pay ₹${amount}`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Checkout Page Component
const CheckoutPage = ({ setCurrentPage }) => {
  const { cart, cartTotal, cartSubtotal, discount, discountAmount, clearCart, placeOrder, orders } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [errors, setErrors] = useState({});
  const [orderId, setOrderId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
  newErrors.email = 'Email is required';
} else {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(formData.email.trim())) {
    newErrors.email = 'Please enter a valid email address';
  }
}

    if (!formData.phone.trim()) {
  newErrors.phone = 'Phone is required';
} else {
  const INDIAN_PHONE_REGEX = /^(\+91[\s-]?)?[6-9]\d{9}$/;
  const cleanPhone = formData.phone.replace(/[\s-]/g, '');
  if (!INDIAN_PHONE_REGEX.test(cleanPhone)) {
    newErrors.phone = 'Please enter a valid Indian mobile number';
  }
}
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'PIN code is required';
    else if (!/^[0-9]{6}$/.test(formData.pincode)) newErrors.pincode = 'PIN code must be 6 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setIsSubmitting(true);
  try {
    // Show payment modal for online payment
    if (formData.paymentMethod === 'online') {
      setIsSubmitting(false);
      setShowPaymentModal(true);
      return;
    }
    
    const newOrderId = await placeOrder({
      ...formData,
      total: cartTotal,
      subtotal: cartSubtotal,
      discount: discount,
      discountAmount: discountAmount
    });
    setOrderId(newOrderId);
    setOrderPlaced(true);
    clearCart();
  } catch (error) {
    console.error('Order error:', error);
    alert('Failed to place order. Please try again.');
  } finally {
    setIsSubmitting(false);  // CHANGED FROM true TO false
  }
};

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <ShoppingCart className="w-20 h-20 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6">Add some products to your cart before checking out.</p>
            <button
              onClick={() => setCurrentPage('products')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-2">Thank you for your order, {formData.fullName}!</p>
            <p className="text-sm text-gray-500 mb-6">Order ID: #{orderId}</p>
            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Order Total</p>
              <p className="text-3xl font-bold text-purple-600">₹{orders[0]?.total || 0}</p>
              {orders[0]?.discount > 0 && (
                <p className="text-sm text-green-600 mt-2">You saved ₹{orders[0]?.discountAmount}!</p>
              )}
            </div>
            <p className="text-gray-600 mb-8">
              We have sent a confirmation email to <strong>{formData.email}</strong>
              <br />Your order will be delivered to your address within 3-5 business days.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setCurrentPage('orders')}
                className="bg-white border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition"
              >
                View Orders
              </button>
              <button
                onClick={() => {
                  setOrderPlaced(false);
                  setCurrentPage('home');
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="+91 1234567890"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Street address, apartment, suite, etc."
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="City"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="State"
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">PIN Code *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="400001"
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="ml-3 font-semibold">Cash on Delivery (COD)</span>
                  </label>
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={formData.paymentMethod === 'online'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="ml-3 font-semibold">Online Payment (UPI/Card)</span>
                  </label>
                </div>
              </div>

              <button
  type="submit"
  disabled={isSubmitting}
  className={`w-full mt-8 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-black to-gray-900 hover:border-yellow-400'} text-white py-4 rounded-lg font-bold text-lg border-2 border-yellow-500 transition shadow-xl`}
>
  {isSubmitting ? 'Processing Order...' : `Place Order - ₹${cartTotal}`}
</button>
            </form>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded flex items-center justify-center flex-shrink-0 text-xl">
                      {item.image === 'necklace' && '💍'}
                      {item.image === 'kurti' && '👗'}
                      {item.image === 'earrings' && '👂'}
                      {item.image === 'handbag' && '👜'}
                      {item.image === 'saree' && '🥻'}
                      {item.image === 'sunglasses' && '🕶️'}
                      {item.image === 'ring' && '💎'}
                      {item.image === 'palazzo' && '👘'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-purple-600">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
                  <span>Total</span>
                  <span className="text-yellow-600">₹{cartTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PaymentModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={cartTotal}
        onSuccess={() => {
          setShowPaymentModal(false);
          const newOrderId = placeOrder({
            ...formData,
            total: cartTotal,
            subtotal: cartSubtotal,
            discount: discount,
            discountAmount: discountAmount
          });
          setOrderId(newOrderId);
          setOrderPlaced(true);
          clearCart();
        }}
      />
    </div>
  );
};

// Return Policy Page Component
const ReturnPolicyPage = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="text-purple-600 hover:text-purple-800 font-semibold mb-4 flex items-center"
          >
            ← Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Return & Refund Policy</h1>
          <p className="text-gray-600 text-lg">Effective from January 1, 2024</p>
        </div>

        {/* Important Notice */}
        <div className="bg-red-50 border-l-4 border-red-600 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-red-700 text-lg mb-2">⚠ Important Notice</h3>
          <p className="text-red-700">Luxora offers a 7-day return policy <strong>ONLY for damaged or defective products</strong>. Regular returns due to change of mind, color preference, or size issues are not accepted. All our products are quality-assured and priced competitively.</p>
        </div>

        {/* Policy Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          
          {/* Return Window */}
          <section>
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Return Window</h2>
              </div>
            </div>
            <div className="ml-14 space-y-3">
              <p className="text-gray-700">You have <strong>7 calendar days</strong> from the date of delivery to initiate a return claim for a damaged or defective product.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700"><strong>Example:</strong> If your order is delivered on January 15th, you must initiate a return request by January 22nd. After this period, no returns will be accepted.</p>
              </div>
            </div>
          </section>

          {/* What Can Be Returned */}
          <section>
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">What Can Be Returned?</h2>
              </div>
            </div>
            <div className="ml-14 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">✓ Eligible for Return:</h4>
                <ul className="space-y-2">
                  <li className="text-gray-700">• Products with manufacturing defects</li>
                  <li className="text-gray-700">• Damaged items upon delivery</li>
                  <li className="text-gray-700">• Products that do not function as intended</li>
                  <li className="text-gray-700">• Items with broken parts or structural damage</li>
                  <li className="text-gray-700">• Products with missing components</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-2">✗ NOT Eligible for Return:</h4>
                <ul className="space-y-2">
                  <li className="text-gray-700">• Change of mind or product preference</li>
                  <li className="text-gray-700">• Color or size mismatch (customer responsibility)</li>
                  <li className="text-gray-700">• User-caused damage or misuse</li>
                  <li className="text-gray-700">• Normal wear and tear</li>
                  <li className="text-gray-700">• Products used beyond inspection purposes</li>
                  <li className="text-gray-700">• Missing unboxing video proof (see requirement below)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Video Proof Requirement */}
          <section>
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Video Proof Requirement</h2>
              </div>
            </div>
            <div className="ml-14 space-y-4">
              <p className="text-gray-700"><strong>MANDATORY:</strong> To process any return claim for a damaged or defective product, you MUST provide video evidence of the product being unboxed and the damage/defect being discovered.</p>
              
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-yellow-900">Video Requirements:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Record the entire unboxing process from start to finish</li>
                  <li>• Clearly show the packaging condition when received</li>
                  <li>• Show the product being removed from packaging</li>
                  <li>• Clearly display the damage or defect</li>
                  <li>• Video must be clear, audible, and timestamp-visible</li>
                  <li>• Duration: Minimum 2-3 minutes covering full unboxing</li>
                  <li>• Send video link (Mail) within 24 hours of delivery</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700"><strong>⚠ No video proof = No return accepted.</strong> We cannot process returns without video evidence of the damage at the time of unboxing. This protects both you and Luxora from false claims.</p>
              </div>
            </div>
          </section>

          {/* Return Process */}
          <section>
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">4</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">How to Initiate a Return</h2>
              </div>
            </div>
            <div className="ml-14 space-y-3">
              <ol className="space-y-3 text-gray-700">
                <li><strong>Step 1:</strong> Record video of unboxing and damage immediately upon delivery</li>
                <li><strong>Step 2:</strong> Contact us within 24 hours with your Order ID and video proof</li>
                <li><strong>Step 3:</strong> Send video via email (feed.luxora@gmail.com)</li>
                <li><strong>Step 4:</strong> Our team will review your claim within 24-48 hours</li>
                <li><strong>Step 5:</strong> If approved, we will send you a prepaid return label</li>
                <li><strong>Step 6:</strong> Pack the product securely and ship it back</li>
                <li><strong>Step 7:</strong> Refund will be processed within 7-10 business days after receipt</li>
              </ol>
            </div>
          </section>

          {/* Refund Details */}
          <section>
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">5</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Refund Details</h2>
              </div>
            </div>
            <div className="ml-14 space-y-3">
              <p className="text-gray-700"><strong>Refund Amount:</strong> Full purchase price of the product (excluding original shipping charges unless damage was caused by our courier)</p>
              <p className="text-gray-700"><strong>Refund Timeline:</strong> 7-10 business days after we receive and inspect the returned product</p>
              <p className="text-gray-700"><strong>Refund Method:</strong> Refund will be credited to your original payment method</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600"><strong>Note:</strong> Original shipping charges are non-refundable. Return shipping will be covered by Luxora through a prepaid label.</p>
              </div>
            </div>
          </section>

          {/* Why We Have This Policy */}
          <section>
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">6</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Why This Policy?</h2>
              </div>
            </div>
            <div className="ml-14 space-y-3">
              <p className="text-gray-700">At Luxora, we believe in quality and fair pricing. All our products are carefully selected and quality-tested before shipment. We offer competitive prices because we maintain high standards. This return policy protects both our customers and our business by:</p>
              <ul className="space-y-2 mt-3">
                <li className="text-gray-700">• Ensuring legitimacy of damage claims with video proof</li>
                <li className="text-gray-700">• Reducing false returns and fraudulent claims</li>
                <li className="text-gray-700">• Maintaining competitive pricing for all customers</li>
                <li className="text-gray-700">• Allowing us to improve product quality based on real feedback</li>
              </ul>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">7</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Contact Us for Returns</h2>
              </div>
            </div>
            <div className="ml-14 space-y-3">
              <p className="text-gray-700"><strong>Email:</strong> feed.luxora@gmail.com</p>
              <p className="text-gray-700"><strong>Response Time:</strong> 24-48 hours (Monday to Saturday, 9 AM - 6 PM IST)</p>
            </div>
          </section>
        </div>

        {/* Legal Notice */}
        <div className="mt-8 bg-gray-100 rounded-xl p-8">
          <h3 className="font-bold text-gray-800 mb-4">Legal Disclaimer</h3>
          <div className="text-sm text-gray-700 space-y-3">
            <p>1. This return policy is governed by the laws of India and complies with the Consumer Protection Act, 2019, and the e-commerce guidelines set by the Department of Consumer Affairs.</p>
            
            <p>2. Luxora reserves the right to refuse returns that do not meet the criteria outlined in this policy. Any disputes regarding return eligibility will be handled fairly and transparently.</p>
            
            <p>3. In cases of fraudulent return claims or video tampering, Luxora reserves the right to take legal action as permitted under applicable laws.</p>
            
            <p>4. Video proof is required to establish the timeline and nature of the damage/defect. Without video evidence, claims cannot be verified and will be denied.</p>
            
            <p>5. This policy may be updated at any time. Customers are advised to review the latest policy before making purchases. The policy in effect at the time of purchase will apply to that order.</p>
            
            <p>6. In case of disputes or complaints, customers can escalate to relevant consumer protection authorities in accordance with Indian consumer law.</p>
            
            <p><strong>Last Updated:</strong> January 2024</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setCurrentPage('products')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

// About Us Page Component
const AboutUsPage = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg p-8 mb-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="text-white hover:text-yellow-300 font-semibold mb-4 flex items-center"
          >
            ← Back to Home
          </button>
          <h1 className="text-5xl font-bold mb-4">💫 About Luxora</h1>
          <p className="text-xl text-purple-100">Your destination for timeless fashion, elegant jewelry, and everyday luxury.</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <p className="text-gray-700 text-lg leading-relaxed">
              Welcome to <strong className="text-purple-600">Luxora</strong> – your destination for timeless fashion, elegant jewelry, and everyday luxury. We started Luxora with one simple goal: to make premium-quality fashion affordable for everyone.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mt-4">
              From classic sarees and designer kurtis to eye-catching jewelry, handbags, and accessories, every Luxora piece is designed to add a touch of beauty and confidence to your life. Our products are carefully curated to bring together style, comfort, and craftsmanship – because we believe that true elegance is in the details.
            </p>
          </section>

          {/* What We Believe */}
          <section className="bg-purple-50 rounded-lg p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-4xl mr-3">✨</span>
              What We Believe
            </h2>
            <p className="text-gray-700 leading-relaxed">
              At Luxora, fashion is not just about trends – its about self-expression. We believe that everyone deserves to look and feel their best, no matter the occasion. Thats why we source the finest fabrics, the most intricate designs, and ensure every product passes through strict quality checks before reaching you.
            </p>
          </section>

          {/* Our Promise */}
          <section>
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-4xl mr-3">💖</span>
              Our Promise
            </h2>
            <p className="text-gray-700 mb-4">We are committed to giving you:</p>
            <ul className="space-y-3">
              <li className="flex items-start text-gray-700">
                <span className="text-purple-600 font-bold mr-3">✓</span>
                <span>Top-notch quality at honest prices</span>
              </li>
              <li className="flex items-start text-gray-700">
                <span className="text-purple-600 font-bold mr-3">✓</span>
                <span>Free Cash on Delivery across India</span>
              </li>
              <li className="flex items-start text-gray-700">
                <span className="text-purple-600 font-bold mr-3">✓</span>
                <span>Fast & secure delivery you can rely on</span>
              </li>
              <li className="flex items-start text-gray-700">
                <span className="text-purple-600 font-bold mr-3">✓</span>
                <span>7-day easy return policy</span>
              </li>
              <li className="flex items-start text-gray-700">
                <span className="text-purple-600 font-bold mr-3">✓</span>
                <span>Exclusive offers and seasonal discounts for our loyal customers</span>
              </li>
            </ul>
            <p className="text-gray-700 mt-4 italic">
              Each order is handled with care, love, and a promise – a promise of trust and satisfaction.
            </p>
          </section>

          {/* Our Story */}
          <section className="bg-pink-50 rounded-lg p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-4xl mr-3">🌸</span>
              Our Story
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Luxora began as a small dream – to create a brand that celebrates Indian elegance with a modern twist. Today, we are proud to serve customers all over India, helping them dress beautifully for weddings, festivals, and everyday life. Every product we offer is inspired by tradition, art, and individuality, blending modern fashion with timeless heritage.
            </p>
          </section>

          {/* Our Mission */}
          <section>
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-4xl mr-3">💎</span>
              Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our mission is simple – to redefine luxury for the modern Indian shopper. We aim to build lasting relationships with our customers through quality, transparency, and personalized service. Luxora isnt just a brand; its a family built on trust, creativity, and style.
            </p>
          </section>

          {/* Join the Family */}
          <section className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center">
              <span className="text-4xl mr-3">🌟</span>
              Join the Luxora Family
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              We are more than a store – we are a community that celebrates beauty, confidence, and culture. Follow us on Instagram and Facebook to stay updated with our latest collections, offers, and style inspirations.
            </p>
            <p className="text-2xl font-bold text-purple-600 mb-4">
              Discover fashion. Discover yourself. Discover Luxora.
            </p>
            <button
              onClick={() => setCurrentPage('contact')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
            >
              Contact Us
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

// Contact Us Page Component
const ContactUsPage = ({ setCurrentPage }) => {
  const [socialLinks, setSocialLinks] = useState({
    facebook: 'https://facebook.com/luxora',
    instagram: 'https://instagram.com/luxora',
    twitter: 'https://twitter.com/luxora',
    website: 'https://luxora.com'
  });

  // Load social links from localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('luxora_social_links');
      if (saved) {
        setSocialLinks(JSON.parse(saved));
      }
    }
  }, []);

  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg p-8 mb-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="text-white hover:text-yellow-300 font-semibold mb-4 flex items-center"
          >
            ← Back to Home
          </button>
          <h1 className="text-5xl font-bold mb-4">📞 Contact Us</h1>
          <p className="text-xl text-purple-100">We would love to hear from you!</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          
          <p className="text-gray-700 text-lg leading-relaxed">
            Whether you have a question about your order, our products, or just want to share your feedback – we are here to help.
          </p>

          {/* Contact Information Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Address */}
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="flex items-start mb-3">
                <MapPin className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Address</h3>
                  <p className="text-gray-700">Luxora Fashion Store</p>
                  <p className="text-gray-700">Karnataka, India</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-pink-50 rounded-lg p-6">
              <div className="flex items-start mb-3">
                <Mail className="w-6 h-6 text-pink-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Email</h3>
                  <a href="mailto:feed.luxora@gmail.com" className="text-pink-600 hover:text-pink-800 font-semibold">
                    feed.luxora@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-start mb-3">
                <Phone className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Phone</h3>
                  <a href="tel:+917406778169" className="text-blue-600 hover:text-blue-800 font-semibold">
                    +91 7406778169
                  </a>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-start mb-3">
                <Clock className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Working Hours</h3>
                  <p className="text-gray-700">Monday – Saturday</p>
                  <p className="text-gray-700 font-semibold">10:00 AM – 7:00 PM</p>
                  <p className="text-gray-600 text-sm mt-1">Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <section className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect With Us</h2>
            <p className="text-gray-700 mb-6">Follow us on social media for latest updates and offers!</p>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleSocialClick(socialLinks.facebook)}
                className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg font-semibold"
              >
                <Facebook className="w-5 h-5 mr-2" />
                Facebook
              </button>
              
              <button
                onClick={() => handleSocialClick(socialLinks.instagram)}
                className="flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-lg font-semibold"
              >
                <Instagram className="w-5 h-5 mr-2" />
                Instagram
              </button>
              
              <button
                onClick={() => handleSocialClick(socialLinks.twitter)}
                className="flex items-center bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition shadow-lg font-semibold"
              >
                <Twitter className="w-5 h-5 mr-2" />
                Twitter
              </button>
              
              <button
                onClick={() => handleSocialClick(socialLinks.website)}
                className="flex items-center bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition shadow-lg font-semibold"
              >
                <Package className="w-5 h-5 mr-2" />
                Website
              </button>
            </div>
          </section>

          {/* Quick Message Section */}
          <section className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Send Us a Quick Message</h3>
            <p className="text-gray-600 mb-4">
              For immediate assistance, please email us at{' '}
              <a href="mailto:feed.luxora@gmail.com" className="text-purple-600 font-semibold hover:text-purple-800">
                feed.luxora@gmail.com
              </a>
              {' '}or call us at{' '}
              <a href="tel:+917406778169" className="text-purple-600 font-semibold hover:text-purple-800">
                +91 7406778169
              </a>
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-sm text-gray-700">
                <strong>💡 Quick Tip:</strong> Have your Order ID ready when contacting us for faster assistance!
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Footer Component 
const Footer = ({ setCurrentPage }) => {
  const { isAdminLoggedIn } = useStore();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setSubscribeMessage('Please enter your email');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubscribeMessage('Please enter a valid email');
      return;
    }
    
    setIsSubscribing(true);
    setSubscribeMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubscribeMessage('✓ Successfully subscribed!');
      setEmail('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSubscribeMessage(''), 3000);
    } catch (error) {
      setSubscribeMessage('✗ Failed to subscribe. Try again.');
    } finally {
      setIsSubscribing(false);
    }
  };
  
  return (
    <footer className="bg-black text-white py-12 border-t-4 border-yellow-500">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-8 h-8" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Luxora</h3>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => setCurrentPage('about')} className="hover:text-white transition">About Us</button></li>
              <li><button onClick={() => setCurrentPage('products')} className="hover:text-white transition">Shop</button></li>
              <li><button onClick={() => setCurrentPage('contact')} className="hover:text-white transition">Contact</button></li>
              <li><button onClick={() => setCurrentPage('returnpolicy')} className="hover:text-white transition">Return Policy</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+91 7406778169</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>feed.luxora@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Karnataka, India</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Follow Us</h4>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="hover:text-yellow-500 transition"><Facebook className="w-6 h-6" /></a>
              <a href="#" className="hover:text-yellow-500 transition"><Twitter className="w-6 h-6" /></a>
              <a href="#" className="hover:text-yellow-500 transition"><Instagram className="w-6 h-6" /></a>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Newsletter</h5>
              <p className="text-gray-400 text-sm mb-3">Subscribe to get special offers!</p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setSubscribeMessage(''); }}
                    disabled={isSubscribing}
                    className="flex-1 px-4 py-2 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                  />
                  <button 
                    type="submit"
                    disabled={isSubscribing}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-4 py-2 rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition font-bold shadow-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                  >
                    {isSubscribing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </div>
                {subscribeMessage && (
                  <p className={`text-sm ${subscribeMessage.includes('✓') ? 'text-green-400' : 'text-red-400'}`}>
                    {subscribeMessage}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Luxora. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
};

// Admin Login Page
const AdminLoginPage = ({ setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (loading) return; // Prevent double submission
    
    setLoading(true);
    setError('');
    
    try {
      await loginAdmin(email, password);
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentPage('admin');
    } catch (error) {
      setError(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <ShieldCheck className="w-16 h-16 mx-auto text-purple-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600 mt-2">Sign in to access admin panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="admin@luxora.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center animate-shake">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <button
          onClick={() => setCurrentPage('home')}
          disabled={loading}
          className="w-full mt-4 text-purple-600 hover:text-purple-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back to Store
        </button>
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = ({ setCurrentPage }) => {
  const { products, orders, adminLogout } = useStore();
  const [activeTab, setActiveTab] = useState('overview');

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  const recentOrders = orders.slice(0, 5);

  const handleLogout = async () => {
  await logoutAdmin();
  setCurrentPage('home');
};





  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <ShieldCheck className="w-8 h-8 mr-3 text-purple-600" />
        Admin Dashboard
      </h1>
      <p className="text-gray-600 mt-1">Manage your store</p>
    </div>
    <div className="flex gap-3">
      <button
  onClick={handleLogout}
  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition flex items-center"
>
  <X className="w-5 h-5 mr-2" />
  Logout
</button>
    </div>
  </div>
</div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-purple-100">Total Revenue</p>
                <h3 className="text-3xl font-bold mt-2">₹{totalRevenue}</h3>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-100">Total Orders</p>
                <h3 className="text-3xl font-bold mt-2">{totalOrders}</h3>
              </div>
              <Package className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-green-100">Total Products</p>
                <h3 className="text-3xl font-bold mt-2">{totalProducts}</h3>
              </div>
              <ShoppingCart className="w-10 h-10 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-orange-100">Low Stock Alert</p>
                <h3 className="text-3xl font-bold mt-2">{lowStockProducts}</h3>
              </div>
              <AlertCircle className="w-10 h-10 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-semibold ${activeTab === 'overview' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-4 font-semibold ${activeTab === 'products' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 font-semibold ${activeTab === 'orders' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('coupons')}
                className={`px-6 py-4 font-semibold ${activeTab === 'coupons' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Coupons
              </button>
              {/* ADD THIS NEW TAB */}
               <button
               onClick={() => setActiveTab('categories')}
               className={`px-6 py-4 font-semibold ${activeTab === 'categories' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 hover:text-gray-800'}`}
               >
               Categories
               </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
                  {recentOrders.length === 0 ? (
                    <p className="text-gray-600">No orders yet</p>
                  ) : (
                    <div className="space-y-3">
                      {recentOrders.map(order => (
                        <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold">Order #{order.id}</p>
                            <p className="text-sm text-gray-600">{order.fullName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple-600">₹{order.total}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'Shipped' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'products' && <AdminProducts />}
            {activeTab === 'orders' && <AdminOrders />}
            {activeTab === 'coupons' && <AdminCoupons />}
            {activeTab === 'categories' && <AdminCategories />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Products Management
const AdminProducts = () => {
  const { products, setProducts, addProduct, updateProduct, deleteProduct } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Delete this product?')) return;
    
    setDeletingProductId(productId);
    try {
      await deleteProduct(productId);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleDeleteAllProducts = async () => {
    if (!confirm(`⚠️ Delete ALL ${products.length} products?\n\nThis will leave your store EMPTY!\n\nContinue?`)) return;
    
    try {
      toast.loading('Deleting all products...', { id: 'deleteAll' });
      
      // Get fresh data from Firebase
      const allProducts = await getAll('products');
      console.log('📦 Found products to delete:', allProducts.length);
      
      // Delete from Firebase using _id
      for (const product of allProducts) {
        if (product._id) {
          console.log('🗑️ Deleting:', product.id, product.name);
          await remove('products', product._id);
        }
      }
      
      console.log('✅ All products deleted from Firebase');
      
      // Clear local state
      setProducts([]);
      
      toast.success('✅ All products deleted!', { id: 'deleteAll' });
    } catch (error) {
      console.error('Delete all error:', error);
      toast.error('❌ Failed to delete all products', { id: 'deleteAll' });
    }
  };

  const handleResetProducts = async () => {
    if (!confirm('⚠️ This will DELETE all products and restore 8 defaults. Continue?')) return;
    
    try {
      toast.loading('Resetting products...', { id: 'reset' });
      
      // Step 1: Get ALL products from Firebase
      const allProducts = await getAll('products');
      console.log('📦 Products to delete:', allProducts.length);
      
      // Step 2: Delete ALL products from Firebase
      for (const product of allProducts) {
        if (product._id) {
          console.log('🗑️ Deleting product:', product.id, product._id);
          await remove('products', product._id);
        }
      }
      
      console.log('✅ All products deleted from Firebase');
      
      // Step 3: Wait to ensure deletions are complete
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 4: Add default products back
      console.log('➕ Adding default products...');
      for (const product of INITIAL_PRODUCTS) {
        await create('products', product, String(product.id));
      }
      
      console.log('✅ Default products added');
      
      toast.success('✅ Products reset to default!', { id: 'reset' });
      
      // Step 5: Reload to sync with Firebase
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Reset error:', error);
      toast.error('❌ Failed to reset products', { id: 'reset' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Manage Products</h3>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteAllProducts}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center font-bold"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete All
          </button>
          
          <button
            onClick={handleResetProducts}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center font-bold"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset to Default
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-black px-6 py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition flex items-center font-bold shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No products yet</p>
          </div>
        ) : (
          products.map((product, index) => (
            <div key={`product-${product.id}-${index}`} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">
              <ProductImage image={product.image} images={product.images} name={product.name} />
              <div className="p-4">
                <h4 className="font-bold text-lg mb-2">{product.name}</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-600 font-bold">₹{product.price}</span>
                  <span className={`text-sm ${product.stock < 10 ? 'text-red-600 font-semibold' : 'text-green-600'}`}>
                    Stock: {product.stock}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{product.category}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProduct(product)}
                    disabled={deletingProductId === product.id}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={deletingProductId === product.id}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[48px]"
                  >
                    {deletingProductId === product.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <ProductFormModal
          onClose={() => setShowAddModal(false)}
          onSave={(product) => {
            addProduct(product);
            setShowAddModal(false);
          }}
        />
      )}

      {editingProduct && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={(updatedProduct) => {
            updateProduct(editingProduct.id, updatedProduct);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

// Product Form Modal
const ProductFormModal = ({ product, onClose, onSave }) => {
  const { categories } = useStore();
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
  price: product?.price || '',
  originalPrice: product?.originalPrice || '',
  category: product?.category || 'Ethnic',
  description: product?.description || '',
  stock: product?.stock || '',
  image: product?.image || 'necklace',
  images: product?.images || [],
  features: Array.isArray(product?.features) ? product.features : ['', '', '', ''],
  ageRange: product?.ageRange || product?.sizeRange || '',
  dimensions: product?.dimensions || '',
  tags: Array.isArray(product?.tags) ? product.tags : []
});


  const availableTags = ['bestseller', 'new', 'trending'];
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (index, value) => {
  const currentFeatures = Array.isArray(formData.features) ? formData.features : ['', '', '', ''];
  const newFeatures = [...currentFeatures];
  newFeatures[index] = value;
  setFormData(prev => ({ ...prev, features: newFeatures }));
};
  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }));
  };

  const [uploading, setUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState('');

const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files);
  const currentImages = formData.images || [];
  
  if (currentImages.length >= 10) {
    alert('Maximum 10 images allowed per product');
    e.target.value = ''; // Clear input
    return;
  }
  
  const remainingSlots = 10 - currentImages.length;
  const filesToProcess = files.slice(0, remainingSlots);
  
  setUploading(true);
  
  try {
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        continue;
      }
      
      // Validate file size (10MB for Cloudinary free tier)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum 10MB per image.`);
        continue;
      }
      
      setUploadProgress(`Uploading ${i + 1}/${filesToProcess.length}: ${file.name}...`);
      
      const downloadURL = await uploadImage(file, 'products');
      
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), downloadURL]
      }));
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert(`Upload failed: ${error.message}`);
  } finally {
    setUploading(false);
    setUploadProgress('');
    e.target.value = ''; // Clear input
  }
};

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      price: parseFloat(formData.price),
      originalPrice: parseFloat(formData.originalPrice),
      stock: parseInt(formData.stock),
      features: formData.features.filter(f => f.trim() !== '')
    };
    onSave(finalData);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
            <h2 className="text-2xl font-bold">{product ? 'Edit Product' : 'Add New Product'}</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Original Price (₹) *</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Size Range</label>
                <input
                  type="text"
                  name="sizeRange"
                  value={formData.sizeRange || formData.ageRange}
                  onChange={(e) => setFormData({...formData, sizeRange: e.target.value, ageRange: e.target.value})}
                  placeholder="e.g., S, M, L, XL"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Dimensions</label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  placeholder="e.g., 50 x 20 x 5 cm"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Product Images</label>
              <p className="text-xs text-gray-500 mb-3">Upload and preview your product images. First image will be the main display image.</p>
              
              <div className="grid grid-cols-5 gap-3">
                {/* Existing Images */}
                {formData.images && formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square border-2 border-purple-200 rounded-lg overflow-hidden bg-gray-50">
                      <Image 
                        src={img} 
                        alt={`Product ${index + 1}`} 
                        className="w-full h-full object-cover" 
                        width={200} 
                        height={200} 
                        
                      />
                    </div>
                    {/* Image controls */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                        Main
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add Image Button */}
                {(!formData.images || formData.images.length < 10) && (
                 <label className="aspect-square border-2 border-dashed border-purple-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition">
  {uploading ? (
    <>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
      <span className="text-xs text-purple-600 font-semibold text-center px-2">
        {uploadProgress || 'Uploading...'}
      </span>
    </>
  ) : (
    <>
      <Plus className="w-8 h-8 text-purple-400 mb-2" />
      <span className="text-sm text-purple-600 font-semibold">Add Image</span>
      <span className="text-xs text-gray-500 mt-1">{formData.images?.length || 0}/10</span>
    </>
  )}
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={handleImageUpload}
    className="hidden"
    disabled={uploading}
  />
</label>
                )}
              </div>
              
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-semibold mb-1">Image Tips:</p>
                    <ul className="space-y-1 ml-3 list-disc">
                      <li>Upload up to 10 images per product</li>
                      <li>First image will be the main product image</li>
                      <li>Recommended size: 500x500px or larger</li>
                      <li>Supported formats: PNG, JPG, JPEG</li>
                      <li>Max file size: 2MB per image</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>

            <div>
  <label className="block text-sm font-semibold mb-2">Features (up to 4)</label>
  {[0, 1, 2, 3].map(index => (
    <input
      key={index}
      type="text"
      value={(formData.features && formData.features[index]) || ''}
      onChange={(e) => handleFeatureChange(index, e.target.value)}
      placeholder={`Feature ${index + 1}`}
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 mb-2"
    />
  ))}
</div>

            <div>
              <label className="block text-sm font-semibold mb-2">Tags</label>
              <div className="flex gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full font-semibold transition ${
                      formData.tags?.includes(tag)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
              >
                {product ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// Admin Orders Management
const AdminOrders = () => {
  const { orders, updateOrderStatus } = useStore();
  const [filterStatus, setFilterStatus] = useState('All');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      // Success feedback already in updateOrderStatus
    } catch (error) {
      console.error('Status update error:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-yellow-100 text-yellow-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Manage Orders</h3>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          <option value="All">All Orders</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

     {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-gray-50 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold mb-1">Order #{order.id}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(order.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="relative">
                  {updatingOrderId === order.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-full">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    </div>
                  )}
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    disabled={updatingOrderId === order.id}
                    className={`px-4 py-2 rounded-full font-semibold cursor-pointer ${getStatusColor(order.status)} border-2 border-transparent hover:border-purple-400 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                    style={{ appearance: 'auto' }}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h5 className="font-semibold mb-2">Customer Details</h5>
                  <p className="text-sm text-gray-700">{order.fullName}</p>
                  <p className="text-sm text-gray-600">{order.email}</p>
                  <p className="text-sm text-gray-600">{order.phone}</p>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Shipping Address</h5>
                  <p className="text-sm text-gray-600">{order.address}</p>
                  <p className="text-sm text-gray-600">{order.city}, {order.state} - {order.pincode}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h5 className="font-semibold mb-3">Order Items</h5>
                <div className="space-y-2">
                  {order.items.map((item, itemIndex) => (
                    <div key={`admin-${order.id}-item-${item.id}-${itemIndex}`} className="flex justify-between items-center bg-white p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded flex items-center justify-center text-xl overflow-hidden">
                        {item.images && item.images.length > 0 ? (
                         <Image src={item.images[0]} alt={item.name} className="w-full h-full object-cover" width={48} height={48} />
                        ) : (
                         <>
                        {item.image === 'necklace' && '💍'}
                        {item.image === 'kurti' && '👗'}
                        {item.image === 'earrings' && '💂'}
                        {item.image === 'handbag' && '👜'}
                        {item.image === 'saree' && '🥻'}
                        {item.image === 'sunglasses' && '🕶️'}
                        {item.image === 'ring' && '💎'}
                        {item.image === 'palazzo' && '👘'}
                        {!item.image && <Package className="w-8 h-8 text-purple-400" />}
                        </>
                        )}
                        </div>
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                      </div>
                      <p className="font-bold text-purple-600">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t mt-4 pt-4 flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">Payment Method: </span>
                  <span className="font-semibold">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-600">₹{order.total}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Admin Coupons Management
const AdminCoupons = () => {
  const { coupons, addCoupon, deleteCoupon } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '' });
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [deletingCouponCode, setDeletingCouponCode] = useState(null);

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount) return;
    
    setIsAddingCoupon(true);
    try {
      await addCoupon(newCoupon.code, parseInt(newCoupon.discount));
      setNewCoupon({ code: '', discount: '' });
      setShowAddModal(false);
      alert('Coupon added successfully!');
    } catch (error) {
      console.error('Add coupon error:', error);
      alert('Failed to add coupon');
    } finally {
      setIsAddingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (code) => {
    if (!confirm(`Delete coupon ${code}?`)) return;
    
    setDeletingCouponCode(code);
    try {
      await deleteCoupon(code);
      alert('Coupon deleted successfully!');
    } catch (error) {
      console.error('Delete coupon error:', error);
      alert('Failed to delete coupon');
    } finally {
      setDeletingCouponCode(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Manage Coupons</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-black px-6 py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition flex items-center font-bold shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Coupon
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(coupons).map(([code, discount]) => (
          <div key={code} className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6 relative">
            <button
              onClick={() => handleDeleteCoupon(code)}
              disabled={deletingCouponCode === code}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingCouponCode === code ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
            <div className="border-2 border-dashed border-purple-400 rounded-lg p-4 mb-3">
              <p className="text-2xl font-bold text-purple-600 text-center">{code}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-700">{discount}% OFF</p>
              <p className="text-sm text-gray-600 mt-1">Discount</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => !isAddingCoupon && setShowAddModal(false)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Add New Coupon</h3>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  disabled={isAddingCoupon}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddCoupon} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Coupon Code *</label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., SAVE20"
                    disabled={isAddingCoupon}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Discount Percentage *</label>
                  <input
                    type="number"
                    value={newCoupon.discount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                    placeholder="e.g., 20"
                    min="1"
                    max="100"
                    disabled={isAddingCoupon}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={isAddingCoupon}
                    className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingCoupon}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isAddingCoupon ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Coupon'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Admin Categories Management
const AdminCategories = () => {
  const { categories, products, addCategory, deleteCategory, updateCategory } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);

  // 🔧 SAFETY CHECK: Ensure categories is always an array
  const safeCategories = React.useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    return categories;
  }, [categories]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setIsAddingCategory(true);
    try {
      if (await addCategory(newCategoryName)) {
        setNewCategoryName('');
        setShowAddModal(false);
        alert('Category added successfully!');
      }
    } catch (error) {
      console.error('Add category error:', error);
      alert('Failed to add category');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setIsUpdatingCategory(true);
    try {
      if (await updateCategory(editingCategory, editCategoryName)) {
        setEditingCategory(null);
        setEditCategoryName('');
        alert('Category updated successfully!');
      }
    } catch (error) {
      console.error('Update category error:', error);
      alert('Failed to update category');
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    if (!confirm(`Delete category "${categoryName}"?`)) return;
    
    setDeletingCategory(categoryName);
    try {
      if (await deleteCategory(categoryName)) {
        alert('Category deleted successfully!');
      }
    } catch (error) {
      console.error('Delete category error:', error);
      alert('Failed to delete category');
    } finally {
      setDeletingCategory(null);
    }
  };

  const getCategoryProductCount = (categoryName) => {
    return products.filter(p => p.category === categoryName).length;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Manage Categories</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-black px-6 py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition flex items-center font-bold shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {safeCategories.map(category => {
          const productCount = getCategoryProductCount(category);
          const isDeleting = deletingCategory === category;
          
          return (
            <div 
              key={category} 
              className={`bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 transition ${isDeleting ? 'opacity-50' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-purple-800 mb-2">{category}</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="w-4 h-4 mr-1" />
                    <span>{productCount} product{productCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setEditCategoryName(category);
                    }}
                    disabled={isDeleting}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit category"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    disabled={isDeleting}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[40px]"
                    title="Delete category"
                  >
                    {isDeleting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {productCount > 0 && (
                <div className="bg-white bg-opacity-60 rounded-lg p-3 mt-3">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Recent Products:</p>
                  <div className="text-xs text-gray-700 space-y-1">
                    {products.filter(p => p.category === category).slice(0, 3).map(p => (
                      <div key={p.id} className="truncate">• {p.name}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => !isAddingCategory && setShowAddModal(false)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Add New Category</h3>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  disabled={isAddingCategory}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category Name *</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Traditional Wear"
                    disabled={isAddingCategory}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">Enter a unique category name for organizing your products</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={isAddingCategory}
                    className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingCategory}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isAddingCategory ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Category'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => !isUpdatingCategory && setEditingCategory(null)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Edit Category</h3>
                <button 
                  onClick={() => setEditingCategory(null)} 
                  disabled={isUpdatingCategory}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category Name *</label>
                  <input
                    type="text"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    disabled={isUpdatingCategory}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {getCategoryProductCount(editingCategory)} product(s) will be updated with the new category name
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    disabled={isUpdatingCategory}
                    className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingCategory}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isUpdatingCategory ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Category'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Main App Content Component
const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToRecentlyViewed, isAdminLoggedIn, loading } = useStore();

    // Secret Admin Access
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true') {
        setCurrentPage('adminlogin');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  // Keyboard Shortcut
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setCurrentPage('adminlogin');
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);
 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="w-16 h-16 animate-bounce mx-auto text-purple-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Loading Luxora...</h2>
          <p className="text-gray-600 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  const handleProductView = (product) => {
    setSelectedProduct(product);
    addToRecentlyViewed(product);
  };

  const handlePageChange = (page) => {
    if (page === 'admin' && !isAdminLoggedIn) {
      setCurrentPage('adminlogin');
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage !== 'admin' && currentPage !== 'adminlogin' && (
        <Header currentPage={currentPage} setCurrentPage={handlePageChange} setShowCart={setShowCart} />
      )}
      
      {currentPage === 'home' && <HomePage setCurrentPage={handlePageChange} setSelectedProduct={handleProductView} setShowCart={setShowCart} />}
      {currentPage === 'products' && <ProductsPage setSelectedProduct={handleProductView} setShowCart={setShowCart} />}
      {currentPage === 'wishlist' && <WishlistPage setSelectedProduct={handleProductView} setShowCart={setShowCart} />}
      {currentPage === 'compare' && <ComparePage />}
      {currentPage === 'orders' && <OrdersPage />}
      {currentPage === 'checkout' && <CheckoutPage setCurrentPage={handlePageChange} />}
      {currentPage === 'about' && <AboutUsPage setCurrentPage={handlePageChange} />}
      {currentPage === 'contact' && <ContactUsPage setCurrentPage={handlePageChange} />}
      {currentPage === 'returnpolicy' && <ReturnPolicyPage setCurrentPage={handlePageChange} />}
      {currentPage === 'adminlogin' && <AdminLoginPage setCurrentPage={handlePageChange} />}
      {currentPage === 'admin' && isAdminLoggedIn && <AdminDashboard setCurrentPage={handlePageChange} />}
      
      {currentPage !== 'admin' && currentPage !== 'adminlogin' && <Footer setCurrentPage={handlePageChange} />}
      <CartSidebar show={showCart} onClose={() => setShowCart(false)} setCurrentPage={handlePageChange} />
      {selectedProduct && <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
};

// Main App Component
export default function App() {
  return (
    <StoreProvider>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <AppContent />
    </StoreProvider>
  );
}