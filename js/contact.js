/**
 * ==========================================================================
 * VAIBHAV TRADERS - CONTACT & INQUIRY HANDLER
 * Validates inputs, saves leads into store, triggers direct WhatsApp
 * ==========================================================================
 */

const VTContact = {
  init() {
    this.bindContactForm();
    this.bindDirectQuoteForm();
  },

  bindContactForm() {
    const form = document.getElementById('mainContactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.senderName.value.trim();
      const phone = form.senderPhone.value.trim();
      const material = form.senderMaterial.value.trim();
      const location = form.senderLocation.value.trim();
      const message = form.senderMessage.value.trim();

      if (!name || !phone) {
        VTApp.showToast('Please provide your name and valid contact number.', 'error');
        return;
      }

      // Add to store
      window.VTStore.addLead({
        name,
        phone,
        material: material || 'General Building Material',
        quantity: 'Inquiry details in notes',
        location: location || 'Thangaon / Sinnar',
        type: 'Website Contact Form',
        notes: message || 'Contact form submission'
      });

      form.reset();
      VTApp.showToast('Thank you! Your inquiry has been registered. Connecting to WhatsApp...', 'success');

      // WhatsApp direct
      const settings = window.VTStore.getSettings();
      const waMsg = encodeURIComponent(
        `*New Inquiry - Vaibhav Traders Website*\n\n` +
        `👤 *Name:* ${name}\n` +
        `📞 *Phone:* ${phone}\n` +
        `📍 *Location:* ${location || 'Thangaon / Sinnar'}\n` +
        `🧱 *Material Required:* ${material || 'All types'}\n` +
        `📝 *Message:* ${message || 'Please contact me for rate quotation.'}`
      );

      setTimeout(() => {
        window.open(`https://wa.me/${settings.whatsappNumber}?text=${waMsg}`, '_blank');
      }, 700);
    });
  },

  bindDirectQuoteForm() {
    const form = document.getElementById('homeQuickQuoteForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.quickName.value.trim();
      const phone = form.quickPhone.value.trim();
      const material = form.quickMaterial.value;

      if (!name || !phone) {
        VTApp.showToast('Please enter your name and phone number.', 'error');
        return;
      }

      window.VTStore.addLead({
        name,
        phone,
        material,
        quantity: 'Quick quote request',
        location: 'Thangaon, Sinnar',
        type: 'Homepage Quick Quote',
        notes: 'Requested immediate wholesale pricing callback.'
      });

      form.reset();
      VTApp.showToast('Quote requested! Opening WhatsApp...', 'success');

      const settings = window.VTStore.getSettings();
      const waMsg = encodeURIComponent(
        `*Quick Rate Inquiry - Vaibhav Traders*\n\n` +
        `👤 *Name:* ${name}\n` +
        `📞 *Contact:* ${phone}\n` +
        `📦 *Material:* ${material}\n` +
        `Please share the current wholesale & retail price list.`
      );

      setTimeout(() => {
        window.open(`https://wa.me/${settings.whatsappNumber}?text=${waMsg}`, '_blank');
      }, 600);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  VTContact.init();
});
