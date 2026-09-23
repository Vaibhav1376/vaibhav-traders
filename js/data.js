/**
 * ==========================================================================
 * VAIBHAV TRADERS - UNIFIED DATA & STATE STORE
 * Manages local caching, cloud synchronization, seed catalog
 * ==========================================================================
 */

const STORAGE_KEYS = {
  PRODUCTS: 'vt_products_data',
  SETTINGS: 'vt_settings_data',
  LEADS: 'vt_leads_data',
  REVIEWS: 'vt_reviews_data',
  ADMIN_AUTH: 'vt_admin_session'
};

// Initial Seed Products Catalog with Authentic Building Material Images
const DEFAULT_PRODUCTS = [
  {
    id: 'prod-2',
    sortOrder: 1,
    name: 'ACC Gold Water Shield Cement',
    category: 'cement',
    unit: 'Per Bag (50 Kg)',
    wholesalePrice: 'Direct Tipper Discount',
    retailPrice: '₹380 - ₹405',
    stockStatus: 'in-stock',
    featured: true,
    description: 'Water-repellent premium composition that protects slabs and columns from rainwater seepage and efflorescence.',
    icon: 'cement',
    image: 'assets/images/acc-gold-cement.jpg',
    imageFit: 'contain'
  },
  {
    id: 'prod-3',
    sortOrder: 2,
    name: 'Fe 550D TMT Rebar (Tata / Jindal / Polad)',
    category: 'steel',
    unit: 'Per Ton / Per Kg (8mm - 32mm)',
    wholesalePrice: 'Live Mill Rate Discount',
    retailPrice: '₹58 - ₹68 / kg',
    stockStatus: 'in-stock',
    featured: true,
    description: 'High ductile earthquake-resistant TMT steel with superior elongation and corrosion resistance for strong foundations.',
    icon: 'steel',
    image: 'assets/images/tmt-steel-rebars.jpg',
    imageFit: 'cover'
  },
  {
    id: 'prod-4',
    sortOrder: 3,
    name: 'Washed River Sand & M-Sand (Plaster / Concrete)',
    category: 'sand-aggregate',
    unit: 'Per Brass / Truck Tipper Load',
    wholesalePrice: 'Wholesale Tipper Rate',
    retailPrice: 'Market Competitive',
    stockStatus: 'in-stock',
    featured: true,
    description: 'Double washed, silt-free river sand and precision-screened manufactured sand for optimal mortar and concrete bonding.',
    icon: 'sand',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80',
    imageFit: 'cover'
  },
  {
    id: 'prod-5',
    sortOrder: 4,
    name: 'Black Basalt Crushed Aggregates (10mm, 20mm, 40mm Khadi)',
    category: 'sand-aggregate',
    unit: 'Per Brass / Dumper Load',
    wholesalePrice: 'Quarry Direct Rate',
    retailPrice: 'Market Competitive',
    stockStatus: 'in-stock',
    featured: false,
    description: 'Angular machine-crushed hard rock blue/black basalt aggregates conforming to IS 383 standards for RCC casting.',
    icon: 'aggregate',
    image: 'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?w=600&auto=format&fit=crop&q=80',
    imageFit: 'cover'
  },
  {
    id: 'prod-8',
    sortOrder: 5,
    name: 'Supreme / Astral Heavy Duty PVC & CPVC Pipes',
    category: 'plumbing-hardware',
    unit: 'Per Length / Bundle',
    wholesalePrice: 'Contractor Wholesale',
    retailPrice: 'Standard Retail',
    stockStatus: 'in-stock',
    featured: false,
    description: 'Complete plumbing, drainage, agriculture, and casing pipe solutions with high pressure ratings and leak-proof joints.',
    icon: 'plumbing',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80',
    imageFit: 'cover'
  },
  {
    id: 'prod-9',
    sortOrder: 6,
    name: 'Dr. Fixit Waterproofing & Asian Paints Dampproof',
    category: 'finishing-paints',
    unit: '1L, 5L, 20L Cans',
    wholesalePrice: 'Contractor Pack Rate',
    retailPrice: 'MRP Discounted',
    stockStatus: 'in-stock',
    featured: false,
    description: 'Elastomeric waterproofing membranes, integral liquid waterproofing compounds, and exterior weather-guard coatings.',
    icon: 'paint',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80',
    imageFit: 'cover'
  },
  {
    id: 'prod-6',
    sortOrder: 7,
    name: 'First Class Kiln Burned Red Clay Bricks',
    category: 'bricks-blocks',
    unit: 'Per 1,000 Bricks / Tractor Load',
    wholesalePrice: 'Volume Discount',
    retailPrice: 'Best Market Price',
    stockStatus: 'in-stock',
    featured: true,
    description: 'High compressive strength, sharp edges, metallic ring tone on impact. Zero cracks, uniform burnt red finish.',
    icon: 'brick',
    image: 'https://images.unsplash.com/photo-1584463699039-4aa8366ce270?w=600&auto=format&fit=crop&q=80',
    imageFit: 'cover'
  },
  {
    id: 'prod-7',
    sortOrder: 8,
    name: 'AAC Lightweight Autoclaved Aerated Concrete Blocks',
    category: 'bricks-blocks',
    unit: 'Per Piece / Per Cubic Meter',
    wholesalePrice: 'Pallet Wholesale Price',
    retailPrice: '₹55 - ₹75 / block',
    stockStatus: 'in-stock',
    featured: false,
    description: 'Thermal insulating lightweight blocks that reduce building dead-load and speed up construction with less joint mortar.',
    icon: 'brick',
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80',
    imageFit: 'cover'
  },
  {
    id: 'prod-10',
    sortOrder: 9,
    name: 'Binding Wire, Shuttering Nails & Construction Hardware',
    category: 'plumbing-hardware',
    unit: 'Per Bundle / Kg',
    wholesalePrice: 'Bundle Wholesale',
    retailPrice: 'Retail per Kg',
    stockStatus: 'in-stock',
    featured: false,
    description: 'Annealed GI binding wire, hardened wire nails, scaffolding ties, and essential construction site hardware.',
    icon: 'hardware',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    imageFit: 'cover'
  },
  {
    id: 'prod-1',
    sortOrder: 10,
    name: 'UltraTech Cement (Super / Weather Plus)',
    category: 'cement',
    unit: 'Per Bag (50 Kg)',
    wholesalePrice: 'Call for Bulk Rate',
    retailPrice: '₹370 - ₹395',
    stockStatus: 'in-stock', // in-stock, low-stock, out-of-stock
    featured: true,
    description: 'India’s No. 1 cement. Engineered for high early strength, crack prevention, and dampness resistance in RCC structures.',
    icon: 'cement',
    image: 'assets/images/ultratech-cement.jpg',
    imageFit: 'contain'
  },
  {
    id: 'prod-1790161445630',
    sortOrder: 11,
    name: 'Swastik Cement Fibre Sheet',
    category: 'cement',
    unit: 'Per Ton',
    wholesalePrice: 'Direct Truck Delivery',
    retailPrice: '',
    stockStatus: 'in-stock',
    featured: false,
    description: 'Swastik Cement sheet is best in market. Use as doors and also heavy sheet use to make House',
    icon: 'cement',
    image: 'data:image/jpeg;base64,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',
    imageFit: 'contain'
  }
];

// Default Business Profile & Site Settings
const DEFAULT_SETTINGS = {
  businessName: 'Vaibhav Traders',
  ownerName: 'Vaibhav',
  category: 'Building Materials Supplier (Wholesale + Retail)',
  phone: '082083 43594',
  rawPhone: '8208343594',
  whatsappNumber: '918208343594',
  email: 'info@vaibhavtraders.in',
  address: 'Bus Stand, Adwadi Road, near Sinnar - Thangaon Road, Thangaon, Sinnar, Maharashtra 422103',
  googleRating: '5.0',
  reviewCount: '1',
  geo: {
    latitude: 19.7438,
    longitude: 74.0833,
    locality: 'Thangaon',
    region: 'Sinnar, Maharashtra',
    postalCode: '422103'
  },
  workingHours: 'Monday – Sunday: 7:00 AM – 8:30 PM',
  announcementText: '📢 Wholesale & Retail Delivery across Thangaon, Sinnar & Nashik District! Call 082083 43594 for Today\'s Best Rates.',
  announcementActive: true,
  adminPin: 'vaibhav2026',
  gstNumber: '27BIBPK5954M1ZS',
  tagline: 'All Type Of Building Material Supplier ( Wholesale + Retail ). Best Quality Material.'
};

// Initial Verified Reviews
const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    author: 'Sunil Gholap',
    rating: 5,
    date: 'Recent',
    comment: 'Best quality building materials in Thangaon and Sinnar area. Delivered cement and sand directly to my construction site right on time. Very honest wholesale rates and polite service by Vaibhav.',
    location: 'Thangaon, Sinnar'
  },
  {
    id: 'rev-2',
    author: 'Ramesh Patil (Civil Contractor)',
    rating: 5,
    date: 'Verified Buyer',
    comment: 'I regularly source UltraTech cement and TMT steel bars for residential projects. Quality is 100% genuine and tipper delivery is prompt. Reliable supplier for all contractors.',
    location: 'Sinnar Road'
  }
];

// Initial Customer Inquiries (Mock Data for Admin Demo)
const DEFAULT_LEADS = [
  {
    id: 'lead-1',
    name: 'Mahesh Deshmukh',
    phone: '098221 45678',
    material: 'Cement & TMT Steel',
    quantity: '200 Bags UltraTech + 2.5 Tons 550D Steel',
    location: 'Sinnar - Thangaon Road',
    type: 'Wholesale Quote',
    status: 'new', // new, contacted, quoted, completed
    date: '2026-09-20',
    notes: 'Inquired for foundation casting next Monday.'
  },
  {
    id: 'lead-2',
    name: 'Ganesh Shinde',
    phone: '094231 87654',
    material: 'River Sand & Aggregate (Khadi)',
    quantity: '3 Brass River Sand + 2 Brass 20mm',
    location: 'Adwadi Village',
    type: 'Direct Order',
    status: 'contacted',
    date: '2026-09-19',
    notes: 'Confirmed delivery address near Bus Stand.'
  }
];

// Store Interface
class DataStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    } else {
      // Auto-migrate products in localStorage: replace obsolete stock worker image with real UltraTech cement sack
      try {
        let prods = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
        let changed = false;
        if (Array.isArray(prods)) {
          prods = prods.filter(p => p.id !== '__catalog_order__' && p.id !== 'catalog_order').map((p, index) => {
            // Replace old unsplash carpenter photo for UltraTech
            if (p.id === 'prod-1' && (!p.image || p.image.includes('photo-1589939705384-5185137a7f0f'))) {
              p.image = 'assets/images/ultratech-cement.jpg';
              p.imageFit = 'contain';
              changed = true;
            }
            if (p.id === 'prod-2' && (!p.image || p.image.includes('photo-1590069261209-f8e9b8642343'))) {
              p.image = 'assets/images/acc-gold-cement.jpg';
              p.imageFit = 'contain';
              changed = true;
            }
            if (p.id === 'prod-3' && (!p.image || p.image.includes('photo-1504917599217-d4dc5ebe6122'))) {
              p.image = 'assets/images/tmt-steel-rebars.jpg';
              p.imageFit = 'cover';
              changed = true;
            }
            if (!p.imageFit) {
              p.imageFit = 'contain';
              changed = true;
            }
            if (p.sortOrder === undefined) {
              const def = DEFAULT_PRODUCTS.find(dp => dp.id === p.id);
              p.sortOrder = (def && typeof def.sortOrder === 'number') ? def.sortOrder : (index + 1);
              changed = true;
            }
            return p;
          });
          if (changed) {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
          }
        }
      } catch (e) {
        console.warn('Migration error in DataStore init:', e);
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(DEFAULT_LEADS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(DEFAULT_REVIEWS));
    }
  }

  /**
   * Helper to resolve local/relative image paths across both root and admin subfolders
   */
  resolveImageUrl(path) {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) {
      return path;
    }
    const isInAdmin = window.location.pathname.includes('/admin/');
    if (isInAdmin && path.startsWith('assets/')) {
      return '../' + path;
    }
    if (!isInAdmin && path.startsWith('../assets/')) {
      return path.replace('../', '');
    }
    return path;
  }

  // -------------------------------------------------------------------------
  // CLOUD SYNCHRONIZATION
  // -------------------------------------------------------------------------

  /**
   * Fetch live catalog and settings from Supabase Cloud
   * Dispatches 'vt:catalog-synced' and 'vt:settings-synced' when new cloud data arrives
   */
  async syncWithCloud() {
    if (!window.VTSupabase || !window.VTSupabase.isConfigured()) {
      return { success: false, reason: 'Supabase Cloud not configured' };
    }

    let catalogChanged = false;
    let settingsChanged = false;

    try {
      // 1. Fetch live products from Supabase
      const { products, error: pErr } = await window.VTSupabase.fetchProducts();
      if (!pErr && Array.isArray(products) && products.length > 0) {
        const cleanProds = products.filter(p => p.id !== '__catalog_order__' && p.id !== 'catalog_order');
        cleanProds.sort((a, b) => (a.sortOrder || 9999) - (b.sortOrder || 9999));
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(cleanProds));
        catalogChanged = true;
        window.dispatchEvent(new CustomEvent('vt:catalog-synced', { detail: { products: cleanProds } }));
      }

      // 2. Fetch live settings from Supabase
      const { settings, error: sErr } = await window.VTSupabase.fetchSettings();
      if (!sErr && settings) {
        const current = this.getSettings();
        const merged = { ...current, ...settings };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
        settingsChanged = true;
        window.dispatchEvent(new CustomEvent('vt:settings-synced', { detail: { settings: merged } }));
      }

      return { success: true, catalogChanged, settingsChanged };
    } catch (err) {
      console.warn('Sync with Supabase cloud failed:', err);
      return { success: false, error: err };
    }
  }

  /**
   * Push all current local products to Supabase Cloud Database in one click
   */
  async pushLocalToCloud() {
    if (!window.VTSupabase || !window.VTSupabase.isConfigured()) {
      throw new Error('Supabase Cloud is not configured. Please enter your Project URL and Anon Key in Settings.');
    }
    const products = this.getProducts();
    const { count, error } = await window.VTSupabase.bulkSyncProducts(products);
    if (error) throw error;
    return { success: true, count };
  }

  // -------------------------------------------------------------------------
  // PRODUCTS CRUD (LOCAL + CLOUD AUTO-SYNC)
  // -------------------------------------------------------------------------

  getProducts() {
    try {
      const prods = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || DEFAULT_PRODUCTS;
      return prods.slice().sort((a, b) => {
        const orderA = (typeof a.sortOrder === 'number') ? a.sortOrder : (typeof a.sort_order === 'number' ? a.sort_order : 9999);
        const orderB = (typeof b.sortOrder === 'number') ? b.sortOrder : (typeof b.sort_order === 'number' ? b.sort_order : 9999);
        return orderA - orderB;
      });
    } catch (e) {
      return DEFAULT_PRODUCTS;
    }
  }

  saveProduct(product) {
    const products = this.getProducts();
    if (product.id) {
      const idx = products.findIndex(p => p.id === product.id);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...product };
      } else {
        products.push(product);
      }
    } else {
      product.id = 'prod-' + Date.now();
      product.sortOrder = typeof product.sortOrder === 'number' ? product.sortOrder : (products.length + 1);
      products.push(product);
    }

    // Ensure sortOrder is set cleanly for all products
    products.forEach((p, i) => {
      if (typeof p.sortOrder !== 'number') p.sortOrder = i + 1;
    });

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Asynchronously push to Supabase Cloud
    if (window.VTSupabase && window.VTSupabase.isConfigured()) {
      window.VTSupabase.upsertProduct(product).catch(err => {
        console.warn('Background Supabase upsert error:', err);
      });
      window.VTSupabase.saveCatalogOrder(products.map(p => p.id)).catch(err => {
        console.warn('Background saveCatalogOrder error:', err);
      });
    }

    return product;
  }

  /**
   * Move a product up or down in sequence and auto-sync with Supabase
   * @param {string} productId
   * @param {'up'|'down'} direction
   * @returns {boolean}
   */
  moveProduct(productId, direction) {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === productId);
    if (idx === -1) return false;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= products.length) return false;

    // Swap positions
    const temp = products[idx];
    products[idx] = products[targetIdx];
    products[targetIdx] = temp;

    // Normalize sortOrder numbers (1, 2, 3...)
    products.forEach((p, i) => {
      p.sortOrder = i + 1;
    });

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('vt:catalog-synced', { detail: { products } }));

    // Asynchronously push all updated order indexes to Supabase
    if (window.VTSupabase && window.VTSupabase.isConfigured()) {
      window.VTSupabase.saveCatalogOrder(products.map(p => p.id)).catch(err => {
        console.warn('Background saveCatalogOrder error:', err);
      });
      window.VTSupabase.bulkSyncProducts(products).catch(err => {
        console.warn('Background sequence cloud sync error:', err);
      });
    }

    return true;
  }

  /**
   * Directly assign a product to a specific 1-based sequence position
   * @param {string} productId
   * @param {number} newPosition
   * @returns {boolean}
   */
  setProductOrder(productId, newPosition) {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === productId);
    if (idx === -1) return false;

    const item = products.splice(idx, 1)[0];
    const targetIdx = Math.max(0, Math.min(products.length, newPosition - 1));
    products.splice(targetIdx, 0, item);

    products.forEach((p, i) => {
      p.sortOrder = i + 1;
    });

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('vt:catalog-synced', { detail: { products } }));

    if (window.VTSupabase && window.VTSupabase.isConfigured()) {
      window.VTSupabase.saveCatalogOrder(products.map(p => p.id)).catch(err => {
        console.warn('Background saveCatalogOrder error:', err);
      });
      window.VTSupabase.bulkSyncProducts(products).catch(err => {
        console.warn('Background sequence cloud sync error:', err);
      });
    }

    return true;
  }

  /**
   * Reorder products using an array of ordered product IDs (for Drag & Drop)
   * @param {Array<string>} orderedIds
   * @returns {boolean}
   */
  reorderProducts(orderedIds) {
    const products = this.getProducts();
    const map = new Map(products.map(p => [p.id, p]));
    const reordered = [];

    orderedIds.forEach(id => {
      if (map.has(id)) {
        reordered.push(map.get(id));
        map.delete(id);
      }
    });

    // Append any remainder
    map.forEach(p => reordered.push(p));

    reordered.forEach((p, i) => {
      p.sortOrder = i + 1;
    });

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(reordered));
    window.dispatchEvent(new CustomEvent('vt:catalog-synced', { detail: { products: reordered } }));

    if (window.VTSupabase && window.VTSupabase.isConfigured()) {
      window.VTSupabase.saveCatalogOrder(reordered.map(p => p.id)).catch(err => {
        console.warn('Background saveCatalogOrder error:', err);
      });
      window.VTSupabase.bulkSyncProducts(reordered).catch(err => {
        console.warn('Background sequence cloud sync error:', err);
      });
    }

    return true;
  }

  deleteProduct(id) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    // Renumber remaining products
    products.forEach((p, i) => {
      p.sortOrder = i + 1;
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Asynchronously delete from Supabase Cloud
    if (window.VTSupabase && window.VTSupabase.isConfigured()) {
      window.VTSupabase.deleteProduct(id).catch(err => {
        console.warn('Background Supabase delete error:', err);
      });
      window.VTSupabase.saveCatalogOrder(products.map(p => p.id)).catch(err => {
        console.warn('Background saveCatalogOrder error:', err);
      });
    }

    return true;
  }

  resetProducts() {
    const fresh = DEFAULT_PRODUCTS.map((p, i) => ({ ...p, sortOrder: i + 1 }));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(fresh));
    window.dispatchEvent(new CustomEvent('vt:catalog-synced', { detail: { products: fresh } }));
    return fresh;
  }

  // -------------------------------------------------------------------------
  // SETTINGS (LOCAL + CLOUD AUTO-SYNC)
  // -------------------------------------------------------------------------

  getSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {};
      return { ...DEFAULT_SETTINGS, ...saved };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));

    // Asynchronously push to Supabase Cloud
    if (window.VTSupabase && window.VTSupabase.isConfigured()) {
      window.VTSupabase.saveSettings(updated).catch(err => {
        console.warn('Background Supabase settings save error:', err);
      });
    }

    return updated;
  }

  // -------------------------------------------------------------------------
  // LEADS
  // -------------------------------------------------------------------------

  getLeads() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS)) || DEFAULT_LEADS;
    } catch (e) {
      return DEFAULT_LEADS;
    }
  }

  addLead(leadData) {
    const leads = this.getLeads();
    const newLead = {
      id: 'lead-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      status: 'new',
      ...leadData
    };
    leads.unshift(newLead);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    return newLead;
  }

  updateLeadStatus(id, status) {
    const leads = this.getLeads();
    const lead = leads.find(l => l.id === id);
    if (lead) {
      lead.status = status;
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
      return true;
    }
    return false;
  }

  deleteLead(id) {
    let leads = this.getLeads();
    leads = leads.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    return true;
  }

  // -------------------------------------------------------------------------
  // REVIEWS
  // -------------------------------------------------------------------------

  getReviews() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS)) || DEFAULT_REVIEWS;
    } catch (e) {
      return DEFAULT_REVIEWS;
    }
  }

  addReview(review) {
    const reviews = this.getReviews();
    review.id = 'rev-' + Date.now();
    reviews.unshift(review);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    return review;
  }
}

// Instantiate global Store
window.VTStore = new DataStore();
