/**
 * ==========================================================================
 * VAIBHAV TRADERS - UNIFIED DATA & STATE STORE
 * Manages local storage persistence, state synchronization, seed catalog
 * ==========================================================================
 */

const STORAGE_KEYS = {
  PRODUCTS: 'vt_products_data',
  SETTINGS: 'vt_settings_data',
  LEADS: 'vt_leads_data',
  REVIEWS: 'vt_reviews_data',
  ADMIN_AUTH: 'vt_admin_session'
};

// Initial Seed Products Catalog
const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'UltraTech Cement (Super / Weather Plus)',
    category: 'cement',
    unit: 'Per Bag (50 Kg)',
    wholesalePrice: 'Call for Bulk Rate',
    retailPrice: '₹370 - ₹395',
    stockStatus: 'in-stock', // in-stock, low-stock, out-of-stock
    featured: true,
    description: 'India’s No. 1 cement. Engineered for high early strength, crack prevention, and dampness resistance in RCC structures.',
    icon: 'cement',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-2',
    name: 'ACC Gold Water Shield Cement',
    category: 'cement',
    unit: 'Per Bag (50 Kg)',
    wholesalePrice: 'Direct Tipper Discount',
    retailPrice: '₹380 - ₹405',
    stockStatus: 'in-stock',
    featured: true,
    description: 'Water-repellent premium composition that protects slabs and columns from rainwater seepage and efflorescence.',
    icon: 'cement',
    image: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-3',
    name: 'Fe 550D TMT Rebar (Tata / Jindal / Polad)',
    category: 'steel',
    unit: 'Per Ton / Per Kg (8mm - 32mm)',
    wholesalePrice: 'Live Mill Rate Discount',
    retailPrice: '₹58 - ₹68 / kg',
    stockStatus: 'in-stock',
    featured: true,
    description: 'High ductile earthquake-resistant TMT steel with superior elongation and corrosion resistance for strong foundations.',
    icon: 'steel',
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-4',
    name: 'Washed River Sand & M-Sand (Plaster / Concrete)',
    category: 'sand-aggregate',
    unit: 'Per Brass / Truck Tipper Load',
    wholesalePrice: 'Wholesale Tipper Rate',
    retailPrice: 'Market Competitive',
    stockStatus: 'in-stock',
    featured: true,
    description: 'Double washed, silt-free river sand and precision-screened manufactured sand for optimal mortar and concrete bonding.',
    icon: 'sand',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-5',
    name: 'Black Basalt Crushed Aggregates (10mm, 20mm, 40mm Khadi)',
    category: 'sand-aggregate',
    unit: 'Per Brass / Dumper Load',
    wholesalePrice: 'Quarry Direct Rate',
    retailPrice: 'Market Competitive',
    stockStatus: 'in-stock',
    featured: false,
    description: 'Angular machine-crushed hard rock blue/black basalt aggregates conforming to IS 383 standards for RCC casting.',
    icon: 'aggregate',
    image: 'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-6',
    name: 'First Class Kiln Burned Red Clay Bricks',
    category: 'bricks-blocks',
    unit: 'Per 1,000 Bricks / Tractor Load',
    wholesalePrice: 'Volume Discount',
    retailPrice: 'Best Market Price',
    stockStatus: 'in-stock',
    featured: true,
    description: 'High compressive strength, sharp edges, metallic ring tone on impact. Zero cracks, uniform burnt red finish.',
    icon: 'brick',
    image: 'https://images.unsplash.com/photo-1584463699039-4aa8366ce270?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-7',
    name: 'AAC Lightweight Autoclaved Aerated Concrete Blocks',
    category: 'bricks-blocks',
    unit: 'Per Piece / Per Cubic Meter',
    wholesalePrice: 'Pallet Wholesale Price',
    retailPrice: '₹55 - ₹75 / block',
    stockStatus: 'in-stock',
    featured: false,
    description: 'Thermal insulating lightweight blocks that reduce building dead-load and speed up construction with less joint mortar.',
    icon: 'brick',
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-8',
    name: 'Supreme / Astral Heavy Duty PVC & CPVC Pipes',
    category: 'plumbing-hardware',
    unit: 'Per Length / Bundle',
    wholesalePrice: 'Contractor Wholesale',
    retailPrice: 'Standard Retail',
    stockStatus: 'in-stock',
    featured: false,
    description: 'Complete plumbing, drainage, agriculture, and casing pipe solutions with high pressure ratings and leak-proof joints.',
    icon: 'plumbing',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-9',
    name: 'Dr. Fixit Waterproofing & Asian Paints Dampproof',
    category: 'finishing-paints',
    unit: '1L, 5L, 20L Cans',
    wholesalePrice: 'Contractor Pack Rate',
    retailPrice: 'MRP Discounted',
    stockStatus: 'in-stock',
    featured: false,
    description: 'Elastomeric waterproofing membranes, integral liquid waterproofing compounds, and exterior weather-guard coatings.',
    icon: 'paint',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-10',
    name: 'Binding Wire, Shuttering Nails & Construction Hardware',
    category: 'plumbing-hardware',
    unit: 'Per Bundle / Kg',
    wholesalePrice: 'Bundle Wholesale',
    retailPrice: 'Retail per Kg',
    stockStatus: 'in-stock',
    featured: false,
    description: 'Annealed GI binding wire, hardened wire nails, scaffolding ties, and essential construction site hardware.',
    icon: 'hardware',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
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
      // Auto-migrate products in localStorage if image attribute is missing
      try {
        let prods = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
        let changed = false;
        if (Array.isArray(prods)) {
          prods = prods.map(p => {
            if (!p.image) {
              const def = DEFAULT_PRODUCTS.find(dp => dp.id === p.id);
              if (def && def.image) {
                p.image = def.image;
                changed = true;
              } else {
                p.image = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80';
                changed = true;
              }
            }
            return p;
          });
          if (changed) {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
          }
        }
      } catch (e) {}
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

  // Products
  getProducts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || DEFAULT_PRODUCTS;
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
      products.unshift(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return product;
  }

  deleteProduct(id) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return true;
  }

  resetProducts() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }

  // Settings
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
    return updated;
  }

  // Leads
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

  // Reviews
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

  // Backup & Restore
  exportAllData() {
    const data = {
      exportDate: new Date().toISOString(),
      products: this.getProducts(),
      settings: this.getSettings(),
      leads: this.getLeads(),
      reviews: this.getReviews()
    };
    return JSON.stringify(data, null, 2);
  }

  importAllData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.products) localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.leads) localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(data.leads));
      if (data.reviews) localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(data.reviews));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

// Global Export
window.VTStore = new DataStore();
