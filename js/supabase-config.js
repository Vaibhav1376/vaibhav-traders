/**
 * ==========================================================================
 * VAIBHAV TRADERS - SUPABASE CLOUD INTEGRATION
 * Manages Supabase client initialization, Storage bucket uploads for product images
 * ==========================================================================
 */

const SUPABASE_CONFIG = {
  // Replace these with your Supabase Project details or configure them in Admin > Settings
  url: localStorage.getItem('vt_supabase_url') || 'https://your-project.supabase.co',
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

    if (window.supabase && url && key && !url.includes('your-project.supabase.co')) {
      try {
        this.client = window.supabase.createClient(url, key);
        console.log('✅ Supabase Client Initialized successfully');
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        this.client = null;
      }
    }
  }

  isConfigured() {
    const url = localStorage.getItem('vt_supabase_url');
    const key = localStorage.getItem('vt_supabase_anon_key');
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
      url: localStorage.getItem('vt_supabase_url') || '',
      anonKey: localStorage.getItem('vt_supabase_anon_key') || '',
      bucketName: localStorage.getItem('vt_supabase_bucket') || 'product-images'
    };
  }

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
      const bucket = localStorage.getItem('vt_supabase_bucket') || 'product-images';
      const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

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
   * Test connection to Supabase
   */
  async testConnection() {
    if (!this.client) return { success: false, message: 'Supabase client is not initialized.' };
    try {
      const bucket = localStorage.getItem('vt_supabase_bucket') || 'product-images';
      const { data, error } = await this.client.storage.getBucket(bucket);
      if (error && !error.message.includes('not found')) {
        return { success: true, message: `Connected to Supabase! Note: make sure bucket '${bucket}' exists and is set to Public.` };
      }
      return { success: true, message: `Connected to Supabase! Bucket '${bucket}' is active and ready.` };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }
}

window.VTSupabase = new SupabaseService();
