/**
 * ==========================================================================
 * VAIBHAV TRADERS - ADMIN PANEL ENGINE
 * Security PIN check, KPI metrics, Product CRUD, Leads Pipeline, CMS Settings
 * ==========================================================================
 */

const VTAdmin = {
  activeSession: false,

  init() {
    this.checkAuth();
  },

  // Authentication check
  checkAuth() {
    const session = sessionStorage.getItem('vt_admin_logged');
    if (session === 'true') {
      this.activeSession = true;
      this.setupAdmin();
    } else {
      this.showLockScreen();
    }
  },

  showLockScreen() {
    let lockScreen = document.getElementById('adminLockScreen');
    if (!lockScreen) {
      lockScreen = document.createElement('div');
      lockScreen.id = 'adminLockScreen';
      lockScreen.className = 'admin-lock-screen';
      lockScreen.innerHTML = `
        <div class="lock-card">
          <div class="lock-icon-box">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--color-primary);">Vaibhav Traders Admin</h2>
          <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 1.5rem;">Enter master PIN to manage products, customer leads, and website settings.</p>
          <form id="adminLockForm">
            <div class="form-group">
              <input type="password" id="adminPinInput" class="form-control text-center" placeholder="Enter PIN (Default: vaibhav2026)" required autofocus style="font-size: 1.25rem; letter-spacing: 0.2em;">
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top: 1rem;">Unlock Dashboard &rarr;</button>
          </form>
          <div style="margin-top: 1rem;">
            <a href="../index.html" style="font-size: 0.8rem; color: var(--color-text-muted);">&larr; Back to Public Website</a>
          </div>
        </div>
      `;
      document.body.appendChild(lockScreen);
    }

    const form = document.getElementById('adminLockForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputPin = document.getElementById('adminPinInput').value.trim();
      const settings = window.VTStore.getSettings();
      const correctPin = settings.adminPin || 'vaibhav2026';

      if (inputPin === correctPin) {
        sessionStorage.setItem('vt_admin_logged', 'true');
        this.activeSession = true;
        lockScreen.remove();
        VTApp.showToast('Welcome back, Admin!', 'success');
        this.setupAdmin();
      } else {
        VTApp.showToast('Invalid PIN. Please try again.', 'error');
        document.getElementById('adminPinInput').value = '';
      }
    });
  },

  logout() {
    sessionStorage.removeItem('vt_admin_logged');
    VTApp.showToast('Logged out successfully.', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 400);
  },

  setupAdmin() {
    this.bindLogout();
    this.updateStats();
    this.initDashboardPage();
    this.initProductsPage();
    this.initLeadsPage();
    this.initSettingsPage();
  },

  bindLogout() {
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  },

  // KPI Overview Calculations
  updateStats() {
    if (!window.VTStore) return;
    const products = window.VTStore.getProducts();
    const leads = window.VTStore.getLeads();

    const inStockCount = products.filter(p => p.stockStatus === 'in-stock').length;
    const newLeadsCount = leads.filter(l => l.status === 'new').length;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('statTotalProducts', products.length);
    setVal('statInStock', inStockCount);
    setVal('statTotalLeads', leads.length);
    setVal('statNewLeads', newLeadsCount);
  },

  /* --------------------------------------------------------------------------
     1. DASHBOARD PAGE LOGIC
     -------------------------------------------------------------------------- */
  initDashboardPage() {
    const recentTable = document.getElementById('recentLeadsTable');
    if (!recentTable || !window.VTStore) return;

    const leads = window.VTStore.getLeads().slice(0, 5); // top 5
    if (leads.length === 0) {
      recentTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding: 2rem;">No customer quote requests yet.</td></tr>`;
      return;
    }

    recentTable.innerHTML = leads.map(l => {
      let badgeClass = 'badge-warning';
      if (l.status === 'contacted') badgeClass = 'badge-wholesale';
      if (l.status === 'completed') badgeClass = 'badge-success';

      return `
        <tr>
          <td><strong>${VTApp.escapeHtml(l.name)}</strong><br><small class="text-muted">${VTApp.escapeHtml(l.phone)}</small></td>
          <td>${VTApp.escapeHtml(l.material)}</td>
          <td>${VTApp.escapeHtml(l.location)}</td>
          <td><span class="badge ${badgeClass}">${l.status.toUpperCase()}</span></td>
          <td>
            <a href="leads.html" class="btn btn-outline btn-sm">Manage &rarr;</a>
          </td>
        </tr>
      `;
    }).join('');
  },

  /* --------------------------------------------------------------------------
     2. PRODUCTS MANAGEMENT PAGE LOGIC
     -------------------------------------------------------------------------- */
  initProductsPage() {
    const table = document.getElementById('adminProductsTable');
    if (!table || !window.VTStore) return;

    this.updateCloudStatusBadge();
    this.renderProductsTable();
    this.bindProductModalActions();
    this.bindCloudSyncActions();

    // Auto-refresh when cloud sync finishes
    window.addEventListener('vt:catalog-synced', () => {
      this.renderProductsTable();
      this.updateCloudStatusBadge();
    });

    if (window.VTStore && typeof window.VTStore.syncWithCloud === 'function') {
      window.VTStore.syncWithCloud();
    }
  },

  updateCloudStatusBadge() {
    const badge = document.getElementById('cloudStatusBadge');
    if (!badge) return;
    if (window.VTSupabase && window.VTSupabase.isConfigured()) {
      badge.className = 'badge badge-success';
      badge.textContent = '● Cloud Live (Syncs to all visitors)';
      badge.style.background = '#dcfce7';
      badge.style.color = '#15803d';
    } else {
      badge.className = 'badge badge-warning';
      badge.textContent = '🟡 Local Mode (Setup Cloud in Settings)';
      badge.style.background = '#fef9c3';
      badge.style.color = '#854d0e';
    }
  },

  bindCloudSyncActions() {
    const btnPush = document.getElementById('btnPushToCloud');
    if (btnPush) {
      btnPush.addEventListener('click', async () => {
        if (!window.VTSupabase || !window.VTSupabase.isConfigured()) {
          VTApp.showToast('Please configure Supabase Project URL & Anon Key in Website Settings first.', 'warning');
          return;
        }
        btnPush.disabled = true;
        btnPush.textContent = '⏳ Syncing...';
        VTApp.showToast('☁️ Pushing all materials to Supabase Cloud...', 'info');
        try {
          const res = await window.VTStore.pushLocalToCloud();
          VTApp.showToast(`✅ Synced ${res.count} products to cloud! Visible to all visitors.`, 'success');
          this.renderProductsTable();
          this.updateCloudStatusBadge();
        } catch (err) {
          VTApp.showToast(`Sync failed: ${err.message}. Please check your Supabase tables.`, 'error');
        } finally {
          btnPush.disabled = false;
          btnPush.textContent = '☁️ Sync All to Cloud';
        }
      });
    }
  },

  renderProductsTable() {
    const table = document.getElementById('adminProductsTable');
    if (!table) return;

    this.updateCloudStatusBadge();
    const products = window.VTStore.getProducts();

    if (products.length === 0) {
      table.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 2rem;">No products found. Click "Add Material" or reset defaults.</td></tr>`;
      return;
    }

    table.innerHTML = products.map((p, index) => {
      const isStock = p.stockStatus === 'in-stock';
      const stockBadge = isStock 
        ? `<button class="badge badge-success btn-toggle-stock" data-id="${p.id}" title="Click to toggle">In Stock</button>` 
        : `<button class="badge badge-warning btn-toggle-stock" data-id="${p.id}" title="Click to toggle">Inquire</button>`;

      const defaultImg = '../assets/images/ultratech-cement.jpg';
      const imgSrc = window.VTStore ? window.VTStore.resolveImageUrl(p.image) : (p.image || defaultImg);

      return `
        <tr class="admin-product-row" draggable="true" data-id="${p.id}" data-index="${index}">
          <td style="text-align: center; vertical-align: middle;">
            <div class="order-control-wrap">
              <span class="order-drag-handle" title="Drag to reorder">⠿</span>
              <span class="order-badge">#${index + 1}</span>
              <div class="order-btn-group">
                <button type="button" class="btn-order-move btn-move-up" data-id="${p.id}" data-dir="up" title="Move Up (▲)" ${index === 0 ? 'disabled' : ''}>▲</button>
                <button type="button" class="btn-order-move btn-move-down" data-id="${p.id}" data-dir="down" title="Move Down (▼)" ${index === products.length - 1 ? 'disabled' : ''}>▼</button>
              </div>
            </div>
          </td>
          <td>
            <div class="admin-prod-thumb-wrapper">
              <img src="${imgSrc}" class="admin-prod-thumb" alt="${VTApp.escapeHtml(p.name)}" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
              <div class="admin-prod-thumb-fallback" style="${p.image ? 'display: none;' : 'display: flex;'}">
                📦
              </div>
            </div>
          </td>
          <td>
            <strong>${VTApp.escapeHtml(p.name)}</strong>
            <br><small class="text-muted">${p.category.toUpperCase()}</small>
          </td>
          <td>${VTApp.escapeHtml(p.unit)}</td>
          <td><span class="text-accent font-bold">${VTApp.escapeHtml(p.wholesalePrice)}</span></td>
          <td>${stockBadge}</td>
          <td>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-outline btn-sm btn-edit-product" data-id="${p.id}">Edit</button>
              <button class="btn btn-outline btn-sm btn-del-product" data-id="${p.id}" style="color: var(--color-danger); border-color: var(--color-border);">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Move Up / Move Down buttons
    table.querySelectorAll('.btn-order-move').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const dir = btn.getAttribute('data-dir');
        const prod = products.find(x => x.id === id);
        const name = prod ? prod.name : 'Material';

        const moved = window.VTStore.moveProduct(id, dir);
        if (moved) {
          VTApp.showToast(`Sequence changed: "${name}" moved ${dir === 'up' ? 'up ▲' : 'down ▼'}. Synced to live website!`, 'info');
          this.renderProductsTable();
        }
      });
    });

    // Drag-and-drop row reordering
    let draggedRow = null;
    const rows = table.querySelectorAll('.admin-product-row');
    rows.forEach(row => {
      row.addEventListener('dragstart', (e) => {
        draggedRow = row;
        row.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', row.getAttribute('data-id'));
      });

      row.addEventListener('dragend', () => {
        if (draggedRow) draggedRow.classList.remove('is-dragging');
        rows.forEach(r => r.classList.remove('drag-over-top', 'drag-over-bottom'));
        draggedRow = null;
      });

      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!draggedRow || draggedRow === row) return;

        const rect = row.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          row.classList.add('drag-over-top');
          row.classList.remove('drag-over-bottom');
        } else {
          row.classList.add('drag-over-bottom');
          row.classList.remove('drag-over-top');
        }
      });

      row.addEventListener('dragleave', () => {
        row.classList.remove('drag-over-top', 'drag-over-bottom');
      });

      row.addEventListener('drop', (e) => {
        e.preventDefault();
        row.classList.remove('drag-over-top', 'drag-over-bottom');
        if (!draggedRow || draggedRow === row) return;

        const srcId = draggedRow.getAttribute('data-id');
        const targetId = row.getAttribute('data-id');
        const rect = row.getBoundingClientRect();
        const dropBefore = e.clientY < (rect.top + rect.height / 2);

        const currentProducts = window.VTStore.getProducts();
        const orderedIds = currentProducts.map(p => p.id).filter(id => id !== srcId);
        const targetIdx = orderedIds.indexOf(targetId);

        if (dropBefore) {
          orderedIds.splice(targetIdx, 0, srcId);
        } else {
          orderedIds.splice(targetIdx + 1, 0, srcId);
        }

        window.VTStore.reorderProducts(orderedIds);
        VTApp.showToast('✅ Product sequence updated & synced to live website!', 'success');
        this.renderProductsTable();
      });
    });

    // Toggle stock listeners
    table.querySelectorAll('.btn-toggle-stock').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const prod = products.find(x => x.id === id);
        if (prod) {
          prod.stockStatus = (prod.stockStatus === 'in-stock') ? 'low-stock' : 'in-stock';
          window.VTStore.saveProduct(prod);
          VTApp.showToast(`Stock updated for ${prod.name}`, 'info');
          this.renderProductsTable();
          this.updateStats();
        }
      });
    });

    // Edit listeners
    table.querySelectorAll('.btn-edit-product').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openEditProductModal(id);
      });
    });

    // Delete listeners
    table.querySelectorAll('.btn-del-product').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this material from the website catalog?')) {
          window.VTStore.deleteProduct(id);
          VTApp.showToast('Product deleted from catalog.', 'info');
          this.renderProductsTable();
          this.updateStats();
        }
      });
    });
  },

  bindProductModalActions() {
    const modal = document.getElementById('productFormModal');
    const addBtn = document.getElementById('btnAddNewProduct');
    const closeBtn = document.getElementById('closeProductModal');
    const form = document.getElementById('adminProductForm');
    const resetBtn = document.getElementById('btnResetDefaultProducts');

    const imgUrlInput = document.getElementById('productImageUrl');
    const imgFileInput = document.getElementById('productImageFileInput');
    const imgPreview = document.getElementById('productImagePreview');
    const imgIcon = document.getElementById('productImagePlaceholderIcon');
    const clearImgBtn = document.getElementById('btnClearProductImage');
    const fitSelect = document.getElementById('productImageFitSelect');

    // Live Preview elements
    const prevImg = document.getElementById('previewCardImg');
    const prevIcon = document.getElementById('previewCardIcon');
    const prevMedia = document.getElementById('previewCardMedia');
    const prevTitle = document.getElementById('previewCardTitle');
    const prevCat = document.getElementById('previewCardCategory');
    const prevDesc = document.getElementById('previewCardDesc');
    const prevUnit = document.getElementById('previewCardUnit');
    const prevPrice = document.getElementById('previewCardPrice');
    const prevStock = document.getElementById('previewCardStockBadge');

    const updateLivePreview = () => {
      const name = (document.getElementById('productNameInput') ? document.getElementById('productNameInput').value.trim() : '') || 'UltraTech Cement 53 Grade';
      const cat = (document.getElementById('productCategorySelect') ? document.getElementById('productCategorySelect').value : 'cement') || 'cement';
      const unit = (document.getElementById('productUnitInput') ? document.getElementById('productUnitInput').value.trim() : '') || 'Per Bag (50 Kg)';
      const price = (document.getElementById('productWholesaleInput') ? document.getElementById('productWholesaleInput').value.trim() : '') || '₹370 - ₹395';
      const stock = (document.getElementById('productStockSelect') ? document.getElementById('productStockSelect').value : 'in-stock');
      const desc = (document.getElementById('productDescInput') ? document.getElementById('productDescInput').value.trim() : '') || 'High early strength, crack prevention, and dampness resistance.';
      const fit = (fitSelect ? fitSelect.value : 'contain');
      const imgUrl = (imgUrlInput ? imgUrlInput.value.trim() : '');

      if (prevTitle) prevTitle.textContent = name;
      if (prevCat) prevCat.textContent = cat.replace('-', ' & ').toUpperCase();
      if (prevUnit) prevUnit.textContent = unit;
      if (prevPrice) prevPrice.textContent = price;
      if (prevDesc) prevDesc.textContent = desc;

      if (prevStock) {
        if (stock === 'in-stock') {
          prevStock.className = 'badge badge-success';
          prevStock.textContent = '● In Stock';
        } else {
          prevStock.className = 'badge badge-warning';
          prevStock.textContent = '● Inquire Stock';
        }
      }

      if (imgUrl) {
        if (prevImg) {
          prevImg.src = imgUrl;
          prevImg.style.display = 'block';
          prevImg.style.objectFit = fit;
        }
        if (prevIcon) prevIcon.style.display = 'none';
        if (prevMedia) {
          prevMedia.style.background = (fit === 'cover' ? '#0f172a' : '#f8fafc');
          prevMedia.style.padding = (fit === 'cover' ? '0' : '1rem');
        }
      } else {
        if (prevImg) {
          prevImg.src = '';
          prevImg.style.display = 'none';
        }
        if (prevIcon) {
          prevIcon.style.display = 'flex';
          prevIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`;
        }
        if (prevMedia) {
          prevMedia.style.background = '#f8fafc';
          prevMedia.style.padding = '1rem';
        }
      }
    };

    const updateThumbPreview = (url) => {
      if (url && url.trim()) {
        if (imgPreview) {
          imgPreview.src = url.trim();
          imgPreview.style.display = 'block';
        }
        if (imgIcon) imgIcon.style.display = 'none';
        if (clearImgBtn) clearImgBtn.style.display = 'inline-block';
      } else {
        if (imgPreview) {
          imgPreview.src = '';
          imgPreview.style.display = 'none';
        }
        if (imgIcon) imgIcon.style.display = 'block';
        if (clearImgBtn) clearImgBtn.style.display = 'none';
      }
      updateLivePreview();
    };

    if (imgUrlInput) {
      imgUrlInput.addEventListener('input', (e) => updateThumbPreview(e.target.value));
    }

    // Attach live preview updates to all form inputs
    const formInputIds = ['productNameInput', 'productCategorySelect', 'productUnitInput', 'productWholesaleInput', 'productStockSelect', 'productDescInput', 'productImageFitSelect'];
    formInputIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updateLivePreview);
        el.addEventListener('change', updateLivePreview);
      }
    });

    if (imgFileInput) {
      imgFileInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        // Check if Supabase Cloud Storage is configured
        if (window.VTSupabase && window.VTSupabase.isConfigured()) {
          VTApp.showToast('Uploading photo to Supabase Cloud Storage...', 'info');
          const { publicUrl, error } = await window.VTSupabase.uploadProductImage(file);
          if (publicUrl) {
            if (imgUrlInput) imgUrlInput.value = publicUrl;
            updateThumbPreview(publicUrl);
            VTApp.showToast('Photo uploaded to Supabase Storage successfully!', 'success');
            return;
          } else {
            console.warn('Supabase upload issue:', error);
            VTApp.showToast(`Supabase upload note: ${error.message || 'Check storage bucket'}. Using local preview.`, 'warning');
          }
        }

        // Local fallback (Base64 Data URL)
        if (file.size > 2 * 1024 * 1024) {
          VTApp.showToast('Image size is over 2MB. Consider compressing or configuring Supabase.', 'warning');
        }
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const dataUrl = loadEvent.target.result;
          if (imgUrlInput) imgUrlInput.value = dataUrl;
          updateThumbPreview(dataUrl);
          if (!window.VTSupabase || !window.VTSupabase.isConfigured()) {
            VTApp.showToast('Photo loaded locally. Configure Supabase in Settings for permanent cloud hosting.', 'info');
          }
        };
        reader.readAsDataURL(file);
      });
    }

    if (clearImgBtn) {
      clearImgBtn.addEventListener('click', () => {
        if (imgUrlInput) imgUrlInput.value = '';
        if (imgFileInput) imgFileInput.value = '';
        updateThumbPreview('');
      });
    }

    if (addBtn && modal) {
      addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('productIdField').value = '';
        document.getElementById('productModalTitle').textContent = 'Add Building Material to Catalog';
        const orderInput = document.getElementById('productSortOrderInput');
        if (orderInput) orderInput.value = window.VTStore.getProducts().length + 1;
        if (fitSelect) fitSelect.value = 'contain';
        updateThumbPreview('');
        updateLivePreview();
        modal.classList.add('active');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset entire catalog to original factory defaults? Any custom added items will be replaced.')) {
          window.VTStore.resetProducts();
          VTApp.showToast('Catalog reset to defaults!', 'success');
          this.renderProductsTable();
          this.updateStats();
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('productIdField').value;
        const name = form.productName.value.trim();
        const category = form.productCategory.value;
        const unit = form.productUnit.value.trim();
        const wholesalePrice = form.productWholesale.value.trim();
        const stockStatus = form.productStock.value;
        const description = form.productDesc.value.trim();
        const image = imgUrlInput ? imgUrlInput.value.trim() : '';
        const imageFit = fitSelect ? fitSelect.value : 'contain';

        const sortOrderVal = form.productSortOrder ? parseInt(form.productSortOrder.value, 10) : NaN;
        const targetOrder = (!isNaN(sortOrderVal) && sortOrderVal > 0) ? sortOrderVal : undefined;

        if (!name || !unit) {
          VTApp.showToast('Material Name and Unit are required.', 'error');
          return;
        }

        const saved = window.VTStore.saveProduct({
          id: id || undefined,
          sortOrder: targetOrder,
          name,
          category,
          unit,
          wholesalePrice: wholesalePrice || 'Market Rate',
          stockStatus,
          description: description || 'High grade construction material supplied by Vaibhav Traders.',
          icon: category.split('-')[0],
          image: image || 'assets/images/ultratech-cement.jpg',
          imageFit
        });

        if (id && targetOrder) {
          window.VTStore.setProductOrder(id, targetOrder);
        }

        modal.classList.remove('active');
        if (window.VTSupabase && window.VTSupabase.isConfigured()) {
          VTApp.showToast('✅ Material saved & synced to Live Website for all visitors!', 'success');
        } else {
          VTApp.showToast('Product saved locally. Configure Supabase in Settings to sync live to all visitors.', 'info');
        }
        this.renderProductsTable();
        this.updateStats();
      });
    }
  },

  openEditProductModal(id) {
    const modal = document.getElementById('productFormModal');
    const products = window.VTStore.getProducts();
    const p = products.find(x => x.id === id);
    const form = document.getElementById('adminProductForm');

    if (!modal || !p || !form) return;

    document.getElementById('productIdField').value = p.id;
    document.getElementById('productModalTitle').textContent = `Edit Material: ${p.name}`;
    form.productName.value = p.name;
    form.productCategory.value = p.category;
    form.productUnit.value = p.unit;
    form.productWholesale.value = p.wholesalePrice;
    form.productStock.value = p.stockStatus;
    form.productDesc.value = p.description;

    const orderInput = document.getElementById('productSortOrderInput');
    if (orderInput) {
      orderInput.value = (typeof p.sortOrder === 'number') ? p.sortOrder : (products.indexOf(p) + 1);
    }

    const fitSelect = document.getElementById('productImageFitSelect');
    if (fitSelect) fitSelect.value = p.imageFit || 'contain';

    const imgUrlInput = document.getElementById('productImageUrl');
    const imgPreview = document.getElementById('productImagePreview');
    const imgIcon = document.getElementById('productImagePlaceholderIcon');
    const clearImgBtn = document.getElementById('btnClearProductImage');

    if (imgUrlInput) imgUrlInput.value = p.image || '';
    if (p.image) {
      if (imgPreview) {
        imgPreview.src = p.image;
        imgPreview.style.display = 'block';
      }
      if (imgIcon) imgIcon.style.display = 'none';
      if (clearImgBtn) clearImgBtn.style.display = 'inline-block';
    } else {
      if (imgPreview) {
        imgPreview.src = '';
        imgPreview.style.display = 'none';
      }
      if (imgIcon) imgIcon.style.display = 'block';
      if (clearImgBtn) clearImgBtn.style.display = 'none';
    }

    // Trigger full live card preview update for this material
    const prevImg = document.getElementById('previewCardImg');
    const prevIcon = document.getElementById('previewCardIcon');
    const prevMedia = document.getElementById('previewCardMedia');
    const prevTitle = document.getElementById('previewCardTitle');
    const prevCat = document.getElementById('previewCardCategory');
    const prevDesc = document.getElementById('previewCardDesc');
    const prevUnit = document.getElementById('previewCardUnit');
    const prevPrice = document.getElementById('previewCardPrice');
    const prevStock = document.getElementById('previewCardStockBadge');

    if (prevTitle) prevTitle.textContent = p.name;
    if (prevCat) prevCat.textContent = p.category.replace('-', ' & ').toUpperCase();
    if (prevUnit) prevUnit.textContent = p.unit;
    if (prevPrice) prevPrice.textContent = p.wholesalePrice;
    if (prevDesc) prevDesc.textContent = p.description;
    if (prevStock) {
      if (p.stockStatus === 'in-stock') {
        prevStock.className = 'badge badge-success';
        prevStock.textContent = '● In Stock';
      } else {
        prevStock.className = 'badge badge-warning';
        prevStock.textContent = '● Inquire Stock';
      }
    }
    const fit = p.imageFit || 'contain';
    if (p.image) {
      if (prevImg) {
        prevImg.src = p.image;
        prevImg.style.display = 'block';
        prevImg.style.objectFit = fit;
      }
      if (prevIcon) prevIcon.style.display = 'none';
      if (prevMedia) {
        prevMedia.style.background = (fit === 'cover' ? '#0f172a' : '#f8fafc');
        prevMedia.style.padding = (fit === 'cover' ? '0' : '1rem');
      }
    } else {
      if (prevImg) {
        prevImg.src = '';
        prevImg.style.display = 'none';
      }
      if (prevIcon) prevIcon.style.display = 'flex';
      if (prevMedia) {
        prevMedia.style.background = '#f8fafc';
        prevMedia.style.padding = '1rem';
      }
    }

    modal.classList.add('active');
  },

  /* --------------------------------------------------------------------------
     3. LEADS & QUOTES MANAGEMENT PAGE LOGIC
     -------------------------------------------------------------------------- */
  initLeadsPage() {
    const table = document.getElementById('adminLeadsTable');
    if (!table || !window.VTStore) return;

    this.renderLeadsTable();
    this.bindLeadsActions();
  },

  renderLeadsTable() {
    const table = document.getElementById('adminLeadsTable');
    if (!table) return;

    const leads = window.VTStore.getLeads();

    if (leads.length === 0) {
      table.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 2rem;">No customer inquiries recorded yet.</td></tr>`;
      return;
    }

    table.innerHTML = leads.map(l => {
      const cleanPhone = l.phone.replace(/[^0-9]/g, '');
      const waMsg = encodeURIComponent(`Hello ${l.name}, this is Vaibhav from Vaibhav Traders, Thangaon. Regarding your inquiry for ${l.material} (${l.quantity}): how can we assist you with delivery and rate?`);
      const waLink = `https://wa.me/91${cleanPhone}?text=${waMsg}`;

      return `
        <tr>
          <td><small class="text-muted">${l.date}</small></td>
          <td>
            <strong>${VTApp.escapeHtml(l.name)}</strong><br>
            <a href="tel:${VTApp.escapeHtml(l.phone)}" class="text-accent">${VTApp.escapeHtml(l.phone)}</a>
          </td>
          <td>
            <strong>${VTApp.escapeHtml(l.material)}</strong><br>
            <small class="text-muted">Qty: ${VTApp.escapeHtml(l.quantity || 'N/A')}</small>
          </td>
          <td>${VTApp.escapeHtml(l.location || 'Thangaon/Sinnar')}</td>
          <td>
            <select class="form-control select-lead-status" data-id="${l.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; width: auto;">
              <option value="new" ${l.status === 'new' ? 'selected' : ''}>New</option>
              <option value="contacted" ${l.status === 'contacted' ? 'selected' : ''}>Contacted</option>
              <option value="quoted" ${l.status === 'quoted' ? 'selected' : ''}>Quoted</option>
              <option value="completed" ${l.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <a href="${waLink}" target="_blank" class="btn btn-whatsapp btn-sm" title="Reply on WhatsApp">
                WA
              </a>
              <button class="btn btn-outline btn-sm btn-del-lead" data-id="${l.id}" style="color: var(--color-danger);" title="Delete Inquiry">
                ✕
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Status change listener
    table.querySelectorAll('.select-lead-status').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = select.getAttribute('data-id');
        window.VTStore.updateLeadStatus(id, select.value);
        VTApp.showToast('Lead status updated.', 'info');
        this.updateStats();
      });
    });

    // Delete lead listener
    table.querySelectorAll('.btn-del-lead').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this inquiry record?')) {
          window.VTStore.deleteLead(id);
          VTApp.showToast('Inquiry deleted.', 'info');
          this.renderLeadsTable();
          this.updateStats();
        }
      });
    });
  },

  bindLeadsActions() {
    const exportCsvBtn = document.getElementById('btnExportLeadsCsv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const leads = window.VTStore.getLeads();
        if (leads.length === 0) {
          VTApp.showToast('No leads to export.', 'warning');
          return;
        }

        const headers = ['Date', 'Name', 'Phone', 'Material', 'Quantity', 'Location', 'Status', 'Notes'];
        const rows = leads.map(l => [
          l.date,
          `"${(l.name || '').replace(/"/g, '""')}"`,
          `"${l.phone}"`,
          `"${(l.material || '').replace(/"/g, '""')}"`,
          `"${(l.quantity || '').replace(/"/g, '""')}"`,
          `"${(l.location || '').replace(/"/g, '""')}"`,
          l.status,
          `"${(l.notes || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `Vaibhav_Traders_Customer_Leads_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        VTApp.showToast('Customer leads exported to CSV!', 'success');
      });
    }
  },

  /* --------------------------------------------------------------------------
     4. SETTINGS & CMS MANAGEMENT PAGE LOGIC
     -------------------------------------------------------------------------- */
  initSettingsPage() {
    const form = document.getElementById('adminSettingsForm');
    const backupBtn = document.getElementById('btnBackupData');
    const importInput = document.getElementById('importDataInput');

    if (!form || !window.VTStore) return;

    const s = window.VTStore.getSettings();

    // Populate current settings
    if (form.announcementText) form.announcementText.value = s.announcementText || '';
    if (form.announcementActive) form.announcementActive.checked = !!s.announcementActive;
    if (form.businessPhone) form.businessPhone.value = s.phone || '';
    if (form.businessAddress) form.businessAddress.value = s.address || '';
    if (form.googleRating) form.googleRating.value = s.googleRating || '5.0';
    if (form.adminPin) form.adminPin.value = s.adminPin || 'vaibhav2026';

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newSettings = {
        announcementText: form.announcementText.value.trim(),
        announcementActive: form.announcementActive.checked,
        phone: form.businessPhone.value.trim(),
        rawPhone: form.businessPhone.value.replace(/[^0-9]/g, ''),
        address: form.businessAddress.value.trim(),
        googleRating: form.googleRating.value.trim(),
        adminPin: form.adminPin.value.trim() || 'vaibhav2026'
      };

      window.VTStore.saveSettings(newSettings);
      VTApp.showToast('Website settings saved! Live site updated.', 'success');
    });

    // Backup JSON
    if (backupBtn) {
      backupBtn.addEventListener('click', () => {
        const json = window.VTStore.exportAllData();
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `Vaibhav_Traders_Backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        VTApp.showToast('Full website backup downloaded!', 'success');
      });
    }

    // Restore JSON
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const res = window.VTStore.importAllData(event.target.result);
          if (res.success) {
            VTApp.showToast('Website data successfully restored! Reloading...', 'success');
            setTimeout(() => window.location.reload(), 1000);
          } else {
            VTApp.showToast('Error restoring backup file: ' + res.error, 'error');
          }
        };
        reader.readAsText(file);
      });
    }

    // Supabase Cloud Storage Configuration Form
    const supabaseForm = document.getElementById('supabaseConfigForm');
    const urlInput = document.getElementById('supabaseUrlInput');
    const keyInput = document.getElementById('supabaseAnonKeyInput');
    const bucketInput = document.getElementById('supabaseBucketInput');
    const statusBadge = document.getElementById('supabaseStatusBadge');
    const testBtn = document.getElementById('btnTestSupabase');

    const updateSupabaseBadge = () => {
      if (!statusBadge) return;
      if (window.VTSupabase && window.VTSupabase.isConfigured()) {
        statusBadge.className = 'badge badge-success';
        statusBadge.textContent = '● Connected & Active';
      } else {
        statusBadge.className = 'badge badge-warning';
        statusBadge.textContent = 'Not Connected';
      }
    };

    if (window.VTSupabase) {
      const cfg = window.VTSupabase.getConfig();
      if (urlInput && cfg.url && !cfg.url.includes('your-project.supabase.co')) urlInput.value = cfg.url;
      if (keyInput && cfg.anonKey) keyInput.value = cfg.anonKey;
      if (bucketInput && cfg.bucketName) bucketInput.value = cfg.bucketName;
      updateSupabaseBadge();
    }

    if (supabaseForm) {
      supabaseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = urlInput.value.trim();
        const key = keyInput.value.trim();
        const bucket = bucketInput.value.trim() || 'product-images';

        if (!url || !key) {
          VTApp.showToast('Please provide both Supabase Project URL and Anon API Key.', 'error');
          return;
        }

        if (window.VTSupabase) {
          window.VTSupabase.saveConfig(url, key, bucket);
          updateSupabaseBadge();
          VTApp.showToast('Supabase settings saved! Verifying connection...', 'info');
          window.VTSupabase.testConnection().then(res => {
            if (res.success) {
              VTApp.showToast(res.message, 'success');
              updateSupabaseBadge();
            } else {
              VTApp.showToast('Note: ' + res.message, 'warning');
            }
          });
        }
      });
    }

    if (testBtn) {
      testBtn.addEventListener('click', async () => {
        if (!window.VTSupabase || !window.VTSupabase.isConfigured()) {
          VTApp.showToast('Please enter and save your Supabase URL & Key first.', 'warning');
          return;
        }
        VTApp.showToast('Testing Supabase Cloud connection...', 'info');
        const res = await window.VTSupabase.testConnection();
        if (res.success) {
          VTApp.showToast(res.message, 'success');
          updateSupabaseBadge();
        } else {
          VTApp.showToast('Connection check: ' + res.message, 'warning');
        }
      });
    }

    // 1-Click SQL Copy Button
    const copySqlBtn = document.getElementById('btnCopySql');
    const sqlText = document.getElementById('supabaseSqlText');
    if (copySqlBtn && sqlText) {
      copySqlBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(sqlText.value).then(() => {
          VTApp.showToast('📋 SQL Script copied! Paste it into your Supabase SQL Editor and click Run.', 'success');
        }).catch(() => {
          sqlText.select();
          document.execCommand('copy');
          VTApp.showToast('📋 SQL Script copied to clipboard!', 'success');
        });
      });
    }

    // Push local catalog to Supabase Cloud button in Settings
    const syncLocalBtn = document.getElementById('btnSyncLocalToCloud');
    if (syncLocalBtn) {
      syncLocalBtn.addEventListener('click', async () => {
        if (!window.VTSupabase || !window.VTSupabase.isConfigured()) {
          VTApp.showToast('Please configure and save your Supabase Project URL & Key first.', 'warning');
          return;
        }
        syncLocalBtn.disabled = true;
        syncLocalBtn.textContent = '⏳ Syncing...';
        VTApp.showToast('☁️ Pushing all local materials to Supabase Cloud...', 'info');
        try {
          const res = await window.VTStore.pushLocalToCloud();
          VTApp.showToast(`✅ Successfully synced ${res.count} products to Supabase Cloud! Visible to all visitors.`, 'success');
        } catch (err) {
          VTApp.showToast(`Sync failed: ${err.message}. Ensure the 'products' table was created using the SQL script.`, 'error');
        } finally {
          syncLocalBtn.disabled = false;
          syncLocalBtn.textContent = '☁️ Push Catalog to Cloud';
        }
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  VTAdmin.init();
});
