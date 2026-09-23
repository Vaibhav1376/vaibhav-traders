/**
 * ==========================================================================
 * VAIBHAV TRADERS - SUPABASE CLOUD DATABASE & STORAGE INTEGRATION
 * Real-time PostgreSQL catalog sync & permanent cloud image hosting
 * ==========================================================================
 */

const SUPABASE_CONFIG = {
  // Configured Project Credentials (can also be configured in Admin > Settings)
  url: localStorage.getItem('vt_supabase_url') || '',
  anonKey: localStorage.getItem('vt_supabase_anon_key') || '',
  bucketName: localStorage.getItem('vt_supabase_bucket') || 'product-images'
};

class SupabaseService {
  constructor() {
    this.client = null;
    this.init();
  }

  init() {
    const url = localStorage.getItem('vt_supabase_url') || SUPABASE_CONFIG.url;
    const key = localStorage.getItem('vt_supabase_anon_key') || SUPABASE_CONFIG.anonKey;

    if (window.supabase && url && key && !url.includes('your-project.supabase.co') && url.startsWith('http')) {
      try {
        this.client = window.supabase.createClient(url.trim(), key.trim());
        console.log('✅ Supabase Cloud Client Initialized successfully');
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  isConfigured() {
    const url = localStorage.getItem('vt_supabase_url') || SUPABASE_CONFIG.url;
    const key = localStorage.getItem('vt_supabase_anon_key') || SUPABASE_CONFIG.anonKey;
    return !!(this.client && url && key && !url.includes('your-project.supabase.co'));
  }

  saveConfig(url, key, bucket) {
    if (url) localStorage.setItem('vt_supabase_url', url.trim());
    if (key) localStorage.setItem('vt_supabase_anon_key', key.trim());
    if (bucket) localStorage.setItem('vt_supabase_bucket', bucket.trim());
    this.init();
    return this.isConfigured();
  }

  getConfig() {
    return {
      url: localStorage.getItem('vt_supabase_url') || SUPABASE_CONFIG.url || '',
      anonKey: localStorage.getItem('vt_supabase_anon_key') || SUPABASE_CONFIG.anonKey || '',
      bucketName: localStorage.getItem('vt_supabase_bucket') || SUPABASE_CONFIG.bucketName || 'product-images'
    };
  }

  // -------------------------------------------------------------------------
  // DATABASE OPERATIONS (PRODUCTS TABLE)
  // -------------------------------------------------------------------------

  /**
   * Fetch live product catalog from Supabase Database
   * @returns {Promise<{products: Array|null, error: any}>}
   */
  async fetchProducts() {
    if (!this.client) return { products: null, error: new Error('Supabase not configured') };

    try {
      const { data, error } = await this.client
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Map snake_case database columns to camelCase JavaScript model
      const mapped = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        unit: row.unit,
        wholesalePrice: row.wholesale_price || row.wholesalePrice || 'Market Rate',
        retailPrice: row.retail_price || row.retailPrice || '',
        stockStatus: row.stock_status || row.stockStatus || 'in-stock',
        featured: !!row.featured,
        description: row.description || '',
        icon: row.icon || (row.category ? row.category.split('-')[0] : 'box'),
        image: row.image || '',
        imageFit: row.image_fit || row.imageFit || 'contain'
      }));

      return { products: mapped, error: null };
    } catch (err) {
      console.warn('Supabase fetchProducts warning:', err);
      return { products: null, error: err };
    }
  }

  /**
   * Upsert a product into the Supabase 'products' table
   * @param {Object} product
   * @returns {Promise<{data: any, error: any}>}
   */
  /**
   * Helper to perform upsert with auto-column stripping if schema doesn't have a column
   */
  async _resilientUpsert(tableName, rows, onConflict = 'id', maxRetries = 6) {
    let currentRows = Array.isArray(rows) ? rows.map(r => ({ ...r })) : [{ ...rows }];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const { data, error } = await this.client
        .from(tableName)
        .upsert(currentRows, { onConflict });

      if (!error) {
        return { data, error: null };
      }

      // Check if error is about a missing column in schema cache
      const match = error.message && error.message.match(/Could not find the '([^']+)' column/i);
      if (match && match[1]) {
        const missingCol = match[1];
        console.warn(`Supabase schema note: '${missingCol}' column missing in '${tableName}', auto-adapting payload...`);
        currentRows = currentRows.map(r => {
          const copy = { ...r };
          delete copy[missingCol];
          return copy;
        });
      } else {
        // Different error (e.g. RLS policy, network, etc.)
        return { data: null, error };
      }
    }
    return { data: null, error: new Error('Failed to adapt payload to table schema.') };
  }

  /**
   * Upsert a product into the Supabase 'products' table
   * @param {Object} product
   * @returns {Promise<{data: any, error: any}>}
   */
  async upsertProduct(product) {
    if (!this.client) return { data: null, error: new Error('Supabase not configured') };

    try {
      const row = {
        id: product.id,
        name: product.name,
        category: product.category,
        unit: product.unit,
        wholesale_price: product.wholesalePrice,
        retail_price: product.retailPrice || '',
        stock_status: product.stockStatus || 'in-stock',
        featured: !!product.featured,
        description: product.description || '',
        icon: product.icon || (product.category ? product.category.split('-')[0] : 'box'),
        image: product.image || '',
        image_fit: product.imageFit || 'contain'
      };

      return await this._resilientUpsert('products', row, 'id');
    } catch (err) {
      console.error('Supabase upsertProduct error:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Delete a product from Supabase 'products' table
   * @param {string} id
   * @returns {Promise<{error: any}>}
   */
  async deleteProduct(id) {
    if (!this.client) return { error: new Error('Supabase not configured') };

    try {
      const { error } = await this.client
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Supabase deleteProduct error:', err);
      return { error: err };
    }
  }

  /**
   * Bulk push an array of products to Supabase (Initial seed or full sync)
   * @param {Array} products
   * @returns {Promise<{count: number, error: any}>}
   */
  async bulkSyncProducts(products) {
    if (!this.client) return { count: 0, error: new Error('Supabase not configured') };

    try {
      const rows = products.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        unit: product.unit,
        wholesale_price: product.wholesalePrice,
        retail_price: product.retailPrice || '',
        stock_status: product.stockStatus || 'in-stock',
        featured: !!product.featured,
        description: product.description || '',
        icon: product.icon || (product.category ? product.category.split('-')[0] : 'box'),
        image: product.image || '',
        image_fit: product.imageFit || 'contain'
      }));

      const { data, error } = await this._resilientUpsert('products', rows, 'id');
      if (error) throw error;
      return { count: rows.length, error: null };
    } catch (err) {
      console.error('Supabase bulkSyncProducts error:', err);
      return { count: 0, error: err };
    }
  }

  // -------------------------------------------------------------------------
  // SETTINGS SYNC (SITE_SETTINGS TABLE)
  // -------------------------------------------------------------------------

  /**
   * Fetch site settings from Supabase
   */
  async fetchSettings() {
    if (!this.client) return { settings: null, error: new Error('Supabase not configured') };
    try {
      const { data, error } = await this.client
        .from('site_settings')
        .select('*')
        .eq('id', 'current')
        .maybeSingle();

      if (error) throw error;
      if (!data) return { settings: null, error: null };

      return {
        settings: {
          announcementText: data.announcement_text,
          announcementActive: data.announcement_active,
          phone: data.phone,
          address: data.address,
          googleRating: data.google_rating,
          gstNumber: data.gst_number
        },
        error: null
      };
    } catch (err) {
      return { settings: null, error: err };
    }
  }

  /**
   * Save site settings to Supabase
   */
  async saveSettings(settings) {
    if (!this.client) return { error: new Error('Supabase not configured') };
    try {
      const row = {
        id: 'current',
        announcement_text: settings.announcementText,
        announcement_active: settings.announcementActive,
        phone: settings.phone,
        address: settings.address,
        google_rating: settings.googleRating,
        gst_number: settings.gstNumber
      };
      const { error } = await this._resilientUpsert('site_settings', row, 'id');
      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }

  // -------------------------------------------------------------------------
  // STORAGE OPERATIONS (PRODUCT-IMAGES BUCKET)
  // -------------------------------------------------------------------------

  /**
   * Upload an image file directly to Supabase Storage bucket
   * @param {File} file - Image file from file input
   * @param {string} folder - Optional subfolder
   * @returns {Promise<{publicUrl: string, error: any}>}
   */
  async uploadProductImage(file, folder = 'materials') {
    if (!this.client) {
      return { 
        publicUrl: null, 
        error: new Error('Supabase is not configured yet. Please provide your Project URL and Anon Key in Settings.') 
      };
    }

    try {
      const bucket = localStorage.getItem('vt_supabase_bucket') || SUPABASE_CONFIG.bucketName || 'product-images';
      const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
      const cleanFileName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image';
      const fileName = `${folder}/${Date.now()}-${cleanFileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '31536000',
          upsert: true
        });

      if (error) throw error;

      // Get permanent public URL
      const { data: publicData } = this.client.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return { publicUrl: publicData.publicUrl, error: null };
    } catch (err) {
      console.error('Supabase upload error:', err);
      return { publicUrl: null, error: err };
    }
  }

  /**
   * Comprehensive connection test: tests both Database table and Storage bucket
   */
  async testConnection() {
    if (!this.client) {
      return { 
        success: false, 
        database: false,
        storage: false,
        message: 'Supabase client is not initialized. Please check URL and Key.' 
      };
    }

    let dbOk = false;
    let storageOk = false;
    let details = [];

    // Test Database 'products' table
    try {
      const { data, error } = await this.client.from('products').select('id').limit(1);
      if (error) {
        details.push(`Database Table Note: ${error.message} (Run the SQL setup script in Supabase SQL editor)`);
      } else {
        dbOk = true;
        details.push(`✅ Database 'products' table is active and reachable!`);
      }
    } catch (e) {
      details.push(`Database error: ${e.message}`);
    }

    // Test Storage Bucket
    try {
      const bucket = localStorage.getItem('vt_supabase_bucket') || 'product-images';
      const { data, error } = await this.client.storage.getBucket(bucket);
      if (error) {
        details.push(`Storage Bucket Note: ${error.message} (Make sure '${bucket}' exists in Supabase Storage and is set to Public)`);
      } else {
        storageOk = true;
        details.push(`✅ Storage bucket '${bucket}' is active and ready!`);
      }
    } catch (e) {
      details.push(`Storage error: ${e.message}`);
    }

    return {
      success: dbOk || storageOk,
      database: dbOk,
      storage: storageOk,
      message: details.join('\n')
    };
  }
}

window.VTSupabase = new SupabaseService();
