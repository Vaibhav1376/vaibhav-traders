/**
 * ==========================================================================
 * VAIBHAV TRADERS - PRODUCT CATALOG & FILTER ENGINE
 * Live search, category filtering, quote modal, WhatsApp lead router
 * ==========================================================================
 */

const VTProducts = {
  activeCategory: 'all',
  searchQuery: '',
  selectedProduct: null,

  init() {
    this.bindFilters();
    this.bindSearch();
    this.renderCatalog();
    this.bindQuoteModal();
  },

  // Material category SVG icons
  getIconSvg(type) {
    switch (type) {
      case 'cement':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`;
      case 'steel':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><path d="M4 12V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"/><line x1="8" y1="4" x2="8" y2="20"/><line x1="16" y1="4" x2="16" y2="20"/></svg>`;
      case 'sand':
      case 'aggregate':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 22h20L12 2Z"/><path d="M12 9v4"/><circle cx="12" cy="17" r="1"/></svg>`;
      case 'brick':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><path d="M2 12h20"/><path d="M7 6v6"/><path d="M17 6v6"/><path d="M12 12v6"/></svg>`;
      case 'plumbing':
      case 'hardware':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
      case 'paint':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`;
    }
  },

  // Bind Category Buttons
  bindFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.getAttribute('data-category') || 'all';
        this.renderCatalog();
      });
    });
  },

  // Bind Search Input
  bindSearch() {
    const searchInput = document.getElementById('catalogSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.renderCatalog();
    });
  },

  // Filter products by search and category
  getFilteredProducts() {
    if (!window.VTStore) return [];
    const all = window.VTStore.getProducts();

    return all.filter(p => {
      const matchCat = (this.activeCategory === 'all' || p.category === this.activeCategory);
      const matchSearch = !this.searchQuery || 
        p.name.toLowerCase().includes(this.searchQuery) ||
        p.description.toLowerCase().includes(this.searchQuery) ||
        p.unit.toLowerCase().includes(this.searchQuery);
      return matchCat && matchSearch;
    });
  },

  // Render product grid
  renderCatalog() {
    const container = document.getElementById('productsGrid');
    if (!container) return;

    const products = this.getFilteredProducts();

    if (products.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: #fff; border-radius: var(--radius-xl); border: 1px dashed var(--color-border);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
          <h3 style="margin-bottom: 0.5rem;">No Materials Found</h3>
          <p style="color: var(--color-text-muted);">Try searching for a different keyword or reset the category filter.</p>
          <button class="btn btn-outline" style="margin-top: 1rem;" onclick="document.getElementById('catalogSearchInput').value=''; VTProducts.searchQuery=''; VTProducts.activeCategory='all'; document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); document.querySelector('.filter-btn[data-category=\\'all\\']').classList.add('active'); VTProducts.renderCatalog();">Reset Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(product => {
      const isStock = product.stockStatus === 'in-stock';
      const statusBadge = isStock 
        ? `<span class="badge badge-success">● In Stock</span>` 
        : `<span class="badge badge-warning">● Inquire Stock</span>`;

      const isCover = (product.imageFit === 'cover');
      const fitClass = isCover ? 'img-cover' : '';
      const mediaStyle = isCover ? 'background: #0f172a; padding: 0;' : 'background: #f8fafc; padding: var(--space-3);';

      return `
        <div class="card product-card" data-product-id="${product.id}">
          <div class="product-card-media" style="${mediaStyle}">
            ${product.image ? `
              <img src="${product.image}" alt="${VTApp.escapeHtml(product.name)}" class="product-card-img ${fitClass}" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
            ` : ''}
            <div class="product-media-icon" style="${product.image ? 'display: none;' : 'display: flex;'}">
              ${this.getIconSvg(product.icon || product.category)}
            </div>
            <div class="product-card-badge">
              <span class="badge badge-wholesale">Wholesale + Retail</span>
            </div>
          </div>
          <div class="product-card-content">
            <span class="product-category-label">${product.category.replace('-', ' & ')}</span>
            <h3 class="product-title">${VTApp.escapeHtml(product.name)}</h3>
            <p class="product-desc">${VTApp.escapeHtml(product.description)}</p>
            
            <div class="product-meta-row">
              <div class="product-unit">
                <strong>Unit:</strong> ${VTApp.escapeHtml(product.unit)}
              </div>
              <div class="product-pricing">
                <div class="product-price-label">Wholesale Rate</div>
                <div class="product-price-value text-accent">${VTApp.escapeHtml(product.wholesalePrice)}</div>
              </div>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-top: auto;">
              ${statusBadge}
              <button class="btn btn-primary btn-sm btn-quote-action" data-id="${product.id}">
                Request Quote &rarr;
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach quote button listeners
    container.querySelectorAll('.btn-quote-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        this.openQuoteModal(id);
      });
    });
  },

  // Quote Request Modal Handling
  bindQuoteModal() {
    const modal = document.getElementById('quoteModal');
    const closeBtn = document.getElementById('closeQuoteModal');
    const form = document.getElementById('quoteForm');

    if (!modal) return;

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleQuoteSubmit(form);
      });
    }
  },

  openQuoteModal(productId) {
    const modal = document.getElementById('quoteModal');
    const products = window.VTStore.getProducts();
    const product = products.find(p => p.id === productId);

    if (!modal || !product) return;
    this.selectedProduct = product;

    const modalTitle = document.getElementById('quoteModalTitle');
    const materialField = document.getElementById('quoteMaterialInput');

    if (modalTitle) modalTitle.textContent = `Get Wholesale Quote: ${product.name}`;
    if (materialField) materialField.value = `${product.name} (${product.unit})`;

    const prodImg = document.getElementById('quoteModalProdImg');
    const prodName = document.getElementById('quoteModalProdName');
    const prodRate = document.getElementById('quoteModalProdRate');

    if (prodImg) {
      prodImg.src = product.image || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80';
      prodImg.alt = product.name;
    }
    if (prodName) prodName.textContent = product.name;
    if (prodRate) prodRate.textContent = `${product.unit} • Wholesale: ${product.wholesalePrice}`;

    modal.classList.add('active');
  },

  handleQuoteSubmit(form) {
    const name = form.customerName.value.trim();
    const phone = form.customerPhone.value.trim();
    const quantity = form.materialQuantity.value.trim();
    const location = form.deliveryLocation.value.trim();
    const notes = form.notes ? form.notes.value.trim() : '';

    if (!name || !phone) {
      VTApp.showToast('Please enter your Name and Phone number.', 'error');
      return;
    }

    const material = this.selectedProduct ? this.selectedProduct.name : form.quoteMaterialInput.value;

    // Save lead to VTStore
    window.VTStore.addLead({
      name,
      phone,
      material,
      quantity: quantity || 'Not specified',
      location: location || 'Thangaon / Sinnar Area',
      type: 'Product Quote Inquiry',
      notes
    });

    // Close Modal
    const modal = document.getElementById('quoteModal');
    if (modal) modal.classList.remove('active');
    form.reset();

    VTApp.showToast('Quote request received! Opening WhatsApp...', 'success');

    // Route to WhatsApp with pre-filled detail
    const settings = window.VTStore.getSettings();
    const waText = encodeURIComponent(
      `*New Quote Request - Vaibhav Traders*\n\n` +
      `👤 *Name:* ${name}\n` +
      `📞 *Phone:* ${phone}\n` +
      `📦 *Material:* ${material}\n` +
      `⚖️ *Quantity:* ${quantity || 'Discuss on call'}\n` +
      `📍 *Delivery Location:* ${location || 'Thangaon / Sinnar'}\n` +
      `💬 *Requirement Details:* ${notes || 'Immediate delivery inquiry'}`
    );

    setTimeout(() => {
      window.open(`https://wa.me/${settings.whatsappNumber}?text=${waText}`, '_blank');
    }, 600);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  VTProducts.init();
});
