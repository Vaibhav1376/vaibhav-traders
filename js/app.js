/**
 * ==========================================================================
 * VAIBHAV TRADERS - CLIENT UI APPLICATION LOGIC
 * Navigation, announcements, dynamic contacts, toasts, WhatsApp trigger
 * ==========================================================================
 */

const VTApp = {
  init() {
    this.bindHeaderScroll();
    this.bindMobileNav();
    this.renderAnnouncement();
    this.syncDynamicSettings();
    this.highlightActiveNav();
    this.bindWhatsAppButtons();
    this.initScrollAnimations();

    window.addEventListener('vt:settings-synced', () => {
      this.renderAnnouncement();
      this.syncDynamicSettings();
    });

    if (window.VTStore && typeof window.VTStore.syncWithCloud === 'function') {
      window.VTStore.syncWithCloud();
    }
  },

  // Header Elevation on Scroll
  bindHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const onScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  },

  // Mobile Hamburger & Drawer
  bindMobileNav() {
    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    const drawer = document.querySelector('.mobile-drawer');
    const overlay = document.querySelector('.mobile-overlay');
    const closeBtn = document.querySelector('.mobile-drawer-close');

    if (!toggleBtn || !drawer) return;

    const toggle = (open) => {
      const isOpen = open !== undefined ? open : !drawer.classList.contains('open');
      drawer.classList.toggle('open', isOpen);
      toggleBtn.classList.toggle('active', isOpen);
      if (overlay) overlay.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    toggleBtn.addEventListener('click', () => toggle());
    if (closeBtn) closeBtn.addEventListener('click', () => toggle(false));
    if (overlay) overlay.addEventListener('click', () => toggle(false));

    // Close on navigation click inside drawer
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggle(false));
    });
  },

  // Dynamic Announcement Bar (synced from VTStore)
  renderAnnouncement() {
    const bar = document.querySelector('.announcement-bar');
    if (!bar || !window.VTStore) return;

    const settings = window.VTStore.getSettings();
    if (settings.announcementActive && settings.announcementText) {
      bar.innerHTML = `
        <span><span class="badge-live">Notice</span> ${this.escapeHtml(settings.announcementText)}</span>
        <a href="contact.html" style="margin-left: 8px;">Order Now &rarr;</a>
      `;
      bar.style.display = 'flex';
    } else {
      bar.style.display = 'none';
    }
  },

  // Sync phone, address, and ratings across UI elements
  syncDynamicSettings() {
    if (!window.VTStore) return;
    const settings = window.VTStore.getSettings();

    // Phones
    document.querySelectorAll('.vt-phone-text').forEach(el => {
      el.textContent = settings.phone;
    });

    document.querySelectorAll('.vt-phone-link').forEach(el => {
      el.href = `tel:+91${settings.rawPhone || '8208343594'}`;
    });

    // WhatsApp Links
    document.querySelectorAll('.vt-whatsapp-link').forEach(el => {
      const msg = encodeURIComponent("Hello Vaibhav Traders, I am inquiring about building materials (cement/steel/sand/bricks) for my project.");
      el.href = `https://wa.me/${settings.whatsappNumber}?text=${msg}`;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    });

    // Address
    document.querySelectorAll('.vt-address-text').forEach(el => {
      el.textContent = settings.address;
    });

    // Rating
    document.querySelectorAll('.vt-rating-score').forEach(el => {
      el.textContent = settings.googleRating;
    });

    // GST Number
    document.querySelectorAll('.vt-gst-text').forEach(el => {
      el.textContent = settings.gstNumber || '27BIBPK5954M1ZS';
    });
  },

  // Active Link Highlight
  highlightActiveNav() {
    // Normalize path by removing trailing slash, leading slash, and query params
    let path = window.location.pathname.toLowerCase().split('?')[0].replace(/\/+$/, '');
    const pageSegment = path.split('/').pop() || ''; // e.g. "products", "products.html", "about", ""
    const isHomePage = (pageSegment === '' || pageSegment === 'index' || pageSegment === 'index.html');

    const navLinks = document.querySelectorAll('.nav-link, .drawer-nav-link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      // Normalize href: "products.html" -> "products", "index.html" -> "index"
      const cleanHref = href.toLowerCase().replace(/^\.\//, '').replace('.html', '').replace(/^\//, '');

      let isActive = false;
      if (isHomePage) {
        isActive = (cleanHref === 'index' || cleanHref === '' || cleanHref === './');
      } else {
        const normalizedPage = pageSegment.replace('.html', '');
        isActive = (cleanHref === normalizedPage);
      }

      if (isActive) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  // Bind custom action buttons for WhatsApp Quotes
  bindWhatsAppButtons() {
    const buttons = document.querySelectorAll('[data-whatsapp-material]');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const material = btn.getAttribute('data-whatsapp-material');
        const settings = window.VTStore.getSettings();
        const msg = encodeURIComponent(`Hello Vaibhav Traders, I would like to get the best wholesale/retail rate for: *${material}*. Please share available stock and delivery details.`);
        window.open(`https://wa.me/${settings.whatsappNumber}?text=${msg}`, '_blank');
      });
    });
  },

  // Toast Notification System
  showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${this.escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // Scroll Reveal & Micro-Interactions Observer
  initScrollAnimations() {
    // Keep admin pages completely static and immediate
    if (window.location.pathname.toLowerCase().includes('/admin/')) {
      return;
    }

    // Automatically attach reveal class to cards, section headers, and feature items
    const elementsToAnimate = document.querySelectorAll(
      '.card, .feature-card, .section-header, .review-card, .contact-card-item, .calculator-card, .hero-content'
    );

    elementsToAnimate.forEach((el, index) => {
      if (!el.classList.contains('reveal') && !el.classList.contains('hero-content')) {
        el.classList.add('reveal');
        // Add subtle stagger to grid items
        const delayClass = `reveal-delay-${(index % 4) + 1}`;
        el.classList.add(delayClass);
      }
    });

    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal, .reveal-fade, .reveal-scale').forEach(el => {
      observer.observe(el);
    });
  },

  // Helpers
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  VTApp.init();
});
